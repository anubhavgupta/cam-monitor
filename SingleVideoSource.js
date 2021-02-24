let mediaSource;
let videoEl;
let videoBuff;
let afterSourceReady;
let fileReader;

function createMediaSource() {
    mediaSource = new MediaSource();
    const mediaURL = URL.createObjectURL(mediaSource);
    const videoEl = document.querySelector('#video2');
    videoEl.src = mediaURL;
    afterSourceReady = new Promise((res)=>{
        mediaSource.addEventListener('sourceopen', ()=>{
            videoBuff = mediaSource.addSourceBuffer('video/webm;codecs=vp8');
            // setInterval(()=>{
            //     console.log("Current state", mediaSource.readyState)
            // }, 100);
            res();
        });
    })
    //addDataToVideoBuffer(initialVideoBlobData, true);    
}

function addDataToVideoBuffer(blobData, shouldtNotSkip) {
    if(!skipinitialdata()){
        afterSourceReady
        .then(()=>{
            const dataReadyPromise = new Promise((res) => {
                const evtList = () => {
                    res();
                    videoBuff.removeEventListener("updateend", evtList);
                };
                videoBuff.addEventListener("updateend", evtList);
            })
    
            const dataSetPromise = blobData
            .arrayBuffer()
            .then((bufferData)=>{
                videoBuff.appendBuffer(bufferData);
                
            });
            
            
            afterSourceReady = Promise.all([
                dataReadyPromise,
                dataSetPromise
            ]);
            return afterSourceReady;
        });
    } else {
        console.log('skipped...');
    }
    
}


let i=0;
function skipinitialdata() {
   i--;
   return i>0;
}

export {
    createMediaSource,
    addDataToVideoBuffer
}

// function addDataToVideoBuffer(blobData) {
//     if(!skipinitialdata()){
//         afterSourceReady
//         .then(()=>{
//             const dataReadyPromise = new Promise((res) => {
//                 const evtList = () => {
//                     res();
//                     videoBuff.removeEventListener("updateend", evtList);
//                 };
//                 videoBuff.addEventListener("updateend", evtList);
//             })
    
//             const dataSetPromise = blobData
//                     .arrayBuffer()
//                     .then((bufferData)=>{
//                         videoBuff.appendBuffer(bufferData);
//                     });
//             afterSourceReady = Promise.all([
//                 dataReadyPromise,
//                 dataSetPromise
//             ]);
//             return afterSourceReady;
//         });
//     }
    
// }