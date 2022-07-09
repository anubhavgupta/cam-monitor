var socket = io();

socket.on('connect', ()=>{
    console.log('connected');
});

socket.on('disconnect', (reason)=>{
    console.log('Disconnected: ', reason);
});

socket.on("connect_error", (error) => {
    console.log('Connection Error: ', error);
  });

export {
    socket
};
