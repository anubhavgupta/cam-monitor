import { socket } from './socket.js';

function recordVideo(stream) {
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
    });
    let fileReaderQueue = [];
    const fileReader = new FileReader();

    fileReader.addEventListener('load', ()=>{
        socket.emit("rec-data", fileReader.result);
        if(fileReaderQueue.length) {
            const data = fileReaderQueue.shift();
            fileReader.readAsDataURL(data);
        }
    });

    recorder.ondataavailable = (e) => {
        if(e.data && e.data.size > 0) {
            if(fileReader.readyState == 1) {
                fileReaderQueue.push(e.data);
            } else {
                fileReader.readAsDataURL(e.data);
            }
        }
    };

    recorder.onstop = () => {
        socket.emit("rec-stopped");
        console.log('rec-stopped, sent');
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