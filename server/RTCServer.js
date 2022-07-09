function setupRTCServer(connectionsMap,io, soc) {
    const onCamCount = ()=>{
        const allConnections = [];
        for( let [socket, connectionData] of connectionsMap.entries())  {
            allConnections.push({id: socket.id, camName: connectionData.camName});
        }   
        soc.emit('rtc-cam-count-response', allConnections);
    }

    const onRTCInit = (socId)=>{
        const targetSoc = io.of("/").sockets.get(socId);
        const onRTCIceCandidates = (candidate)=>{
            console.log('SOC TO TARGET SOC: candidate', targetSoc.connected);
            targetSoc.emit('rtc-ice-candidate', candidate);
        }
        const onTargetSocIceCandidates =  (candidate)=>{
            console.log('TARGETSOC TO SOC: candidate', soc.connected);
            soc.emit('rtc-ice-candidate', candidate);
        }
        const onOffer = (offer)=>{
            soc.emit('rtc-offer', offer);
        };
        const onAnswer = (answer)=>{
            targetSoc.emit('rtc-answer', answer);

            // destroy
            soc.off('rtc-ice-candidate', onRTCIceCandidates);
            targetSoc.off('rtc-ice-candidate',onTargetSocIceCandidates);
            targetSoc.off('rtc-offer', onOffer);
            soc.off('rtc-answer', onAnswer);
        };
        if(targetSoc) {
            targetSoc.emit('init-rtc');

            //receive ice candidates
            soc.on('rtc-ice-candidate', onRTCIceCandidates);
            targetSoc.on('rtc-ice-candidate',onTargetSocIceCandidates);


            targetSoc.on('rtc-offer', onOffer);
            soc.on('rtc-answer', onAnswer);
        }
    };

    soc.once('rtc-cam-count', onCamCount);
    soc.once('init-rtc', onRTCInit);
}

module.exports = {
    setupRTCServer
}