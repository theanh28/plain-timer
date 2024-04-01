const intervalEndHandler = async (alarm) => {
  const { timer } = await chrome.storage.local.get('timer');
  const { taskName, interval } = timer;

  chrome.action.setBadgeText({
    text: String(interval),
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length == 0) return; // in chrome://, not an "active" tab.
    chrome.tabs.sendMessage(tabs[0].id, { taskName });
  });

  console.log("End of interval")
}

const badgeTextUpdateHandler = async (alarm) => {
  const { badge } = await chrome.storage.local.get('badge');
  let { current, interval } = badge;

  current = current <= 1 ? interval : current - 1;
  chrome.storage.local.set({ 'badge': { ...badge, current } })
  chrome.action.setBadgeText({ text: String(current) });
}

// Alarm handler dispatch. Force script wakes up.
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm received", alarm)
  if (alarm.name === "intervalEnd") intervalEndHandler(alarm);
  if (alarm.name === "badgeTextUpdate") badgeTextUpdateHandler(alarm);
});

// Prepare on start up for time sync.
chrome.runtime.onStartup.addListener(async () => {
  // Move badge text to max as timer starts now.
  const { badge } = await chrome.storage.local.get('badge');
  let { interval } = badge;
  startBadgeCoundown(interval)
})

async function clearTimer() {
  chrome.storage.local.set({ 'timer': { taskName: "", interval: 0 } });
  chrome.alarms.clear("intervalEnd")
  chrome.alarms.clear("badgeTextUpdate")
};

function startBadgeCoundown(interval) {
  // Timer update remaining time til badge text update.
  chrome.alarms.create("badgeTextUpdate", { periodInMinutes: 1 });
  // Initial badge text. Another event handler at the top of this file
  // handles per minute update.
  chrome.action.setBadgeText({ text: String(interval) });
  chrome.storage.local.set({ 'badge': { current: interval, interval } });
}

async function startTimer(message) {
  let { taskName, interval } = message;

  /// For peace of mind
  if (interval <= 0) return;

  chrome.alarms.create("intervalEnd", { periodInMinutes: interval });
  chrome.storage.local.set({ 'timer': { taskName, interval } });

  startBadgeCoundown(interval)
}

// Message interceptor
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Background received message", message)
  if (message.action === "clearTimer") {
    clearTimer()
  } else {
    startTimer(message);
  }
});