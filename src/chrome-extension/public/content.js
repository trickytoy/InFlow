'use strict';

let lastUrl = location.href;
let debounceTimer = null;

// Helper to safely send messages and handle context invalidation errors gracefully
function safeSendMessage(message) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          // Could be 'Extension context invalidated' or other errors
          console.warn('sendMessage error:', chrome.runtime.lastError.message);
          resolve(null);
        } else {
          resolve(response);
        }
      });
    } catch (e) {
      console.warn('sendMessage threw:', e);
      resolve(null);
    }
  });
}

// Debounced runFocusCheck to avoid overlapping calls
function scheduleRunFocusCheck() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runFocusCheck().catch(e => {
      console.error('Error in runFocusCheck:', e);
    });
  }, 300); // 300ms debounce delay, adjust if needed
}

async function runFocusCheck() {
  try {
    const { session } = await new Promise(resolve => chrome.storage.local.get(['session'], resolve));

    if (!(session && session.stage === "ACTIVE")) {
      console.log("No active session, skipping blocking and similarity check.");
      return;
    }

    const responseAllowed = await safeSendMessage({ type: "CHECK_ALLOWED" });
    console.log("checkAllowed", responseAllowed)
    const isAllowed = responseAllowed?.isAllowed;

    if (isAllowed) {
      console.log("is allowed List");
      return;
    }

    const responseBlocked = await safeSendMessage({ type: "CHECK_BLOCKED" });
    const isBlocked = responseBlocked?.isBlocked;

    if (isBlocked) {
      console.log("🚫 This site is in the block list!");

      const blocker = document.createElement('div');
      blocker.id = 'focus-blocker';
      Object.assign(blocker.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f44336',
        color: 'white',
        zIndex: '999999',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
      });
      blocker.innerHTML = `
        <h1>🚫 Access Blocked</h1>
        <p>This site is in your block list.</p>
      `;

      document.head.innerHTML = '';
      document.body.innerHTML = '';
      document.body.appendChild(blocker);
      document.title = "Blocked by Focus Mode";
      return;
    }

    console.log("✅ Site is not in block list. Proceeding with semantic similarity check...");

    const focusText = session.textInput;

    const title = document.title || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const metaOgDesc = document.querySelector('meta[property="og:description"]')?.content || '';

    let bodyText = '';

    // YouTube video title selector
    const ytTitleElem = document.querySelector('h1.title yt-formatted-string') || document.querySelector('#container h1.title');
    if (ytTitleElem) {
      bodyText += ytTitleElem.innerText + ' ';
    }

    // YouTube video description
    const ytDescElem = document.querySelector('#description yt-formatted-string') || document.querySelector('#description');
    if (ytDescElem) {
      bodyText += ytDescElem.innerText + ' ';
    }

    // Fallback to body text trimmed to 5000 chars
    if (!bodyText) {
      bodyText = document.body?.innerText?.slice(0, 5000) || '';
    }

    const pageContent = `${title} ${metaDescription} ${metaOgDesc} ${bodyText}`;

    const responseSim = await safeSendMessage({
      type: "CHECK_SIMILARITY",
      payload: {
        focusText,
        pageContent
      }
    });

    const similarity = responseSim?.similarity.similarity;

    console.log(responseSim)

    if (typeof similarity !== 'number') {
      console.error("Invalid similarity response:", similarity);
      return;
    }

    console.log(`Cosine similarity: ${similarity.toFixed(4)}`);

    if (similarity < 0.15) {
      // Block page with overlay

      const blocker = document.createElement('div');
      blocker.id = 'focus-blocker';
      Object.assign(blocker.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f44336',
        color: 'white',
        zIndex: '999999',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      });
      blocker.innerHTML = `
        <h1>🚫 Access Blocked</h1>
        <p>This page is unrelated to your focus topic:</p>
        <strong>${session.textInput}</strong>
        <p style="margin-top: 20px; font-size: 18px; color: #ffe0e0;">
          💡 If this page is actually helpful, consider adding it to your allow list from the <strong>Settings</strong> tab.
        </p>
      `;

      document.head.innerHTML = '';
      document.body.innerHTML = '';
      document.body.appendChild(blocker);
      document.title = "Blocked by Focus Mode";

    } else if (similarity < 0.3) {

      
      // Show subtle warning banner on page with close button
      const warningBanner = document.createElement('div');
      Object.assign(warningBanner.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        backgroundColor: '#ffcc00',
        color: '#333',
        textAlign: 'center',
        padding: '10px 15px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        zIndex: '999999',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        boxSizing: 'border-box',
      });

      const warningText = document.createElement('span');
      warningText.textContent = `⚠️ Warning: This page may be unrelated to your focus topic.`;
      warningText.style.paddingLeft = '5px';
      warningText.style.paddingRight = '5px';
      warningBanner.appendChild(warningText);

      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✖';
      Object.assign(closeBtn.style, {
        background: 'transparent',
        border: 'none',
        color: '#333',
        fontSize: '20px',
        cursor: 'pointer',
        fontWeight: 'bold',
        padding: '0 8px',
        marginLeft: 'auto',
        lineHeight: '1',
      });
      closeBtn.title = 'Dismiss warning';
      closeBtn.addEventListener('click', () => {
        warningBanner.remove();
      });

      warningBanner.appendChild(closeBtn);
      document.body.appendChild(warningBanner);

    } else {
      console.log("Site is related to focus topic, no action needed.");
    }
  } catch (e) {
    console.error("Error during semantic comparison or main check:", e);
  }
}

// Function to detect YouTube SPA navigation via URL change
function observeUrlChange() {
  let currentUrl = location.href;
  console.log(currentUrl)

  const observer = new MutationObserver(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      scheduleRunFocusCheck();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Initial run and set up observer
scheduleRunFocusCheck();
observeUrlChange();

// Also hook into pushState/popstate for completeness
(function() {
  const pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
  };
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });
  window.addEventListener('locationchange', () => {
    console.log('locationchange event detected:', location.href);
    scheduleRunFocusCheck();
  });
})();
