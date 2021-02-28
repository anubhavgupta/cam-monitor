function setupRTCServer(connectionsMap,io, soc) {

    soc.on('rtc-cam-count', ()=>{
        const allConnections = [];
        for( let [soc, connectionData] of connectionsMap.entries())  {
            allConnections.push({id: soc.id, camName: connectionData.camName});
        }   
        soc.emit('rtc-cam-count-response', allConnections);
    });

    soc.on('init-rtc', (socId)=>{

        const targetSoc = io.of("/").sockets.get(socId);
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


        soc.on('rtc-offer', (offer)=>{
            targetSoc.emit('rtc-offer', offer);
        });
        targetSoc.on('rtc-answer', (answer)=>{
            soc.emit('rtc-answer', answer);
        });

    });
}

module.exports = {
    setupRTCServer
}