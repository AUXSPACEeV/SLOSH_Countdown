const START_TIME = -615

let time = -15;
let countdownInterval;

let flightEvents;
let currentFlightEventNumber = 0;

const nextEventEvent = new CustomEvent('next-event', {});

let clockUTC = true;

let lock = false;

function updateDisplay() {
  setTimeout(() => {
    const countdownEl = document.getElementById("countdown");
    countdownEl.textContent = time === 0 ? 'LIFTOFF' : 'T' + convertTimeSecondsToTimeMinutes(time);
    updateClock();
    updateCurrentEventCountdown();
  }, 0);
}

function convertTimeSecondsToTimeMinutes(timeSeconds) {
  const sign = timeSeconds < 0 ? '-' : '+'
  const minutes = (Math.trunc(Math.abs(timeSeconds) / 60)).toString().padStart(2, '0');
  const seconds = (Math.abs(timeSeconds) % 60).toString().padStart(2, "0");

  return sign + minutes + ':' + seconds;
}

function updateClock() {
  let clockTime;
  if (clockUTC) {
    clockTime = 'UTC ' + new Date().toISOString().slice(11, 19);
  } else {
    clockTime = 'LT ' + new Date().toString().slice(16, 24);
  }
  document.getElementById('clock').textContent = clockTime;
}

function toggleClock() {
  clockUTC = !clockUTC;
}

function toggleLock(override = false) {
  if (override) {
    lock = override;
    toggleLockIcon(override);
  } else {
    lock = !lock;
    toggleLockIcon();
  }
}

function toggleLockIcon(override = false) {
  const iconStartPauseBtn = document.getElementById("lockBtnIcon");
  if (iconStartPauseBtn.classList.contains("fa-lock-open") || override) {
    iconStartPauseBtn.classList.remove("fa-lock-open");
    iconStartPauseBtn.classList.add("fa-lock");
  } else {
    iconStartPauseBtn.classList.remove("fa-lock");
    iconStartPauseBtn.classList.add("fa-lock-open");
  }
}

