// Function to populate input fields with current task name and timer interval
function populateInputFields() {
  chrome.runtime.sendMessage({ action: "getCurrentTask" }, function(response) {
    if (response.taskName && response.interval) {
      document.getElementById("taskNameInput").value = response.taskName;
      document.getElementById("intervalInput").value = response.interval / 60000;
    }
  });
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