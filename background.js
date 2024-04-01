let currentTask = {
  taskName: "<none>",
  interval: 0,
  timer: null
}

// listener for current task info: name and interval.
// ***Note: interval in ms.
const getCurrentTaskHandler = (function (message, sender, sendResponse) {
  const { taskName, interval } = currentTask
  sendResponse({ taskName, interval });
});

function startTimer(message) {
  let { taskName, interval } = message;
  interval *= 60000; // Convert minutes to milliseconds
  currentTask = { ...currentTask, taskName, interval }
  clearInterval(currentTask.timer);

  /// For peace of mind:
  if (interval <= 0) return;

  currentTask.timer = setInterval(function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { taskName: taskName });
    });
  }, interval);
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