function adjustTime(amount) {
  if (!lock) {
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
  if (lock > 0) {
    return;
  }

  if (countdownInterval) {
    clearCountdownInterval();
    toggleIconStartPauseBtn();
  } else {
    countdownInterval = setInterval(() => {
      time++;
      if (time === 0) {
        toggleLock(true);
      }
    }, 1000);
    toggleIconStartPauseBtn()
  }
}

function resetCountdown() {
  clearCountdownInterval();
  toggleIconStartPauseBtn(true)
  time = START_TIME;
  currentFlightEventNumber = 0;
  removeFlightEventsList();
  loadFlightEventsList(0);
  loadNextFlightEvent();
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
  listElTime.innerText = "T" + convertTimeSecondsToTimeMinutes(eventTime);

  listElEvent.classList.add("listElementEvent");
  listElEvent.innerText = eventText;

  return listEl;
}

function loadFlightEventsList(position) {
  const eventsScrollContainer = document.getElementById("event-scroll-container");
  flightEvents.slice(position).forEach(event => {
    const listEl = createListEl(event.time, event.event);
    eventsScrollContainer.appendChild(listEl)
  });
}

function loadCurrentFlightEvent() {
  if (currentFlightEventNumber < flightEvents.length) {
    const currentFlightEvent = flightEvents[currentFlightEventNumber]
    createCurrentEvent(currentFlightEvent.time, currentFlightEvent.event, currentFlightEvent.task);
  }
}

function loadLastFlightEvent() {
  const lastEventEl = document.getElementById("last-event");
  if (currentFlightEventNumber > 0) {
    let lastEvent = flightEvents[currentFlightEventNumber - 1]
    lastEventEl.innerHTML = createListEl(lastEvent.time, lastEvent.event).innerHTML;
  } else {
    lastEventEl.innerText = "Godspeed 🙏 🚀"
  }
}

function revertLastEvent() {
  removeFlightEventsList();
  loadFlightEventsList(--currentFlightEventNumber);
  loadNextFlightEvent();
}

function createCurrentEvent(eventTime, event, task) {
  const currentEventCountdownEl = document.getElementById("current-event-countdown");
  const currentEventTextEl = document.getElementById("current-event-text");
  const currentEventCheckEl = document.getElementById("current-event-checkbox");

  const currentEventDeltaTime = time - eventTime

  currentEventCountdownEl.innerText = convertTimeSecondsToTimeMinutes(currentEventDeltaTime);
  currentEventTextEl.innerText = event;

  if (currentEventCheckEl._clickHandler) {
    currentEventCheckEl.removeEventListener("click", currentEventCheckEl._clickHandler);
    currentEventCheckEl._clickHandler = null;
  }

  if (task) {
    currentEventCheckEl.innerHTML = "<i class=\"fa-regular fa-square\"></i>"

    const handleEventClick = function () {
      document.dispatchEvent(nextEventEvent);
    };
    currentEventCheckEl._clickHandler = handleEventClick;
    currentEventCheckEl.addEventListener("click", handleEventClick);
  } else {
    currentEventCheckEl.innerHTML = ""
  }
}

function updateCurrentEventCountdown() {
  const currentEventCountdownEl = document.getElementById("current-event-countdown");
  const currentEventDeltaTime = time - flightEvents[currentFlightEventNumber].time

  if (currentEventDeltaTime === 0) {
    currentEventCountdownEl.innerText = "GO!"
  } else {
    currentEventCountdownEl.innerText = convertTimeSecondsToTimeMinutes(currentEventDeltaTime);
  }

  if (!flightEvents[currentFlightEventNumber].task
    && currentEventDeltaTime > 0
    && currentFlightEventNumber < flightEvents.length - 1
  ) {
    document.dispatchEvent(nextEventEvent);
  }
}

function removeElementFromEventList() {
  const eventsScrollContainer = document.getElementById("event-scroll-container");
  let removedEl = eventsScrollContainer.firstElementChild
  if (removedEl !== null) {
    removedEl.remove();
  }
}

function removeFlightEventsList() {
  const eventsScrollContainer = document.getElementById("event-scroll-container");
  while (eventsScrollContainer.firstChild) {
    eventsScrollContainer.removeChild(eventsScrollContainer.firstChild);
  }
}

function loadNextFlightEvent() {
  loadCurrentFlightEvent();
  loadLastFlightEvent();
  removeElementFromEventList();
}

function addEventListeners() {
  document.addEventListener("next-event", () => {
    if (currentFlightEventNumber < flightEvents.length - 1) {
      currentFlightEventNumber++;
      loadNextFlightEvent();
    }
  });

  document.addEventListener("wheel", function (event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }, {passive: false});

  document.addEventListener("gesturestart", function (event) {
    event.preventDefault();
  }, {passive: false});
  document.addEventListener("gesturechange", function (event) {
    event.preventDefault();
  }, {passive: false});
  document.addEventListener("gestureend", function (event) {
    event.preventDefault();
  }, {passive: false});

  let drags = new Set()
  document.addEventListener("touchmove", function (event) {
    if (!event.isTrusted) return
    Array.from(event.changedTouches).forEach(function (touch) {
      drags.add(touch.identifier)
    })
  })
  document.addEventListener("touchend", function (event) {
    if (!event.isTrusted) return
    let isDrag = false
    Array.from(event.changedTouches).forEach(function (touch) {
      if (drags.has(touch.identifier)) {
        isDrag = true
      }
      drags.delete(touch.identifier)
    })
    if (!isDrag && document.activeElement === document.body) {
      event.preventDefault()
      event.stopPropagation()
      event.target.focus()
      event.target.click()
      event.target.dispatchEvent(new TouchEvent("touchend", {
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        composed: event.composed,
        touches: event.touches,
        targetTouches: event.targetTouches,
        changedTouches: event.changedTouches,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        view: event.view,
        detail: event.detail
      }))
    }
  })
}

function loadFlightEventsJSON() {
  fetch("./data/flightEvents.json")
    .then(response => response.json())
    .then(data => {
      const events = data.events;
      events.sort((a, b) => a.time - b.time);

      flightEvents = events;
      loadFlightEventsList(0);
      loadNextFlightEvent();
      setInterval(updateDisplay, 100);
    })
    .catch(error => {
      console.error("Error loading JSON:", error);
    });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // noinspection JSUnusedLocalSymbols
      navigator.serviceWorker.register("./web-app/service-worker.js")
        .catch(err => console.log("Service could not be registered", err));
    });
  }
}

registerServiceWorker();
loadFlightEventsJSON();
addEventListeners();
