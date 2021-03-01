const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path  = require('path');
const fs = require('fs');
const serveIndex = require('serve-index');
const { setupRTCServer } = require('./RTCServer.js');
const recordingDirectory = path.join(__dirname, 'public', 'recordings');
const CHUNK_INTERVAL = 10;
const VIDEO_SEGMENT_LENGTH = 100000;

const { 
     tryStartRecording,
     onRecordingDataReceived,
     onRecordingStopped,
     onCameraNameReceived,
     setRecordingInterval,
     fixRecording
} = require('./recording.js');
const { performCleanup }  = require('./disk-cleanup.js');

// disk cleanup
performCleanup(60* 1000);

app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/recordings',
    express.static(path.join(__dirname, 'public','recordings')), 
    serveIndex(path.join(__dirname, 'public', 'recordings'), { icons: true})
);

app.get('/', (req, res) => {
    console.log("received...")
    res.sendFile(__dirname + "/index.html")
});

app.get('/live', (req, res) => {
    console.log("received...")
    res.sendFile(__dirname + "/live.html")
});

const connectionMap = new Map();

io.on('connection', (soc) => {
    console.log("Client connected...")

    onCameraNameReceived(soc, (camName)=>{
        connectionMap.set(soc, { camName });

        tryStartRecording(soc, CHUNK_INTERVAL, ()=>{
            console.log('recording started....');
            // craete file name with time stamp + camname
            const date = new Date();
            const fileName = `${camName}_${date.getMilliseconds()}_${date.toTimeString().split(" ")[0].replace(/:/g, "_")}_${date.toDateString().replace(/\s/g, "_")}.webm`;
            const filePath = path.join(recordingDirectory, fileName);
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
            if(connectionData.writeStream){
                connectionData.writeStream.write(buff);
            } else {
                console.log('stream not available');
            }
        });
    
        onRecordingStopped(soc,(reason, error)=>{
            const connectionData = connectionMap.get(soc);
            if(reason === 'disconnected') {
                connectionMap.delete(soc);
            }
            if(connectionData.writeStream) {
                connectionData.writeStream.end();
                connectionData.writeStream = null;
                fixRecording(recordingDirectory, connectionData.fileName);
                console.log(reason, error, connectionData);
                console.log(`Closing file ${connectionData.fileName}`, connectionMap.size);
            }
        });

        setRecordingInterval(soc, CHUNK_INTERVAL, VIDEO_SEGMENT_LENGTH);
    });

    setupRTCServer(connectionMap, io, soc);
    
});

http.listen(3000, ()=>{
    console.log("listening...")
})