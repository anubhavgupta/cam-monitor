import { addDataToVideoBuffer } from './SingleVideoSource.js';

function recordVideo(stream) {
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
    });
    const streamData = [];
    recorder.ondataavailable = (e) => {
        if(e.data && e.data.size > 0) {
            streamData.push(e.data);
            console.log(e.data);
           addDataToVideoBuffer(e.data);
        }
    };
    recorder.onstop = ()=>{
        const down = document.querySelector('#download');
        window.d = streamData;
        const allData = new Blob(streamData, {
            type: "video/webm;codecs=vp8"
        });
        const resultStreamURL = URL.createObjectURL(allData);
        down.href = resultStreamURL;
        down.download = "video.webm";
    }

    


    // const req = setInterval(()=>{
    //     recorder.requestData();
    //     //stream.getTracks().forEach(track=> track.stop());
    //     //recorder.start();
    // },  100);
    setTimeout(()=>{
        //clearInterval(req);
        recorder.stop();
    },  50000);
    //setInterval(()=>recorder.requestData(), 100);
    recorder.start(100);
        return async () =>{
        const stopPromise = new Promise((res, rej)=>{
            recorder.onstop = res;
            recorder.onerror = rej;
        });
        recorder.stop();
        await stopPromise;
        return streamData;
    }
}

export {
    recordVideo
};