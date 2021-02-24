let currentStream = null;
async function getCameraList() {
    const deviceList = await window.navigator.mediaDevices.enumerateDevices();
    const cameraList = deviceList
       .filter(({ kind })=> kind == "videoinput")
       .map((item, index)=> [item, `Camera ${index}`]);

   return cameraList; 
}

async function switchToCamera(camera) {
    if(currentStream) {
        currentStream
            .getTracks()
            .forEach((track)=> track.stop());
    }
    try {
        const stream = await window.navigator.mediaDevices.getUserMedia(
            {
                video: { 
                          deviceId: { exact: camera.deviceId },
                          width: { ideal: 4096 },
                          height: { ideal: 2160 } 
                       }
            }   
        );
        currentStream = stream;
    } catch(ex) {
        console.log('unable to get stream', ex);
        currentStream = null;
    }
    return currentStream;
}

export {
    getCameraList,
    switchToCamera
}

