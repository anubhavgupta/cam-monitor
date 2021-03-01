function setupRTCServer(connectionsMap,io, soc) {

    soc.on('rtc-cam-count', ()=>{
        const allConnections = [];
        for( let [socket, connectionData] of connectionsMap.entries())  {
            allConnections.push({id: socket.id, camName: connectionData.camName});
        }   
        soc.emit('rtc-cam-count-response', allConnections);
    });

    soc.on('init-rtc', (socId)=>{

        const targetSoc = io.of("/").sockets.get(socId);
        if(targetSoc) {
            targetSoc.emit('init-rtc');

            //receive ice candidates
            soc.on('rtc-ice-candidate', (candidate)=>{
                console.log('SOC TO TARGET SOC: candidate', targetSoc.connected);
                targetSoc.emit('rtc-ice-candidate', candidate);
            });
            targetSoc.on('rtc-ice-candidate', (candidate)=>{
                console.log('TARGETSOC TO SOC: candidate', soc.connected);
                soc.emit('rtc-ice-candidate', candidate);
            });


            targetSoc.on('rtc-offer', (offer)=>{
                soc.emit('rtc-offer', offer);
            });
            soc.on('rtc-answer', (answer)=>{
                targetSoc.emit('rtc-answer', answer);
            });

        }
        
    });
}

module.exports = {
    setupRTCServer
}