// Function to populate input fields with current task name and timer interval
async function populateInputFields() {
  const { timer } = await chrome.storage.local.get('timer');
  document.getElementById("taskNameInput").value = timer.taskName || '';
  document.getElementById("intervalInput").value = timer.interval || 0;
}

// Call populateInputFields function when popup is opened
populateInputFields();

function setTimer() {
  var taskName = document.getElementById("taskNameInput").value;
  var interval = parseInt(document.getElementById("intervalInput").value);
  chrome.runtime.sendMessage({ taskName: taskName, interval: interval });

  document.getElementById("confirmText").textContent = "Task timer SET";
}

function clearTimer() {
  chrome.runtime.sendMessage({ action: "clearTimer" });

  document.getElementById("taskNameInput").value = '';
  document.getElementById("intervalInput").value = 0;
  document.getElementById("confirmText").textContent = "Task timer CLEARED";

}

// Add event listener to the Set Timer button
document.getElementById("setTimerButton").addEventListener("click", setTimer);
document.getElementById("clearTimerButton").addEventListener("click", clearTimer);