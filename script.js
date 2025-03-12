const LO_OFFSET = 615;
const STORAGE_KEY = "launchTime"

let launchTime = initializeLaunchTime();
launchTimeMovedLast = new Date();
moveLaunchTimeInterval = setInterval(() => {
  moveLaunchTime();
  launchTimeMovedLast = new Date();
}, 100)
let checkLiftoffInterval = null;

let flightEvents;
let currentFlightEventNumber = 0;

const nextEventEvent = new CustomEvent('next-event', {});

let clockUTC = false;
let locked = false;

function initializeLaunchTime() {
  let storedLaunchTime = localStorage.getItem(STORAGE_KEY);

  if (storedLaunchTime != null) {
    return new Date(Number(storedLaunchTime))
  } else {
    let newLaunchDate = new Date(new Date().getTime() + (LO_OFFSET * 1000));
    localStorage.setItem(STORAGE_KEY, newLaunchDate.getTime().toString());
    return newLaunchDate;
  }
}

function updateDisplay() {
  setTimeout(() => {
    updateCountdown();
    updateClock();
    updateCurrentEventCountdown();
  }, 0);
}

function updateCountdown() {
  const countdownEl = document.getElementById("countdown");
  const launchTimeDeltaSeconds = Math.round((new Date() - launchTime) / 1000);
  countdownEl.textContent = launchTimeDeltaSeconds === 0 ? 'LIFTOFF' : 'T' + convertTimeSecondsToTimeMinutes(launchTimeDeltaSeconds);
}

function convertTimeSecondsToTimeMinutes(timeSeconds) {

  timeSeconds = Math.round(timeSeconds);

  const sign = timeSeconds < 0 ? '-' : '+'
  const timeMinutes = Math.trunc(timeSeconds / 60);
  const minutes = (Math.trunc(Math.abs(timeMinutes) % 60)).toString().padStart(2, '0');
  const seconds = (Math.round(Math.abs(timeSeconds) % 60).toString()).padStart(2, '0');

  if (Math.abs(timeMinutes) >= 60) {
    const hours = (Math.trunc(Math.abs(timeMinutes) / 60)).toString().padStart(2, '0');
    return sign + hours + ':' + minutes + ':' + seconds;
  }

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
  if (launchTime) {
    document.getElementById('lift-off-time').textContent = 'LO ' + launchTime.toString().slice(16, 24);
  }
}

function toggleClock() {
  clockUTC = !clockUTC;
}

