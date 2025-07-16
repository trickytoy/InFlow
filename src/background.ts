import { pipeline } from '@huggingface/transformers';


let session: any = null;
let extractor: any = null; // Cache the model

// Promisify chrome.storage.local methods for easier async/await use
const storageGet = <T>(keys: string | string[] | object): Promise<T> =>
  new Promise<T>((resolve) => {
    chrome.storage.local.get(keys, (items) => {
      resolve(items as T);
    });
  });
const storageSet = (items: object): Promise<void> =>
  new Promise<void>((resolve) => {
    chrome.storage.local.set(items, () => resolve());
  });
const alarmsClear = (name: string): Promise<boolean> =>
  new Promise((resolve) => chrome.alarms.clear(name, resolve));

// Initialize model and session on install
chrome.runtime.onInstalled.addListener(async () => {
  await storageSet({ session: null });
  session = null;
  // Pre-load the model
  try {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
  }
});

// Helper to save session both in memory and storage
async function updateSession(newSession: any) {
  session = newSession;
  await storageSet({ session });
}

// Cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (normA * normB);
}

// Semantic similarity check function
async function checkSimilarity(focusText: string, pageContent: string): Promise<number> {
  try {
    // Load model if not already loaded
    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    const output1 = await extractor(focusText, { pooling: 'mean', normalize: true });
    const output2 = await extractor(pageContent, { pooling: 'mean', normalize: true });

    const similarity = cosineSimilarity(output1.data, output2.data);
    return similarity;
  } catch (error) {
    console.error('Error in semantic similarity check:', error);
    return 1; // Return high similarity on error to avoid blocking
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case "START_SESSION": {
        const { textInput, durationSeconds } = message.payload;
        const endTime = Date.now() + durationSeconds * 1000;

        await updateSession({
          stage: "ACTIVE",
          textInput,
          endTime,
        });

        chrome.alarms.create("focus-timer", { when: endTime });
        sendResponse({ success: true });
        break;
      }

      case "RESET_SESSION": {
        await alarmsClear("focus-timer");
        await updateSession(null);
        sendResponse({ success: true });
        break;
      }

      case "GET_SESSION": {
        const data = await storageGet<{ session: any }>("session");
        sendResponse({ session: data.session });
        break;
      }

      case "GET_SESSION_HISTORY": {
        const data = await storageGet<{ sessionHistory: any[] }>({ sessionHistory: [] });
        sendResponse({ sessionHistory: data.sessionHistory });
        break;
      }

      case "PAUSE_SESSION": {
        if (session?.stage === "ACTIVE") {
          const remainingSeconds = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000));
          await updateSession({
            ...session,
            stage: "PAUSED",
            remainingSeconds,
          });
          await alarmsClear("focus-timer");
          sendResponse({ success: true });
        }
        break;
      }

      case "RESUME_SESSION": {
        if (session?.stage === "PAUSED" && session.remainingSeconds !== undefined) {
          const newEndTime = Date.now() + session.remainingSeconds * 1000;

          const resumedSession = {
            ...session,
            stage: "ACTIVE",
            endTime: newEndTime,
          };
          delete resumedSession.remainingSeconds;

          await updateSession(resumedSession);
          chrome.alarms.create("focus-timer", { when: newEndTime });
          sendResponse({ success: true });
        }
        break;
      }

      case "ADD_BLOCK": {
        const { url } = message.payload;

        // Get current blockList (default to empty array)
        const data = await storageGet<{ blockList: string[] }>({ blockList: [] });
        const currentList = data.blockList;

        // Add URL if not already present
        if (!currentList.includes(url)) {
          const updatedList = [...currentList, url];
          await storageSet({ blockList: updatedList });
        }

        sendResponse({ success: true });
        break;
      }

      case "CHECK_BLOCKED": {
        // Get current tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const tab = tabs[0];
          if (!tab || !tab.url) return sendResponse({ isBlocked: false });

          const currentUrl = tab.url;

          const data = await storageGet<{ blockList: string[] }>({ blockList: [] });
          console.log(data.blockList, )
          const isBlocked = data.blockList.includes(currentUrl);
          console.log("here", isBlocked)
          sendResponse({ isBlocked });
        });

        return true; // Allow async response
      }

      case "CHECK_ALLOWED": {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const tab = tabs[0];
          if (!tab || !tab.url) return sendResponse({ isAllowed: false });

          const currentUrl = tab.url;

          const data = await storageGet<{ allowList: string[] }>({ allowList: [] });
          const isAllowed = data.allowList.includes(currentUrl);
          console.log(isAllowed, data);

          sendResponse({ isAllowed });
        });

        return true; // Allow async response
      }

      case "CHECK_SIMILARITY": {
        const { focusText, pageContent } = message.payload;
        
        try {
          const similarity = await checkSimilarity(focusText, pageContent);
          sendResponse({ similarity });
        } catch (error) {
          console.error('Error checking similarity:', error);
          sendResponse({ similarity: 1 }); // Return high similarity on error
        }
        break;
      }
    }
  })();

  return true; // async response
});

// Alarm handler for focus session end
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "focus-timer") return;

  const data = await storageGet<{ session: any }>("session");
  const currentSession = data.session;

  if (currentSession?.stage === "ACTIVE") {
    currentSession.stage = "COMPLETED";
    await storageSet({ session: currentSession });

    // Send notification with buttons
    chrome.notifications.create({
      type: "basic",
      iconUrl: "public/192.png", // Replace with your icon path
      title: "Session Complete",
      message: `Your focus session for "${currentSession.textInput}" is complete!`,
      priority: 2,
    });

    // Update session history
    const historyData = await storageGet<{ sessionHistory: any[] }>({ sessionHistory: [] });
    const updatedHistory = [
      ...historyData.sessionHistory,
      { textInput: currentSession.textInput, date: new Date().toISOString().split("T")[0] },
    ];
    await storageSet({ sessionHistory: updatedHistory });
  }
});