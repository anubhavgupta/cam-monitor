import { getCameraList, switchToCamera } from './camera.js';
import { recordVideo } from './recorder.js';
import { createMediaSource } from './SingleVideoSource.js';

(async function () {
    createMediaSource();
    const video = document.querySelector("#video1");
    const [desiredCamera] = await getCameraList();
    const stream = await switchToCamera(desiredCamera);        
    video.srcObject = stream;
    video.play();   
    recordVideo(stream);
})();