'use strict';
import { pipeline } from '@xenova/transformers';

chrome.storage.local.get(['session'], async ({ session }) => {
  if (!(session && session.stage === "ACTIVE")) return;

  // Helper: Cosine Similarity
  function cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
    return dot / (normA * normB);
  }

  try {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const sentence1 = session.textInput;

    // Dynamically collect metadata and content
    const title = document.title || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const metaOgDesc = document.querySelector('meta[property="og:description"]')?.content || '';
    const bodyText = document.body?.innerText?.slice(0, 5000) || ''; // limit size

    const sentence2 = `${title} ${metaDescription} ${metaOgDesc} ${bodyText}`;

    const output1 = await extractor(sentence1, { pooling: 'mean', normalize: true });
    const output2 = await extractor(sentence2, { pooling: 'mean', normalize: true });

    const similarity = cosineSimilarity(output1.data, output2.data);
    console.log(`Cosine similarity: ${similarity.toFixed(4)}`);

    // If similarity is too low, block the page
    if (similarity < 0.3) {
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
        <h1>🚫 Access Blocked</h1>
        <p>This page is not related to your focus topic:</p>
        <strong>${session.textInput}</strong>
        <p style="margin-top: 10px;"><em>Similarity Score: ${similarity.toFixed(4)}</em></p>
      `;
      document.documentElement.appendChild(blocker);
      document.title = "Blocked by Focus Mode";
    }

  } catch (e) {
    console.error("Error during semantic comparison:", e);
    // Optional: show error banner, or silently fail
  }
});