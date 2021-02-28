import { socket } from './socket.js';

function setupRTCClientSender(stream) {
    socket.on('init-rtc', ()=>{
        let self = new RTCPeerConnection();
        stream.getTracks().forEach(track => {
            console.log('rtc tracks added');
            self.addTrack(track, stream);
        });

        const offerHandling = (offer)=>{
            console.log('rtc handling');
            self.setRemoteDescription(new RTCSessionDescription(offer))
            .then(()=>self.createAnswer())
            .then(answer => self.setLocalDescription(answer))
            .then(()=>{
                console.log('rtc sent answer');
                socket.emit('rtc-answer', self.localDescription);
            })
        }
        const onSocketICECandidateHandling  =  (candidate)=>{
            console.log('rtc scoket ice handling');
            self.addIceCandidate(candidate);
        };

        const onDirectICECandidateHandling = function (e) {
            console.log('rtc direct ice handling');
            if(e.candidate) {
                socket.emit('rtc-ice-candidate', e.candidate);
            }
        };
    
        // send own ice candidates
        self.onicecandidate = onDirectICECandidateHandling; 
    
        // receive ice candidates
        socket.on('rtc-ice-candidate', onSocketICECandidateHandling);
    
        // handle offer and respond with answer
        socket.on('rtc-offer', offerHandling);


        self.onconnectionstatechange =function(event) {
            switch(self.connectionState) {
              case "disconnected":
              case "failed":
              case "closed":
                  console.log('RTCconnection state', self.connectionState);
                self.onicecandidate = onDirectICECandidateHandling; 
                socket.off('rtc-ice-candidate', onSocketICECandidateHandling);
                socket.off('rtc-offer', offerHandling);                  
                self = null;
                // The connection has been closed
                break;
            }
          };    
    });

}

export {
    setupRTCClientSender
}
