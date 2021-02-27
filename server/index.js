const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path  = require('path');
const fs = require('fs');
const { 
     tryStartRecording,
     onRecordingDataReceived,
     onRecordingStopped,
     onCameraNameReceived,
     onRecordingInterval
    } = require('./recording.js');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    console.log("received...")
    res.sendFile(__dirname + "/index.html")
});

const connectionMap = new Map();

io.on('connection', (soc) => {
    console.log("Client connected...")

    onCameraNameReceived(soc, (camName)=>{
        connectionMap.set(soc, { camName });

        tryStartRecording(soc, 10, ()=>{
            console.log('recording started....');
            // craete file name with time stamp + camname
            const date = new Date();
            const fileName = `${camName}_${date.getMilliseconds()}_${date.toTimeString().split(" ")[0].replace(/:/g, "_")}_${date.toDateString().replace(/\s/g, "_")}.webm`;
            const filePath = path.join(__dirname, 'public', 'recordings', fileName);
            const writeStream = fs.createWriteStream(filePath);
            
            // update data
            const connectionData = connectionMap.get(soc);
            connectionData.fileName = fileName;
            connectionData.writeStream = writeStream;
            connectionMap.set(soc, connectionData);

            console.log(`Create new file ${connectionData.fileName}`);
            
        });
    
        onRecordingDataReceived(soc, (data)=>{
            const connectionData = connectionMap.get(soc);
            const buff = Buffer.from(data.split(",")[1], 'base64');
            connectionData.writeStream.write(buff);
            console.log(`Writing data with size ${data.length} to file ${connectionData.fileName}`);
        });
    
        onRecordingStopped(soc,(reason, error)=>{
            const connectionData = connectionMap.get(soc);
            if(reason === 'disconnected') {
                connectionMap.delete(soc);
            }
            connectionData.writeStream && connectionData.writeStream.end();
            console.log(reason, error, connectionData);
            console.log(`Closing file ${connectionData.fileName}`, connectionMap.size);
        });
    })

    
    
});

http.listen(3000, ()=>{
    console.log("listening...")
})