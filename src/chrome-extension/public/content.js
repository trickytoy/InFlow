
(() => {
  const title = document.title || 'No title found';
  const metaDescription = document.querySelector('meta[name="description"]');
  const descriptionContent = metaDescription ? metaDescription.getAttribute('content') : 'No meta description found';
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogContent = ogDescription ? ogDescription.getAttribute('content') : 'No OG description found';

  const context = 
    `Title: ${title}\n` +
    `Meta Description: ${descriptionContent}\n` +
    `OG Description: ${ogContent}`;

  // Send extracted context to background
  chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: { context } });
})();