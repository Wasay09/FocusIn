chrome.storage.local.get(["unlockGranted", "blockedSites"], (data) => {
  const unlock = data.unlockGranted;
  const blockedSites = data.blockedSites || [];
  const hostname = window.location.hostname.toLowerCase();

  const shouldBlock = blockedSites.some(site => {
    return hostname.includes(site.toLowerCase().replace("www.", "").trim());
  });

  if (shouldBlock && !unlock) {
    document.head.innerHTML = `
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #1d2b64, #f8cdda);
          color: #fff;
          font-family: 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .focus-container {
          background: rgba(0, 0, 0, 0.8);
          padding: 35px;
          border-radius: 15px;
          text-align: center;
          max-width: 450px;
          box-shadow: 0 0 15px rgba(0,0,0,0.5);
        }
        h1 {
          font-size: 26px;
          margin-bottom: 15px;
        }
        p {
          font-size: 16px;
          margin-bottom: 20px;
        }
        input, button {
          padding: 10px;
          margin-top: 10px;
          font-size: 16px;
          width: 100%;
          border-radius: 6px;
          border: none;
        }
        button {
          background: #1abc9c;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background: #16a085;
        }
        #aiQuestion {
          font-style: italic;
          color: #ffd;
          margin-top: 10px;
        }
      </style>
    `;

    document.body.innerHTML = `
      <div class="focus-container">
        <h1>🚫 FocusGuard Active</h1>
        <p>This site is blocked while you're studying. Solve a challenge or upload notes for an AI question.</p>

        <div id="challengeBlock">
          <p id="challenge">12 - 4</p>
          <input id="answerInput" placeholder="Enter answer here..." />
        </div>

        <hr style="margin: 20px 0; border-color: #444;">

        <input type="file" id="fileInput" accept=".txt">
        <button id="askAI">Ask AI from Notes</button>
        <p id="aiQuestion">No AI question loaded yet.</p>

        <button id="unlockButton">Unlock</button>
        <p id="statusMessage"></p>
      </div>
    `;

    // Static math question fallback
    const fallbackAnswer = "8";

    // Answer checker
    document.getElementById("unlockButton").addEventListener("click", () => {
      const input = document.getElementById("answerInput").value.trim();
      const status = document.getElementById("statusMessage");
      const aiText = document.getElementById("aiQuestion").textContent;

      // If AI was used, skip checking fallback
      const usingAI = aiText && !aiText.includes("No AI question");
      if (usingAI) {
        chrome.storage.local.set({ unlockGranted: true }, () => {
          chrome.runtime.sendMessage({ type: "unlock", url: window.location.href });
          location.reload();
        });
        return;
      }

      if (input === fallbackAnswer) {
        chrome.storage.local.set({ unlockGranted: true }, () => {
          chrome.runtime.sendMessage({ type: "unlock", url: window.location.href });
          location.reload();
        });
      } else {
        status.textContent = "❌ Incorrect. Try again.";
      }
    });

    // Gemini AI integration
    document.getElementById("askAI").addEventListener("click", async () => {
      const file = document.getElementById("fileInput").files[0];
      const status = document.getElementById("aiQuestion");

      if (!file || file.type !== "text/plain") {
        status.textContent = "❌ Please upload a valid .txt file.";
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result.slice(0, 8000);
        const prompt = `Generate one short study question based on this content:\n\n${content}`;

        const apiKey = "AIzaSyATkC3YEp1WnUX8pHfjAyt3TI4v6ztw6Cs"; // 🔁 Replace this
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;

        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          const data = await res.json();
          const question = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠ No question generated.";
          status.textContent = "🧠 " + question;
        } catch (err) {
          status.textContent = "⚠ Error: " + err.message;
        }
      };

      reader.readAsText(file);
    });
  }
});
