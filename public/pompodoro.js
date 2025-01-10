let timer;
let isRunning = false;
let timeLeft = 25 * 60;
    
const startButton = document.getElementById('start-timer');
const resetButton = document.getElementById('reset-timer');
const minutesSpan = document.getElementById('minutes');
const secondsSpan = document.getElementById('seconds');
    
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesSpan.textContent = minutes.toString().padStart(2, '0');
    secondsSpan.textContent = seconds.toString().padStart(2, '0');
}
    
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timer = setInterval(() => {
    if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        alert('Time is up!');
    } else {
        timeLeft--;
        updateTimer();
    }
        }, 1000);
    }
    
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        timeLeft = 25 * 60;
        updateTimer();
    }
    
    startButton.addEventListener('click', startTimer);
    resetButton.addEventListener('click', resetTimer);

updateTimer();