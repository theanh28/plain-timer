// let currentTask = {
//   taskName: "<none>",
//   interval: 0,
// }

// Force script wakes up.
chrome.alarms.onAlarm.addListener(async () => {
  const { timer } = await chrome.storage.local.get('timer');
  const { taskName, interval } = timer;

  chrome.action.setBadgeText({
    text: String(interval),
  });

  console.log("qwe went off")

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length == 0) return; // in chrome://, not an "active" tab.
    chrome.tabs.sendMessage(tabs[0].id, { taskName });
  });
});

// listener for current task info: name and interval.
// ***Note: interval in ms.
async function getCurrentTaskHandler(message, sender, sendResponse) {
  const { taskName, interval } = await chrome.storage.local.get('timer');
  sendResponse({ taskName, interval });
};

async function startTimer(message) {
  let { taskName, interval } = message;
  // currentTask = { ...currentTask, taskName, interval }
  // clearInterval(currentTask.timer);

  /// For peace of mind:
  if (interval <= 0) return;

  // prep first run
  // chrome.action.setBadgeBackgroundColor(
  //   { color: [0, 255, 0, 0] } // Green
  // );

  await chrome.alarms.clear("timer")
  await chrome.alarms.create("timer", { delayInMinutes: .2, periodInMinutes: .6 });
  // await chrome.alarms.create("update-timer", { delayInMinutes: interval, periodInMinutes: interval });
  await chrome.storage.local.set({ 'timer': { taskName, interval } });

  // currentTask.timer = setInterval(function () {
  //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //     chrome.tabs.sendMessage(tabs[0].id, { taskName: currentTask.taskName });
  //   });
  // }, interval);
}

// Message interceptor
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("qwe event msg", message)
  if (message.action === "getCurrentTask") {
    getCurrentTaskHandler(message, sender, sendResponse)
  } else {
    startTimer(message);
  }
});