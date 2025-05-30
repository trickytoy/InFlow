'use strict';
import { pipeline } from '@xenova/transformers';

const blocker = document.createElement('div');
blocker.id = 'focus-blocker';
blocker.style.position = 'fixed';
blocker.style.top = '0';
blocker.style.left = '0';
blocker.style.width = '100vw';
blocker.style.height = '100vh';
blocker.style.backgroundColor = '#f44336';
blocker.style.color = 'white';
blocker.style.zIndex = '999999';
blocker.style.display = 'flex';
blocker.style.flexDirection = 'column';
blocker.style.justifyContent = 'center';
blocker.style.alignItems = 'center';
blocker.style.fontSize = '24px';
blocker.style.fontFamily = 'Arial, sans-serif';
blocker.innerHTML = `
  <h1>🛑 Evaluating content for relevance...</h1>
  <p>Please wait a moment.</p>
`;
document.documentElement.appendChild(blocker);

chrome.storage.local.get(['session'], async ({ session }) => {
  if (session && session.stage === "ACTIVE") {
    function cosineSimilarity(vecA, vecB) {
      const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
      const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
      const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
      return dot / (normA * normB);
    }

    try {
      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      const sentence1 = session.textInput;
      const sentence2 = document.title;

      const output1 = await extractor(sentence1, { pooling: 'mean', normalize: true });
      const output2 = await extractor(sentence2, { pooling: 'mean', normalize: true });

      const similarity = cosineSimilarity(output1.data, output2.data);
      console.log(`Cosine similarity: ${similarity.toFixed(4)}`);

      if (similarity < 0.5) {
        blocker.innerHTML = `
          <h1>🚫 Access Blocked</h1>
          <p>This page is not related to your study topic: <strong>${session.textInput}</strong></p>
          <p><em>Similarity Score: ${similarity.toFixed(4)}</em></p>
        `;
        document.title = "Blocked by Focus Mode";
      } else {
        blocker.remove(); // allow page view
      }
    } catch (e) {
      console.error("Error during embedding comparison:", e);
      blocker.innerHTML = `
        <h1>⚠️ Error</h1>
        <p>Something went wrong while evaluating the page.</p>
      `;
    }
  } else {
    blocker.remove(); // No active session, allow access
  }
});
