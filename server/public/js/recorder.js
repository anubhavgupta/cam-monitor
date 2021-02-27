import { socket } from './socket.js';

function recordVideo(stream) {
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
    });
    const fileReader = new FileReader();

    fileReader.addEventListener('load', ()=>{
        socket.emit("rec-data", fileReader.result);
    });

    recorder.ondataavailable = (e) => {
        if(e.data && e.data.size > 0) {
            fileReader.readAsDataURL(e.data);
        }
    };

    recorder.onstop = () => {
        socket.emit("rec-stopped");
    }

    recorder.onerror = (e) => {
        socket.emit("rec-error", e.message);
    }


    socket.on('rec-stop', (interval)=>{
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