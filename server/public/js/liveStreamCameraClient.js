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
    video.controls = true;
    video.muted = true;
    video.autoplay = true;
    video.width = 400;
    video.height = 400;
    videoBox.appendChild(label);
    videoBox.appendChild(video);
    container.appendChild(videoBox);
    return video;
}


async function initConnection(serverSoc, socId, videoEl, camName) {
    const self = new RTCPeerConnection();
    return new Promise((res)=>{
        self.onnegotiationneeded  = function () {
            console.log('degotiation needed', self.signalingState);
    
        }
        
        const offerHandling = (offer)=>{
            console.log('rtc handling');
            self.setRemoteDescription(new RTCSessionDescription(offer))
            .then(()=>self.createAnswer())
            .then(answer => self.setLocalDescription(answer))
            .then(()=>{
                console.log('rtc sent answer');
                socket.emit('rtc-answer', self.localDescription);
                serverSoc.off('rtc-offer', offerHandling);
            })
        }

        const candidateHandling = (candidate)=>{
            self.addIceCandidate(candidate);
        };
        //serverSoc.on is registering twice
        serverSoc.on('rtc-offer', offerHandling);
    
        serverSoc.emit('init-rtc', socId);
    
        // receive ice candidates
        serverSoc.on('rtc-ice-candidate', candidateHandling);
    
        // send own ice candidates
        self.onicecandidate = function (e) {
            console.log('rtc-ice-candidate received');
            if(e.candidate) {
                serverSoc.emit('rtc-ice-candidate', e.candidate);
            }
        }
    
        
    
        self.ontrack = (e)=>{
            videoEl.srcObject = e.streams[0];
            videoEl.play().then(()=>{
                serverSoc.off('rtc-ice-candidate', candidateHandling);
                res(self);
            });
        };
        self.onconnectionstatechange =function(event) {
            console.log(camName, self.connectionState);
            // if(self.connectionState === 'connected') {
            //     res();
            // }
        };
    });
    
}

async function main() {
    let camsData = await getCams();
    camsData = camsData.map(camData => {
        camData.videoEl = appendAndGetVideoElement(camData);
        return camData;
    });
    window.connections = [];
    for (var data of camsData) {
        console.log(data, camsData);
        const connection = await initConnection(socket, data.id, data.videoEl, data.camName);
        connections.push(connection);
        console.log('init connection', data);
    }
}

main();