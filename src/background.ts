import { pipeline } from '@xenova/transformers';

let session: any = null;
let interval: any = null;
let pipe: any = null;

// Initialize pipeline once at service worker start
(async () => {
  pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log("Pipeline loaded in background");
})();

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
  } else if (message.type === "RESET_SESSION") {
    stopTimer();
    session = null;
    chrome.storage.local.set({ session });
    sendResponse({ success: true });
  } else if (message.type === "GET_SESSION") {
    sendResponse({ session });
  } else if (message.type === "GET_SESSION_HISTORY") {
    chrome.storage.local.get({ sessionHistory: [] }, (data) => {
      sendResponse({ sessionHistory: data.sessionHistory });
    });
    return true; // async response
  } else if (message.type === "PAGE_CONTEXT") {
    if (!session || session.stage !== "ACTIVE") {
      sendResponse({ error: "No active session" });
      return;
    }

    const context = message.payload.context;
    runSemanticSimilarity(context, session.textInput)
      .then(result => sendResponse({ similarity: result.similarity }))
      .catch(err => {
        console.error("Semantic similarity error:", err);
        sendResponse({ error: err.message });
      });
    
    return true; // Will respond asynchronously
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

      chrome.notifications.create({
        type: "basic",
        iconUrl: "public/192.png",
        title: "Session Complete!",
        message: `Your session "${session.textInput}" is finished.`,
        priority: 2
      });

      const dateStr = new Date().toISOString().split('T')[0];

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

async function runSemanticSimilarity(pageContext: string, userQuery: string) {
  if (!pipe) {
    throw new Error("Pipeline not loaded");
  }

  const queryEmbedding = await embedText(pipe, userQuery);
  const pageEmbedding = await embedText(pipe, pageContext);
  const similarity = cosineSimilarity(queryEmbedding, pageEmbedding);

  return { similarity };
}

async function embedText(pipe: any, text: string) {
  const res = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(res.data) as number[];
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
