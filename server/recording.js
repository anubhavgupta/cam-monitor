const ffmpeg = require('ffmpeg');
const fs = require('fs');
const path  = require('path');

class Recorder {
    constructor(soc){
        this.soc = soc;
        this.startRecordingScheduler = null;
        this.intervalScheduler = null;
        this._raiseConnectionRequest = this._raiseConnectionRequest.bind(this);
        this._listenForRecordingStartedACK = this._listenForRecordingStartedACK.bind(this);
        this._onDisconnect = this._onDisconnect.bind(this);
        this._onStopped = this._onStopped.bind(this);
        this._onError = this._onError.bind(this);
        this._onIntervalRecordingStopped = this._onIntervalRecordingStopped.bind(this);
        this._onIntervalRecordingStarted = this._onIntervalRecordingStarted.bind(this);
        this.soc.on('queue-size', this.monitorQueueSize);
    }

    monitorQueueSize(data) {
        console.log('Queue size -->', data);
    }

    _raiseConnectionRequest() {
        this.soc.emit('rec-start', this.recordingInterval);
        console.log('rec-start, sent');
        this.startRecordingScheduler = setTimeout(this._raiseConnectionRequest, 2000);
    }

    _listenForRecordingStartedACK(){
        clearTimeout(this.startRecordingScheduler);    
        console.log('rec-started, received');
        this.startRecordingCB();
    }

    tryStartRecording(interval, cb) {
        this.recordingInterval = interval;
        this.startRecordingCB = cb;
        this.soc.on('rec-started', this._listenForRecordingStartedACK);
        this._raiseConnectionRequest();
    }

    onRecordingDataReceived(cb) {
        this.onDataReceivedCB = cb;
        this.soc.on('rec-data', this.onDataReceivedCB);
    }

    _onDisconnect(reason) {
        console.log('disconnected...', reason);
        this.destroy();
        this.onStopped('disconnected', null);
    }

    _onStopped() {
        console.log('rec-stopped...');
        this.onStopped('stopped', null);
    }

    _onError(errorMessage) {
        console.log('rec-error...');
        this.onStopped('error', errorMessage);
    }

    onRecordingStopped(cb){
        this.onStopped = cb;
        this.soc.on('disconnect', this._onDisconnect);
        this.soc.on('rec-stopped',  this._onStopped);
        this.soc.on('rec-error', this._onError);
    }

    onCameraNameReceived(cb) {
        this.onCamNameReceivedCB = cb;
        this.soc.on('rec-camera-name', this.onCamNameReceivedCB);
    }

    _onIntervalRecordingStopped() {
        console.log('rec-stopped, via interval');
        this.soc.emit('rec-start', this.recordingInterval);
        console.log('rec-start, via interval');
    }

    _onIntervalRecordingStarted() {
        console.log('rec-start, via interval received');
        this.intervalScheduler = setTimeout(() => {
            this.soc.emit('rec-stop');
            console.log('rec-stop, via interval');
        }, this.videoSegmentInteval);
    }

    setRecordingInterval(videoSegmentInteval) {
        this.videoSegmentInteval = videoSegmentInteval;
        this.soc.on('rec-stopped', this._onIntervalRecordingStopped);
        this.soc.on('rec-started',this._onIntervalRecordingStarted);
    }

    fixRecording(dir, fileName) {
        const filePath = path.join(dir, fileName);
        var process = new ffmpeg(filePath);
        return process
        .then((video)=>{
            return new Promise ((res, rej)=>{
                video
                .addCommand("-c", "copy");
                video.save(path.join(dir, "processed_" + fileName), (error)=>{
                    if(error) {
                        rej(error);
                    } else {
                        res();
                    }
                })
            })
        })
        .then(()=>{
            console.log('converted file', fileName);
            fs.unlink(filePath, (error)=>{
                if(error) {
                    console.log('ERROR: unable to delete file', error);
                } else {
                    console.log('deleted file', fileName);
                }
            });
        })
        .catch((err)=>{
            console.log('ERROR: unable to convert file', err);
        });
    }

    destroy() {
        this.soc.off('rec-started', this._listenForRecordingStartedACK);
        this.soc.off('rec-data', this.onDataReceivedCB);
        this.soc.off('disconnect', this._onDisconnect);
        this.soc.off('rec-stopped',  this._onStopped);
        this.soc.off('rec-error', this._onError);
        this.soc.off('rec-camera-name', this.onCamNameReceivedCB);
        this.soc.off('rec-stopped', this._onIntervalRecordingStopped);
        this.soc.off('rec-started',this._onIntervalRecordingStarted);
        this.soc.off('queue-size', this.monitorQueueSize);
        clearTimeout(this.intervalScheduler);
        this.soc = null;
    }
}

module.exports = {
    Recorder
}
