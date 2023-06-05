# cam-monitor

A quick hack: WebRTC based camera monitoring application with support for multiple browser based clients that allow users to monitor multiple camera feeds at once.

Client: 
- Can be any device with a camera and a browser to capture and stream video to server.

Server:
- NodeJS server can be hosted on Raspberry PI to receive and store the video stream on local.  
- Cleanup Job incuded for storage management.

Notes:
- Contains both server and client (inside server/public/)
- Precompiled FFMPEG library for ARM availabe in directory: /ffmpeg-precompiled-raspberry-pi.
