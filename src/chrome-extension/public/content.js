'use strict';

let lastUrl = location.href;
let debounceTimer = null;

// Helper to safely send messages and handle context invalidation errors gracefully
function safeSendMessage(message) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
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
  }, 300);
}

async function runFocusCheck() {
  try {
    const { session } = await new Promise(resolve => chrome.storage.local.get(['session'], resolve));

    if (!(session && session.stage === "ACTIVE")) {
      console.log("No active session, skipping blocking and similarity check.");
      return;
    }

    // Always ensure progress bar appears on valid pages
    console.log('🎯 About to initialize progress bar from runFocusCheck');
    initFocusProgressBar(); // Remove await here since we want it to run async

    const responseAllowed = await safeSendMessage({ type: "CHECK_ALLOWED" });
    console.log("checkAllowed", responseAllowed);
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

    const ytTitleElem = document.querySelector('h1.title yt-formatted-string') || document.querySelector('#container h1.title');
    if (ytTitleElem) bodyText += ytTitleElem.innerText + ' ';

    const ytDescElem = document.querySelector('#description yt-formatted-string') || document.querySelector('#description');
    if (ytDescElem) bodyText += ytDescElem.innerText + ' ';

    if (!bodyText) {
      bodyText = document.body?.innerText?.slice(0, 5000) || '';
    }

    const pageContent = `${title} ${metaDescription} ${metaOgDesc} ${bodyText}`;

    const responseSim = await safeSendMessage({
      type: "CHECK_SIMILARITY",
      payload: { focusText, pageContent }
    });

    const similarity = responseSim?.similarity?.similarity;
    console.log("RESPONSE", responseSim)
    if (typeof similarity !== 'number') {
      console.error("Invalid similarity response:", similarity);
      return;
    }

    console.log(`Cosine similarity: ${similarity.toFixed(4)}`);

    if (similarity < 0.15) {
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
      warningText.style.padding = '0 5px';

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
      closeBtn.addEventListener('click', () => warningBanner.remove());

      warningBanner.appendChild(warningText);
      warningBanner.appendChild(closeBtn);
      document.body.appendChild(warningBanner);
    } else {
      console.log("Site is related to focus topic, no action needed.");
    }

  } catch (e) {
    console.error("Error during semantic comparison or main check:", e);
  }
}

function observeUrlChange() {
  let currentUrl = location.href;

  const observer = new MutationObserver(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      scheduleRunFocusCheck();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Hook into pushState/popstate navigation
(function() {
  const pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
  };
  window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
  window.addEventListener('locationchange', () => {
    console.log('locationchange event detected:', location.href);
    scheduleRunFocusCheck();
  });
})();

async function initFocusProgressBar() {
  console.log('🔍 initFocusProgressBar called');
  
  const { session } = await chrome.storage.local.get("session");
  console.log('📊 Session data:', session);
  
  if (!session) {
    console.log('❌ No session found');
    return;
  }
  
  if (session.stage !== "ACTIVE") {
    console.log('❌ Session not active, stage:', session.stage);
    return;
  }
  
  if (Date.now() >= session.endTime) {
    console.log('❌ Session ended, current time:', Date.now(), 'end time:', session.endTime);
    return;
  }

  const endTime = session.endTime;
  const startTime = session.startTime;
  const totalDuration = endTime - startTime;
  
  console.log('⏱️ Times - Start:', startTime, 'End:', endTime, 'Duration:', totalDuration);

  if (document.getElementById("inflow-focus-bar")) {
    console.log('⚠️ Progress bar already exists');
    return;
  }

  console.log('✅ Creating progress bar');

  const barContainer = document.createElement("div");
  barContainer.id = "inflow-focus-bar";
  barContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 6px;
    width: 100%;
    background-color: rgba(0,0,0,0.1);
    z-index: 999999;
    opacity: 0;
    transition: opacity 0.4s ease-in;
    pointer-events: none;
  `;

  const progressFill = document.createElement("div");
  progressFill.style.cssText = `
    height: 100%;
    width: 0%;
    background: linear-gradient(to right, #4ade80, #22c55e);
    transition: width 1s linear;
  `;

  barContainer.appendChild(progressFill);
  document.body.appendChild(barContainer);
  
  console.log('📍 Progress bar added to DOM');
  
  // Force immediate opacity change with requestAnimationFrame
  requestAnimationFrame(() => {
    barContainer.style.opacity = "1";
    console.log('👁️ Progress bar opacity set to 1');
  });

  const interval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - startTime;
    const percent = Math.min((elapsed / totalDuration) * 100, 100);
    progressFill.style.width = `${percent}%`;
    
    console.log(`📈 Progress: ${percent.toFixed(1)}%`);

    if (now >= endTime) {
      console.log('⏰ Session ended, removing progress bar');
      clearInterval(interval);
      document.getElementById("inflow-focus-bar")?.remove();
    }
  }, 1000);
}

// Initial calls
console.log('🚀 Content script loaded, checking for active session...');
scheduleRunFocusCheck();
observeUrlChange();
// Also initialize progress bar immediately when script loads
initFocusProgressBar();

// DEBUGGING HELPER: Add this to test the progress bar manually
// You can run testProgressBar() in the browser console to test
function testProgressBar() {
  console.log('🧪 Testing progress bar...');
  
  // Remove existing bar first
  document.getElementById("inflow-focus-bar")?.remove();
  
  // Create test session data
  const testSession = {
    stage: "ACTIVE",
    startTime: Date.now() - 300000, // Started 5 minutes ago
    endTime: Date.now() + 1200000,  // Ends in 20 minutes
    textInput: "Test focus topic"
  };
  
  // Store test session
  chrome.storage.local.set({ session: testSession }, () => {
    console.log('🔧 Test session stored:', testSession);
    initFocusProgressBar();
  });
}

// Make testProgressBar available globally for console testing
window.testProgressBar = testProgressBar;