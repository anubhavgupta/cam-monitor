import { getCameraList, switchToCamera } from './camera.js';
import { recordVideo } from './recorder.js';
import { setupRTCClientSender } from './RTCClient.js';

(async function () {
    const video = document.querySelector("#video1");
    const [desiredCamera] = await getCameraList();
    const stream = await switchToCamera(desiredCamera);        
    video.srcObject = stream;
    video.play();   
    recordVideo(stream);
    setupRTCClientSender(stream);
})();