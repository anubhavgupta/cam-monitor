import { socket } from './socket.js';
const screen1 = document.querySelector('.screen-1');
const screen2 = document.querySelector('.screen-2');
const form1 = document.querySelector('#form-1');
const heading = document.querySelector('#screen-2-heading');
const inputEl = document.querySelector('#cam-name');

let timeoutId;
form1.addEventListener('submit', (e)=>{
    clearTimeout(timeoutId);
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
    const formData = new FormData(e.target);
    const camName = (formData.get('camName') || "cam").replace(/[\s]/gi, "_"); 
    localStorage.setItem("camName", camName);
    showScreen2(camName);
});

function showScreen2(camName) {
    window.camName = camName;
    screen1.classList.add('hide');
    heading.innerText = `Using Camera ${window.camName}`;
    screen2.classList.remove('hide');
    socket.emit('rec-camera-name', window.camName);
}

function checkIfNamePresent() {
    const camName = localStorage.getItem("camName");
    if(camName) {
        const timer = document.querySelector("#timer");
        inputEl.value = camName;
        function countDown(i) {
            if(i==0) {
                showScreen2(camName);
            } else {
                updateText(i, timer);
                timeoutId = setTimeout(()=> countDown(i-1), 1000);
            }
        }
        countDown(10);
    }
}

function updateText(time, timer) {
    timer.innerText = `Enter Camera Name: (recording will auto start in ${time})`;
}

checkIfNamePresent();