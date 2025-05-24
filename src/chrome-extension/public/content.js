'use strict';

chrome.storage.local.get(['session'], ({ session }) => {
  if (session && session.stage === "ACTIVE") {
    const title = document.title || 'No title found';
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = metaDescription ? metaDescription.getAttribute('content') : 'No meta description found';
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogContent = ogDescription ? ogDescription.getAttribute('content') : 'No OG description found';

    const context = 
      `Title: ${title}\n` +
      `Meta Description: ${descriptionContent}\n` +
      `OG Description: ${ogContent}`;

    chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: { context } }, (response) => {
      if (response && response.similarity !== undefined) {
        console.log("Semantic Similarity Score:", response.similarity);
      } else {
        console.error("No similarity score received");
      }
    });
  }
});
