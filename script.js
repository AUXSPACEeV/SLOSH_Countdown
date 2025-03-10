let time = 600;
let interval;
const countdownEl = document.getElementById("countdown");
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
  const timeUTC = 'UTC ' + new Date().toISOString().slice(11, 19);
  const timeLT = 'LT ' + new Date().toString().slice(16, 24);

  document.getElementById('clockUTC').textContent = timeUTC;
  document.getElementById('clockLT').textContent = timeLT;
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
  // eventsContainer.innerHTML = "";
  // displayedEvents.clear();
  icon.classList.remove("fa-pause");
  icon.classList.add("fa-play");
  updateDisplay();
}

// function createEventBox(eventTime, eventText) {
//   let eventBox = document.createElement("div");
//   eventBox.classList.add("event-box");
//   eventBox.innerHTML = `<span>${eventText}</span> <button onclick="this.parentElement.remove(); displayedEvents.delete(${eventTime})">✔</button>`;
//   eventsContainer.appendChild(eventBox);
// }

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

function createListElement(eventTime, eventText) {
  const listElement = document.createElement("div");
  const listElementTime = document.createElement("div");
  const listElementEvent = document.createElement("div");
  listElement.classList.add("listElement");
  listElement.appendChild(listElementTime);
  listElement.appendChild(listElementEvent);

  listElementTime.classList.add("listElementTime");
  listElementTime.innerText = eventTime;

  listElementEvent.classList.add("listElementEvent");
  listElementEvent.innerText = eventText;

  return listElement;
}

function loadFlightEventsList() {
  const eventsContainer = document.getElementById("events-container");
  fetch('flightEvents.json')
    .then(response => response.json())
    .then(data => {
      const events = data.events;
      events.sort((a, b) => a.time - b.time);
      events.forEach(event => {
        const listElement = createListElement(event.time, event.event);
        eventsContainer.appendChild(listElement)
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

addEventListeners();
setInterval(updateClock, 100);
loadFlightEventsList();
updateDisplay();