import { socket } from "./socket.js";
const container = document.querySelector(".container");

async function getCams() {
    return new Promise((res)=>{
        socket.on('rtc-cam-count-response', res);
        socket.emit('rtc-cam-count');
    });
}

function appendAndGetVideoElement(cam) {
    const videoBox = document.createElement("div");
    videoBox.classList.add('video-box');
    const label = document.createElement("label");
    label.innerText = cam.camName;
    const video = document.createElement("video");
    video.setAttribute('autoplay', "true");
    videoBox.appendChild(label);
    videoBox.appendChild(video);
    container.appendChild(videoBox);
    return video;
}


async function initConnection(serverSoc, socId, videoEl) {
    const self = new RTCPeerConnection();
    navigator.mediaDevices
    .getUserMedia({video: true, audio: true})
    .then((stream)=>{
        stream.getTracks().forEach(track => {
            console.log('rtc tracks added');
            self.addTrack(track, stream);
        });
    })
    .then(()=>self.createOffer())
    .then((offer)=>{
        serverSoc.on('rtc-answer', (answer)=>{
            self.setRemoteDescription(new RTCSessionDescription(answer));
        });
        return self.setLocalDescription(offer)
        .then(()=>{
            serverSoc.emit('rtc-offer', offer);
        });
    });
    serverSoc.emit('init-rtc', socId);

    // receive ice candidates
    serverSoc.on('rtc-ice-candidate', (candidate)=>{
        self.addIceCandidate(candidate);
    });

    // send own ice candidates
    self.onicecandidate = function (e) {
        console.log('rtc-ice-candidate received');
        if(e.candidate) {
            serverSoc.emit('rtc-ice-candidate', e.candidate);
        }
    }

    

    self.ontrack = (e)=>{
        videoEl.srcObject = e.streams[0];
    };
    self.onconnectionstatechange =function(event) {
        console.log(self.connectionState);
    };
}

async function main() {
    let camsData = await getCams();
    camsData = camsData.map(camData => {
        camData.videoEl = appendAndGetVideoElement(camData);
        return camData;
    });
    for(var data of camsData) {
        initConnection(socket, data.id, data.videoEl);
        console.log('init connection', data);
    }
}

main();