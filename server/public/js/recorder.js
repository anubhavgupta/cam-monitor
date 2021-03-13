import { socket } from './socket.js';

function recordVideo(stream) {
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
    });
    let fileReaderQueue = [];
    const fileReader = new FileReader();
    let isConvertingData = false;

    fileReader.addEventListener('load', ()=>{
        isConvertingData = false;
        socket.emit("rec-data", fileReader.result);
        if(fileReaderQueue.length) {
            const data = fileReaderQueue.shift();
            socket.emit('queue-size', `shift: ${fileReaderQueue.length}`);
            fileReader.readAsDataURL(data);
        }
    });

    recorder.ondataavailable = (e) => {
        if(e.data && e.data.size > 0) {
            if(fileReader.readyState == 1) {
                fileReaderQueue.push(e.data);
                socket.emit('queue-size', `push: ${fileReaderQueue.length}`);
            } else {
                fileReader.readAsDataURL(e.data);
                isConvertingData = true;
            }
        }
    };

    function stop() {
        socket.emit("rec-stopped");
        console.log('rec-stopped, sent');
    }

    function checkIfDataQueueEmpty() {
        return fileReaderQueue.length <= 0
    }

    function checkAndStop() {
        if(checkIfDataQueueEmpty() && !isConvertingData) {
            stop();
        } else{
            setTimeout(checkAndStop, 1000);
        }
    }

    recorder.onstop = () => {
        checkAndStop();
    }

    recorder.onerror = (e) => {
        socket.emit("rec-error", e.message);
    }


    socket.on('rec-stop', (interval)=>{
        console.log('rec-stop, received')
        recorder.stop();
    });


    socket.on('rec-start', (interval)=>{
        console.log('rec-start, received')
        recorder.start(interval || 1000);
        socket.emit("rec-started");
    });
    
}

export {
    recordVideo
};