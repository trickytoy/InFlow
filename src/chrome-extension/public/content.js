'use strict';
import { pipeline } from '@xenova/transformers';

chrome.storage.local.get(['session'], async ({ session }) => {
  if (!(session && session.stage === "ACTIVE")) {
    console.log("No active session, skipping blocking and similarity check.");
    return;
  }

  chrome.runtime.sendMessage({ type: "CHECK_ALLOWED" }, async (response) => {
    if (response?.isAllowed) {
      console.log("is allowed List");
      return;
    } else {
        chrome.runtime.sendMessage({ type: "CHECK_BLOCKED" }, async (response) => {
          if (response?.isBlocked) {
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

          function cosineSimilarity(vecA, vecB) {
            const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
            const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
            const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
            return dot / (normA * normB);
          }

          try {
            const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

            const sentence1 = session.textInput;

            const title = document.title || '';
            const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
            const metaOgDesc = document.querySelector('meta[property="og:description"]')?.content || '';
            const bodyText = document.body?.innerText?.slice(0, 5000) || '';

            const sentence2 = `${title} ${metaDescription} ${metaOgDesc} ${bodyText}`;

            const output1 = await extractor(sentence1, { pooling: 'mean', normalize: true });
            const output2 = await extractor(sentence2, { pooling: 'mean', normalize: true });

            const similarity = cosineSimilarity(output1.data, output2.data);
            console.log(`Cosine similarity: ${similarity.toFixed(4)}`);

            if (similarity < 0.1) {
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
              });
              blocker.innerHTML = `
                <h1>🚫 Access Blocked</h1>
                <p>This page is unrelated to your focus topic:</p>
                <strong>${session.textInput}</strong>
                <p style="margin-top: 10px;"><em>Similarity Score: ${similarity.toFixed(4)}</em></p>
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
                  padding: '10px 15px', // slightly more horizontal padding
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  zIndex: '999999',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  boxSizing: 'border-box', // ensure padding doesn't overflow width
                });

                const warningText = document.createElement('span');
                warningText.textContent = `⚠️ Warning: This page may be unrelated to your focus topic. Similarity Score: ${similarity.toFixed(4)}`;
                warningText.style.paddingLeft = '5px';   // small horizontal padding
                warningText.style.paddingRight = '5px';  // small horizontal padding
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
                  padding: '0 8px',      // horizontal padding for clickable area
                  marginLeft: 'auto',
                  lineHeight: '1',       // tighter vertical spacing
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
            console.error("Error during semantic comparison:", e);
          }
        });
    }
  })


});
