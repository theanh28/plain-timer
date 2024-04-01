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
  const { timer } = await chrome.storage.local.get('timer');
  const { interval } = timer;

  const previousText = await chrome.action.getBadgeText({});
  const nextText = Number(previousText) === 1 ? interval : Number(previousText) - 1;

  chrome.action.setBadgeText({ text: String(nextText) });
}

// Alarm handler dispatch. Force script wakes up.
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm received", alarm)
  if (alarm.name === "intervalEnd") intervalEndHandler(alarm);
  if (alarm.name === "badgeTextUpdate") badgeTextUpdateHandler(alarm);
});

async function clearTimerHandler() {
  chrome.storage.local.set({ 'timer': { taskName: "", interval: 0 } });
  chrome.alarms.clear("intervalEnd")
  chrome.alarms.clear("badgeTextUpdate")
};

async function startTimer(message) {
  let { taskName, interval } = message;

  /// For peace of mind
  if (interval <= 0) return;

  // Clear previous alarms
  await chrome.alarms.clear("intervalEnd");
  await chrome.alarms.clear("badgeTextUpdate")

  // No need await
  chrome.alarms.create("intervalEnd", { periodInMinutes: interval });
  chrome.storage.local.set({ 'timer': { taskName, interval } });

  // Timer update remaining time til badge text update.
  chrome.alarms.create("badgeTextUpdate", { periodInMinutes: 1 });
  // Initial badge text. Another event handler at the top of this file
  // handles per minute update.
  chrome.action.setBadgeText({ text: String(interval) });
}

// Message interceptor
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Background received message", message)
  if (message.action === "clearTimer") {
    clearTimerHandler()
  } else {
    startTimer(message);
  }
});