function toggleLock(override = false) {
  if (override) {
    locked = override;
    toggleLockIcon(override);
  } else {
    locked = !locked;
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

function adjustTimeButtonClicked(amount) {
  if (!locked) {
    adjustTime(amount);
  }
}

function adjustTime(amount) {
  let newLaunchDate = new Date(launchTime.getTime() - (amount * 1000));
  localStorage.setItem(STORAGE_KEY, newLaunchDate.getTime().toString());
  launchTime = initializeLaunchTime();
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

function toggleCountdown() {
  if (locked) {
    return;
  }

  if (moveLaunchTimeInterval) {
    clearMoveLaunchTimeInterval();
    checkLiftoffInterval = setInterval(() => {
      let now = new Date();
      if ((now >= launchTime.getTime() - 100) && (now < launchTime.getTime() + 100)) {
        toggleLock(true);
      }
    }, 100)
    toggleIconStartPauseBtn();
  } else {
    clearCheckLiftoffInterval();
    launchTimeMovedLast = new Date();
    moveLaunchTimeInterval = setInterval(() => {
      moveLaunchTime();
      launchTimeMovedLast = new Date();
    }, 100)
    toggleIconStartPauseBtn()
  }
}

function clearMoveLaunchTimeInterval() {
  clearInterval(moveLaunchTimeInterval);
  moveLaunchTimeInterval = null;
  moveLaunchTime();
}

function clearCheckLiftoffInterval() {
  clearInterval(checkLiftoffInterval);
  checkLiftoffInterval = null;
}

function moveLaunchTime() {
  let newLaunchDate = new Date(launchTime.getTime() + (new Date() - launchTimeMovedLast));
  localStorage.setItem(STORAGE_KEY, newLaunchDate.getTime().toString());
  launchTime = initializeLaunchTime();
}

function resetCountdown() {
  if (!locked) {
    toggleCountdown();
    localStorage.removeItem(STORAGE_KEY);
    launchTime = initializeLaunchTime()
    currentFlightEventNumber = 0;
    removeFlightEventsList("event-scroll-container");
    loadFlightEventsList(0, "event-scroll-container");
    removeFlightEventsList("list-view");
    loadFlightEventsList(0, "list-view");
    loadNextFlightEvent();
  }
}

function toggleHiddenMenu() {
  const hiddenButtons = document.getElementById("hiddenButtons");
  const mainPageHeaderTextEl = document.getElementById("main-page-header-text");
  const toggleButtonIcon = document.querySelector("#toggleButton i");

  hiddenButtons.classList.toggle("hidden");
  mainPageHeaderTextEl.classList.toggle("hidden");

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

function loadFlightEventsList(position, parentElId) {
  const eventsScrollContainer = document.getElementById(parentElId);
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
  if (currentFlightEventNumber > 0 && !locked) {
    do {
      unconfirmEventFlightEventPage();
      currentFlightEventNumber--;
      removeFlightEventsList("event-scroll-container");
      loadFlightEventsList(currentFlightEventNumber, "event-scroll-container");
      loadNextFlightEvent();
    } while (flightEvents[currentFlightEventNumber].task !== true && currentFlightEventNumber > 0)
  }
}

function createCurrentEvent(eventTime, event, task) {
  const currentEventCountdownEl = document.getElementById("current-event-countdown");
  const currentEventTextEl = document.getElementById("current-event-text");
  const currentEventCheckEl = document.getElementById("current-event-checkbox");

  const currentEventDeltaTime = ((new Date() - launchTime) / 1000) - eventTime

  currentEventCountdownEl.innerText = convertTimeSecondsToTimeMinutes(currentEventDeltaTime);
  currentEventTextEl.innerText = event;

  if (currentEventCheckEl._clickHandler) {
    currentEventCheckEl.removeEventListener("click", currentEventCheckEl._clickHandler);
    currentEventCheckEl._clickHandler = null;
  }

  if (task) {
    currentEventCheckEl.innerHTML = "<i class=\"fa-regular fa-circle\"></i>"

    const handleEventClick = function () {
      currentEventCheckEl.innerHTML = "<i class=\"fa-solid fa-circle-check\" style=\"color: #63E6BE;\"></i>"
      setTimeout(() => {
        document.dispatchEvent(nextEventEvent);
      }, 150);
    };
    currentEventCheckEl._clickHandler = handleEventClick;
    currentEventCheckEl.addEventListener("click", handleEventClick);
  } else {
    currentEventCheckEl.innerHTML = ""
  }
}

function updateCurrentEventCountdown() {
  const currentEventCountdownEl = document.getElementById("current-event-countdown");
  const currentEventDeltaTime = ((new Date() - launchTime) / 1000) - flightEvents[currentFlightEventNumber].time

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

function removeFlightEventsList(parentElId) {
  const eventsScrollContainer = document.getElementById(parentElId);
  while (eventsScrollContainer.firstChild) {
    eventsScrollContainer.removeChild(eventsScrollContainer.firstChild);
  }
}

function loadNextFlightEvent() {
  loadCurrentFlightEvent();
  loadLastFlightEvent();
  removeElementFromEventList();
}

function showInputDataView() {
  toggleMainPage();
  toggleSettingsPage();
}

function showListView() {
  toggleMainPage();
  toggleListViewPage();
}

function toggleMainPage() {
  const mainPageEl = document.getElementById("main-page");
  mainPageEl.classList.toggle("hidden");
}

function toggleSettingsPage() {
  const inputPageEl = document.getElementById("input-page");
  inputPageEl.classList.toggle("hidden");
}

function toggleListViewPage() {
  const listViewPageEl = document.getElementById("list-view-page");
  listViewPageEl.classList.toggle("hidden");
}

function backToMainPage() {
  toggleListViewPage();
  toggleMainPage();
}

function confirmEventFlightEventPage() {
  const listViewEl = document.getElementById("list-view");
  listViewEl.children[currentFlightEventNumber].classList.add("confirmed");
}

function unconfirmEventFlightEventPage() {
  const listViewEl = document.getElementById("list-view");
  listViewEl.children[currentFlightEventNumber - 1].classList.remove("confirmed");
}

function saveSettings() {
  const launchTimeInputEl = document.getElementById("launch-time-input");
  const launchTimeString = launchTimeInputEl.value;
  const [hours, minutes] = launchTimeString.split(':').map(Number);

  const newLaunchDate = new Date();
  newLaunchDate.setHours(hours, minutes, 0, 0);
  localStorage.setItem(STORAGE_KEY, newLaunchDate.getTime().toString());
  launchTime = initializeLaunchTime();

  toggleSettingsPage();
  toggleMainPage();
}

function addEventListeners() {
  document.addEventListener("next-event", () => {
    if (currentFlightEventNumber < flightEvents.length - 1) {
      confirmEventFlightEventPage();
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
      loadFlightEventsList(0, "event-scroll-container");
      loadFlightEventsList(0, "list-view")
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
        .catch(err => console.log("Service worker could not be registered", err));
    });
  }
}

registerServiceWorker();
loadFlightEventsJSON();
addEventListeners();
