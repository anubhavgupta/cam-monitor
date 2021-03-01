// async function reloadDevice() {
//     soc.emit('rec-reload');
//     await new Promise(res => setTimeout(res), 2000);
// }
const ffmpeg = require('ffmpeg');
const fs = require('fs');
const path  = require('path');

function tryStartRecording(soc, interval, cb) {
    let scheduler;
    function raiseConnectionRequest() {
        soc.emit('rec-start', interval);
        console.log('rec-start, sent');
        scheduler = setTimeout(raiseConnectionRequest, 2000);
    }

    function listenForAck() {
        clearTimeout(scheduler);    
        console.log('rec-started, received');
        cb();
    }

    soc.on('rec-started', listenForAck);
    raiseConnectionRequest();
}

function onRecordingDataReceived(soc, cb) {
    soc.on('rec-data',cb);
}

function onRecordingStopped(soc, cb) {
    let onStop = (reason, error)=>{
        cb(reason, error);
    }
    soc.on('disconnect', ()=>{
        //clearInterval(recordingIntervalScheduler);
        console.log('disconnected...');
        onStop('disconnected', null);
    });

    soc.on('rec-stopped',  ()=>{
        console.log('rec-stopped...');
        onStop('stopped', null);
    });

    soc.on('rec-error',  (errorMessage)=>{
        console.log('rec-error...');
        onStop('error', errorMessage);
    });
}

function onCameraNameReceived(soc, cb) {
    soc.on('rec-camera-name',cb);
}

function setRecordingInterval(soc, chunkInterval, videoSegmentInteval) {
    
    soc.on('rec-stopped', ()=>{
        process.nextTick(()=>{
            soc.emit('rec-start', chunkInterval);
        })
    });

    soc.on('rec-started', ()=>{
        setTimeout(function () {
            soc.emit('rec-stop');
            console.log('rec-stop, via interval');
        }, videoSegmentInteval);
    });

    
}

async function fixRecording(dir, fileName) {
    const filePath = path.join(dir, fileName);
    var process = new ffmpeg(filePath);
    const video = await process;
    await new Promise ((res)=>{
        video
        .addCommand("-c", "copy");
        video.save(path.join(dir, "processed_" + fileName), (error)=>{
            fs.unlink(filePath, (error)=>{
                if(error) {
                    console.log('unable to delete file', error);
                } else {
                    console.log('deleted file');
                }
                res();
            });
            if(error) {
                console.log('unable to convert file', error);
            } else {
                console.log('converted file');
            }
        });
    })
    
    
}

module.exports = {
    tryStartRecording,
    onRecordingDataReceived,
    onRecordingStopped,
    onCameraNameReceived,
    setRecordingInterval,
    fixRecording
}
