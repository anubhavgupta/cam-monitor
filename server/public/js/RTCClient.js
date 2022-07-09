import { socket } from './socket.js';

function setupRTCClientSender(stream) {
    socket.on('init-rtc', ()=>{

        let self = new RTCPeerConnection();

        self.onnegotiationneeded  = function () {
            if (self.signalingState != "stable") return;
             // make an offer
            self.createOffer()
            .then((offer)=>{
                socket.on('rtc-answer', rctAnswerHandler);
                return self.setLocalDescription(offer)
                .then(()=>{
                    socket.emit('rtc-offer', offer);
                });
            });

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
        const rctAnswerHandler =  (answer)=>{
            self.setRemoteDescription(new RTCSessionDescription(answer));
            socket.off('rtc-answer', rctAnswerHandler);
        };


        const connectStateChangeHandler = function(event) {
            switch(self.connectionState) {
                case "disconnected":
                case "failed":
                case "closed":
                        console.log('RTCconnection state', self.connectionState);
                        self.onicecandidate = null; 
                        socket.off('rtc-ice-candidate', onSocketICECandidateHandling);
                        self.removeEventListener('connectionstatechange', connectStateChangeHandler);    
                        self.onnegotiationneeded = null;
                        self = null;

                        // The connection has been closed
                    break;
            }
        }

        // attach tracks to the connection
        stream.getTracks().forEach(track => {
            console.log('rtc tracks added');
            self.addTrack(track, stream);
        });

       

    
        // send own ice candidates
        self.onicecandidate = onDirectICECandidateHandling; 
    
        // receive ice candidates
        socket.on('rtc-ice-candidate', onSocketICECandidateHandling);
    
        self.addEventListener('connectionstatechange', connectStateChangeHandler);    
        
    });

}

export {
    setupRTCClientSender
}
