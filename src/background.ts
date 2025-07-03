let session: any = null;

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

    // Set alarm to fire when session ends
    chrome.alarms.create("focus-timer", { when: endTime });

    sendResponse({ success: true });
  }

  if (message.type === "RESET_SESSION") {
    chrome.alarms.clear("focus-timer");
    session = null;
    chrome.storage.local.set({ session });
    sendResponse({ success: true });
  }

  if (message.type === "GET_SESSION") {
    chrome.storage.local.get("session", (data) => {
      sendResponse({ session: data.session });
    });
    return true; // async response
  }

  if (message.type === "GET_SESSION_HISTORY") {
    chrome.storage.local.get({ sessionHistory: [] }, (data) => {
      sendResponse({ sessionHistory: data.sessionHistory });
    });
    return true; // async response
  }

  if (message.type === "PAUSE_SESSION") {
    if (session && session.stage === "ACTIVE") {
      // Compute remaining time
      const remainingSeconds = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000));

      // Update session
      session.stage = "PAUSED";
      session.remainingSeconds = remainingSeconds;

      chrome.alarms.clear("focus-timer");
      chrome.storage.local.set({ session });
      sendResponse({ success: true });
    }
  }

  if (message.type === "RESUME_SESSION") {
    if (session && session.stage === "PAUSED" && session.remainingSeconds !== undefined) {
      const newEndTime = Date.now() + session.remainingSeconds * 1000;

      session.stage = "ACTIVE";
      session.endTime = newEndTime;
      delete session.remainingSeconds;

      chrome.alarms.create("focus-timer", { when: newEndTime });
      chrome.storage.local.set({ session });

      sendResponse({ success: true });
    }
  }


  return true;
});

// Handle alarm trigger when session ends
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focus-timer") {
    chrome.storage.local.get("session", (data) => {
      const session = data.session;
      if (session && session.stage === "ACTIVE") {
        session.stage = "COMPLETED";
        chrome.storage.local.set({ session });

         // ✅ Send a Chrome notification
        chrome.notifications.create({
          type: "basic",
          iconUrl: "public/192.png", // Replace with your actual icon path
          title: "Session Complete",
          message: `Your focus session for "${session.textInput}" is complete!`,
          priority: 2
        });

        const dateStr = new Date().toISOString().split("T")[0];
        chrome.storage.local.get({ sessionHistory: [] }, (data) => {
          const updatedHistory = [
            ...data.sessionHistory,
            { textInput: session.textInput, date: dateStr },
          ];
          chrome.storage.local.set({ sessionHistory: updatedHistory });
        });
      }
    });
  }
});
