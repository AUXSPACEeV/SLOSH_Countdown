let time = 600;
let interval;
const countdownEl = document.getElementById("countdown");
const eventsContainer = document.getElementById("events-container");
const startPauseBtn = document.getElementById("startPauseBtn");
const eventTimes = {600: "T-10 minutes: Systems Check", 0: "Liftoff!"};
let displayedEvents = new Set();
let liftoffReached = false;

let clockUTC = true;

function updateDisplay() {
  let minutes = Math.floor(Math.abs(time) / 60);
  let seconds = Math.abs(time) % 60;
  countdownEl.textContent = `${liftoffReached ? "T+" : "T-"}${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, "0")}`;
  for (const [eventTime, eventText] of Object.entries(eventTimes)) {
    if (time <= eventTime && !displayedEvents.has(eventTime)) {
      createEventBox(eventTime, eventText);
      displayedEvents.add(eventTime);
    }
  }
}

function updateClock() {
  let clockString;
  if (clockUTC) {
    clockString = 'UTC ' + new Date().toISOString().slice(11, 19);
  } else {
    clockString = 'LT ' + new Date().toString().slice(16, 24);
  }
  document.getElementById('clock').textContent = clockString;
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
  const icon = document.getElementById("iconStartPauseBtn");

  if (interval) {
    clearInterval(interval);
    interval = null;

    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
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

    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  }
}

function resetCountdown() {
  const icon = document.getElementById("iconStartPauseBtn");
  clearInterval(interval);
  interval = null;
  time = 600;
  liftoffReached = false;
  eventsContainer.innerHTML = "";
  displayedEvents.clear();
  icon.classList.remove("fa-pause");
  icon.classList.add("fa-play");
  updateDisplay();
}

function createEventBox(eventTime, eventText) {
  let eventBox = document.createElement("div");
  eventBox.classList.add("event-box");
  eventBox.innerHTML = `<span>${eventText}</span> <button onclick="this.parentElement.remove(); displayedEvents.delete(${eventTime})">✔</button>`;
  eventsContainer.appendChild(eventBox);
}

function toggleHiddenMenu() {
  const hiddenButtons = document.getElementById("hiddenButtons");
  const toggleButtonIcon = document.querySelector("#toggleButton i");

  hiddenButtons.classList.toggle("hidden");

  if (hiddenButtons.classList.contains("hidden")) {
    toggleButtonIcon.classList.remove("fa-chevron-left");
    toggleButtonIcon.classList.add("fa-ellipsis");
  } else {
    toggleButtonIcon.classList.remove("fa-ellipsis");
    toggleButtonIcon.classList.add("fa-chevron-left");
  }
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

const clockElement = document.getElementById('clock');

clockElement.addEventListener("click", () => {
  clockUTC = !clockUTC;
});

clockElement.addEventListener("webkitmouseforcewillbegin", (event) => {
  event.preventDefault();
  clockUTC = !clockUTC;
});

setInterval(updateClock, 100);
updateDisplay();

document.addEventListener('wheel', function(event) {
  if (event.ctrlKey) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener('gesturestart', function(event) {
  event.preventDefault();
}, { passive: false });

document.addEventListener('gesturechange', function(event) {
  event.preventDefault();
}, { passive: false });

document.addEventListener('gestureend', function(event) {
  event.preventDefault();
}, { passive: false });
