// Function to populate input fields with current task name and timer interval
async function populateInputFields() {
  const {timer} = await chrome.storage.local.get('timer');
  document.getElementById("taskNameInput").value = timer.taskName || '';
  document.getElementById("intervalInput").value = timer.interval || 0;
  console.log("qwe timer data", timer)
}

// Call populateInputFields function when popup is opened
populateInputFields();

function setTimer() {
  var taskName = document.getElementById("taskNameInput").value;
  var interval = parseInt(document.getElementById("intervalInput").value);
  chrome.runtime.sendMessage({ taskName: taskName, interval: interval });

  // Display timer set message
  var timerSetMessage = document.getElementById("timerSetMessage");
  timerSetMessage.textContent = "Task timer set";
}

// Add event listener to the Set Timer button
document.getElementById("setTimerButton").addEventListener("click", setTimer);