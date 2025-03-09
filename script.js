let time = 600;
let interval;
const countdownEl = document.getElementById("countdown");
const eventsContainer = document.getElementById("events-container");
const startPauseBtn = document.getElementById("startPauseBtn");
const eventTimes = { 600: "T-10 minutes: Systems Check", 0: "Liftoff!" };
let displayedEvents = new Set();
let liftoffReached = false;

function updateDisplay() {
    let minutes = Math.floor(Math.abs(time) / 60);
    let seconds = Math.abs(time) % 60;
    countdownEl.textContent = `${liftoffReached ? 'T+' : 'T-'}${minutes}:${seconds.toString().padStart(2, '0')}`;
    for (const [eventTime, eventText] of Object.entries(eventTimes)) {
        if (time <= eventTime && !displayedEvents.has(eventTime)) {
            createEventBox(eventTime, eventText);
            displayedEvents.add(eventTime);
        }
    }
}

function adjustTime(amount) {
    if (!liftoffReached) {
        let newTime = time + amount;
        if (time > 0 && newTime <= 0) {
            time = 0;
            liftoffReached = true;
        } else {
            time = newTime;
        }
        updateDisplay();
    }
}

function toggleCountdown() {
    if (interval) {
        clearInterval(interval);
        interval = null;
        startPauseBtn.textContent = "▶";
    } else {
        interval = setInterval(() => {
            if (!liftoffReached) {
                time--;
                if (time === 0) liftoffReached = true;
            } else {
                time++;
            }
            updateDisplay();
        }, 1000);
        startPauseBtn.textContent = "⏸";
    }
}

function resetCountdown() {
    clearInterval(interval);
    interval = null;
    time = 600;
    liftoffReached = false;
    eventsContainer.innerHTML = "";
    displayedEvents.clear();
    startPauseBtn.textContent = "▶";
    updateDisplay();
}

function createEventBox(eventTime, eventText) {
    let eventBox = document.createElement("div");
    eventBox.classList.add("event-box");
    eventBox.innerHTML = `<span>${eventText}</span> <button onclick="this.parentElement.remove(); displayedEvents.delete(${eventTime})">✔</button>`;
    eventsContainer.appendChild(eventBox);
}

updateDisplay();