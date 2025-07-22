import { pipeline } from '@huggingface/transformers';

type DistractionCategory = "entertainment" | "shopping" | "social" | "other" | "gaming";

interface DisBreakdown {
  entertainment: number;
  shopping: number;
  social: number;
  other: number;
  gaming: number;
}
// Represent a site with url and time spent
interface Site {
  url: string;
  duration: number; // time spent in seconds (or ms)
}

// Current session data structure
interface CurrSesh {
  mostTimeSpentSite: Site[];        // array of top sites by duration
  pieChart: DisBreakdown;           // breakdown for pie chart display
}

let session: any = null;
let extractor: any = null; // Cache the model
let categoryVectors: Record<DistractionCategory, number[]> | null = null;

let topicVector: any = null;
let topic: any = null;

let currsesh: CurrSesh = {
  mostTimeSpentSite: [],
  pieChart: {
    entertainment: 0,
    shopping: 0,
    social: 0,
    other: 0,
    gaming: 0,
  },
};

const categoryCatalog: Record<DistractionCategory, string> = {
  entertainment: "Watching movies, videos, or streaming content",
  social: "Using social media, chatting, or messaging apps",
  shopping: "Browsing products, deals, or online stores",
  gaming: "Playing or watching games",
  other: "General browsing or unrelated content"
};

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
    if (!categoryVectors) {
      categoryVectors = {} as Record<DistractionCategory, number[]>;
      for (const category in categoryCatalog) {
        const exampleText = categoryCatalog[category as DistractionCategory];
        const vector = await extractor(exampleText, { pooling: 'mean', normalize: true });
        categoryVectors[category as DistractionCategory] = vector.data;
      }
      console.log(categoryVectors)
    }
  } catch (error) {
    console.error('Error loading model:', error);
  }
});

// Helper to save session both in memory and storage
async function updateSession(newSession: any) {
  session = newSession;
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  if (!newSession) {
    topicVector = null
    topic = null
  } else {
    topicVector = await extractor(newSession.textInput, { pooling: 'mean', normalize: true })
    topic = topicVector.data
  }
  console.log(session, topic)
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
async function checkSimilarity(focusText: string, pageContent: string): Promise<any> {
  try {
    // Load model if not already loaded
    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    if (categoryVectors) {
      const pageVec = await extractor(pageContent, { pooling: 'mean', normalize: true });

      const similarity = cosineSimilarity(topic, pageVec.data);

      console.log("Simlarity score:",similarity)
      let mostLikelyCategory = "other";
      let highestScore = -Infinity;
      const categoryScores: Record<DistractionCategory, number> = {
        entertainment: 0,
        shopping: 0,
        social: 0,
        other: 0,
        gaming: 0,
      };

      for (const category of Object.keys(categoryCatalog) as DistractionCategory[]) {
        const catVec = categoryVectors[category];
        const score = cosineSimilarity(catVec, pageVec.data);
        categoryScores[category] = score;
        if (score > highestScore) {
          highestScore = score;
          mostLikelyCategory = category;
        }
      }


      currsesh.pieChart[mostLikelyCategory as DistractionCategory] += 1;
      return { similarity, categoryScores, mostLikelyCategory };
    }

  
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
        console.log("HELLO??")
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          
          const tab = tabs[0];
          console.log("HEREEEE",tabs, tab.url)
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

    // Update session history with current session data
    const historyData = await storageGet<{ sessionHistory: any[] }>({ sessionHistory: [] });
    
    // Create completed session entry with analytics
    const completedSessionEntry = {
      textInput: currentSession.textInput,
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      duration: currentSession.endTime - (currentSession.endTime - Date.now()), // Calculate actual duration
      analytics: {
        mostTimeSpentSite: [...currsesh.mostTimeSpentSite], // Copy the array
        distractionBreakdown: { ...currsesh.pieChart }, // Copy the breakdown
        totalDistractions: Object.values(currsesh.pieChart).reduce((sum, count) => sum + count, 0)
      }
    };

    const updatedHistory = [
      ...historyData.sessionHistory,
      completedSessionEntry
    ];
    
    await storageSet({ sessionHistory: updatedHistory });

    // Reset current session data for next session
    currsesh = {
      mostTimeSpentSite: [],
      pieChart: {
        entertainment: 0,
        shopping: 0,
        social: 0,
        other: 0,
        gaming: 0,
      },
    };
    
    console.log('Session completed and saved to history:', completedSessionEntry);
  }
});