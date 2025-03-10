const START_TIME = -600

let time = -10;
let countdownInterval;

let clockUTC = true;

function updateDisplay() {
  setTimeout(() => {
    const countdownEl = document.getElementById("countdown");
    countdownEl.textContent = time === 0 ? 'LIFTOFF' : 'T' + convertTimeSecondsToTimeMinutes(time);
    updateClock();
  }, 0);
}

function convertTimeSecondsToTimeMinutes(timeSeconds) {
  const sign = timeSeconds < 0 ? '-' : '+'
  const minutes = (Math.trunc(Math.abs(timeSeconds) / 60)).toString().padStart(2, '0');
  const seconds = (Math.abs(timeSeconds) % 60).toString().padStart(2, "0");

  const timeMinutesString = sign + minutes + ':' + seconds
  console.log(timeMinutesString);

  return timeMinutesString;
}

function updateClock() {
  const timeUTC = 'UTC ' + new Date().toISOString().slice(11, 19);
  const timeLT = 'LT ' + new Date().toString().slice(16, 24);

  document.getElementById('clockUTC').textContent = timeUTC;
  document.getElementById('clockLT').textContent = timeLT;
}

function adjustTime(amount) {
  if (time < 0 || !countdownInterval) {
    time = time + amount
  }
}

function toggleIconStartPauseBtn(clear = false) {
  const iconStartPauseBtn = document.getElementById("iconStartPauseBtn");
  if (iconStartPauseBtn.classList.contains("fa-play") && !clear) {
    iconStartPauseBtn.classList.remove("fa-play");
    iconStartPauseBtn.classList.add("fa-pause");
  } else {
    iconStartPauseBtn.classList.remove("fa-pause");
    iconStartPauseBtn.classList.add("fa-play");
  }
}

function clearCountdownInterval() {
  clearInterval(countdownInterval);
  countdownInterval = null;
}

function toggleCountdown() {
  if (time > 0) {
    return;
  }

  if (countdownInterval) {
    clearCountdownInterval();
    toggleIconStartPauseBtn();
  } else {
    countdownInterval = setInterval(() => {
      time++;
    }, 1000);
    toggleIconStartPauseBtn()
  }
}

function resetCountdown() {
  clearCountdownInterval();
  toggleIconStartPauseBtn(true)
  time = START_TIME;
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

function createListEl(eventTime, eventText) {
  const listEl = document.createElement("div");
  const listElTime = document.createElement("div");
  const listElEvent = document.createElement("div");
  listEl.classList.add("listElement");
  listEl.appendChild(listElTime);
  listEl.appendChild(listElEvent);

  listElTime.classList.add("listElementTime");
  listElTime.innerText = 'T' + convertTimeSecondsToTimeMinutes(eventTime);

  listElEvent.classList.add("listElementEvent");
  listElEvent.innerText = eventText;

  return listEl;
}

function loadFlightEventsList() {
  const eventsScrollContainer = document.getElementById("event-scroll-container");
  fetch('flightEvents.json')
    .then(response => response.json())
    .then(data => {
      const events = data.events;
      events.sort((a, b) => a.time - b.time);
      events.forEach(event => {
        const listEl = createListEl(event.time, event.event);
        eventsScrollContainer.appendChild(listEl)
      });
    })
    .catch(error => {
      console.error('Error loading JSON:', error);
    });
}

function addEventListeners() {
  // const clockElement = document.getElementById('clock');

  // clockElement.addEventListener("click", () => {
  //   clockUTC = !clockUTC;
  // });
  //
  // clockElement.addEventListener("webkitmouseforcewillbegin", (event) => {
  //   event.preventDefault();
  //   clockUTC = !clockUTC;
  // });

  document.addEventListener('wheel', function (event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }, {passive: false});

  document.addEventListener('gesturestart', function (event) {
    event.preventDefault();
  }, {passive: false});

  document.addEventListener('gesturechange', function (event) {
    event.preventDefault();
  }, {passive: false});

  document.addEventListener('gestureend', function (event) {
    event.preventDefault();
  }, {passive: false});
}

loadFlightEventsList();
addEventListeners();
setInterval(updateDisplay, 100);