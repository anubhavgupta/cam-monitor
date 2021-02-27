// async function reloadDevice() {
//     soc.emit('rec-reload');
//     await new Promise(res => setTimeout(res), 2000);
// }

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
        onStop = ()=>{};
    }
    soc.on('disconnect', ()=>{
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

function onRecordingInterval(time, cb) {
    setInterval(cb, time);
}


module.exports = {
    tryStartRecording,
    onRecordingDataReceived,
    onRecordingStopped,
    onCameraNameReceived,
    onRecordingInterval
}
