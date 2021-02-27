let currentStream = null;
async function getCameraList() {
    const deviceList = await window.navigator.mediaDevices.enumerateDevices();
    const cameraList = deviceList
       .filter(({ kind })=> kind == "videoinput")
       .map((item, index)=> {
        const facingMode = !!~item.getCapabilities().facingMode.indexOf("environment");
        return [item, `Camera ${index}`, facingMode]
       });

    const supportedCameraList = cameraList.map(item => {
        const facingMode = !!~item[0].getCapabilities().facingMode.indexOf("environment");
        return [...item, facingMode]
       })
       .filter((item) => item[2]);

    if(supportedCameraList.length) {
        return supportedCameraList;
    } 
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
                          //deviceId: { exact: camera.deviceId },
                           width: { ideal: 1280  },
                           height: { ideal: 720 },
                          facingMode: { ideal: "environment" }
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

