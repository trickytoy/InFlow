let session:any = null;
let interval:any = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ session: null });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_SESSION") {
    const { textInput, durationSeconds } = message.payload;
    const endTime = Date.now() + durationSeconds * 1000;

    session = {
      stage: "ACTIVE",
      textInput,
      endTime,
    };

    chrome.storage.local.set({ session });

    startTimer();
    sendResponse({ success: true });
  }

  if (message.type === "RESET_SESSION") {
    stopTimer();
    session = null;
    chrome.storage.local.set({ session });
    sendResponse({ success: true });
  }

  if (message.type === "GET_SESSION") {
    sendResponse({ session });
  }

  if (message.type === "GET_SESSION_HISTORY") {
    chrome.storage.local.get({ sessionHistory: [] }, (data) => {
      sendResponse({ sessionHistory: data.sessionHistory });
    });
    return true; // important: keep connection alive for async sendResponse
  }

  return true;
});

function startTimer() {
  stopTimer();
  interval = setInterval(() => {
    if (!session) return;

    const remaining = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000));
    if (remaining <= 0) {
      stopTimer();
      session.stage = "COMPLETED";

      // Save session to history
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      chrome.storage.local.get({ sessionHistory: [] }, (data) => {
        const updatedHistory = [
          ...data.sessionHistory,
          { textInput: session.textInput, date: dateStr },
        ];
        chrome.storage.local.set({ sessionHistory: updatedHistory });
      });

      chrome.storage.local.set({ session });
    }
  }, 1000);
}
function stopTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
