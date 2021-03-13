const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { perMessageDeflate: false });
const path  = require('path');
const fs = require('fs');
const serveIndex = require('serve-index');
const { setupRTCServer } = require('./RTCServer.js');
const recordingDirectory = path.join(__dirname, 'public', 'recordings');
const CHUNK_INTERVAL = 10;
const VIDEO_SEGMENT_LENGTH = 5 * 60 * 1000;
const MIN_BUFFER_DISK_SPACE_IN_GB = 1.5;

const { 
    Recorder
} = require('./recording.js');
const { performCleanup }  = require('./disk-cleanup.js');

// disk cleanup
performCleanup(60* 1000, MIN_BUFFER_DISK_SPACE_IN_GB);

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
    let rec = new Recorder(soc);

    rec.onCameraNameReceived((camName)=>{
        connectionMap.set(soc, { camName });

        rec.tryStartRecording(CHUNK_INTERVAL, ()=>{
            console.log('recording started....');
            // craete file name with time stamp + camname
            const date = new Date();
            const fileName = `${camName}_${date.toTimeString().split(" ")[0].replace(/:/g, "_")}_${date.getMilliseconds()}_${date.toDateString().replace(/\s/g, "_")}.webm`;
            const filePath = path.join(recordingDirectory, fileName);
            const writeStream = fs.createWriteStream(filePath);
            
            // update data
            const connectionData = connectionMap.get(soc);
            connectionData.fileName = fileName;
            connectionData.writeStream = writeStream;
            connectionMap.set(soc, connectionData);

            console.log(`Create new file ${connectionData.fileName}`);
        });
    
        rec.onRecordingDataReceived((data)=>{
            const connectionData = connectionMap.get(soc);
            const buff = Buffer.from(data.split(",")[1], 'base64');
            if(connectionData.writeStream){
                connectionData.writeStream.write(buff);
            } else {
                console.log('stream not available');
            }
        });
    
        rec.onRecordingStopped((reason, error)=>{
            const connectionData = connectionMap.get(soc);
            if(connectionData.writeStream) {
                connectionData.writeStream.end();
                connectionData.writeStream = null;
                rec.fixRecording(recordingDirectory, connectionData.fileName);
                console.log(reason, error, connectionData);
                console.log(`Closing file ${connectionData.fileName}`, connectionMap.size);
            }
            if(reason === 'disconnected') {
                connectionMap.delete(soc);
                rec = null;
            }
        });

        rec.setRecordingInterval(VIDEO_SEGMENT_LENGTH);
    })

    setupRTCServer(connectionMap, io, soc);
    
});

http.listen(process.argv[2] || 3000, ()=>{
    console.log("listening...")
})