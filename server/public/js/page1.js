import { socket } from './socket.js';
const screen1 = document.querySelector('.screen-1');
const screen2 = document.querySelector('.screen-2');
const form1 = document.querySelector('#form-1');
const heading = document.querySelector('h1');


form1.addEventListener('submit', (e)=>{
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
    const formData = new FormData(e.target);
    window.camName = (formData.get('camName') || "cam").replace(/[\s]/gi, "_"); 
    screen1.classList.add('hide');
    heading.innerText = `Using Camera ${window.camName}`;
    screen2.classList.remove('hide');
    socket.emit('rec-camera-name', window.camName);
})