chrome.storage.local.get(["unlockGranted", "blockedSites", "blockingEnabled"], (data) => {
  const apiKey = "AIzaSyATkC3YEp1WnUX8pHfjAyt3TI4v6ztw6Cs";
  const unlock = data.unlockGranted;
  const blockedSites = data.blockedSites || [];
  const blockingEnabled = data.blockingEnabled ?? true;

  if (!blockingEnabled) return;

  const hostname = window.location.hostname.toLowerCase();

  const shouldBlock = blockedSites.some(site =>
    hostname.includes(site.toLowerCase().replace("www.", "").trim())
  );

  if (shouldBlock && !unlock) {
    document.head.innerHTML = `
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0f172a; /* Dark blue background */
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    
    .focus-container {
      background: rgba(59, 130, 246, 0.15); /* Lighter blue container */
      padding: 40px 30px;
      border-radius: 18px;
      text-align: center;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 0 20px rgba(0,0,0,0.6);
      position: relative;
      z-index: 1;
      border: 3px solid; /* Static border */
      border-image: linear-gradient(45deg, #1e40af, #60a5fa, #ffffff) 1; /* Blue and white gradient border */
    }
    
    h1 {
      font-size: 28px;
      margin-bottom: 18px;
      color: #ffffff;
    }
    
    p {
      font-size: 16px;
      margin-bottom: 16px;
      color: #e2e8f0;
    }
    
    input[type="text"],
    input[type="file"],
    textarea {
      padding: 12px;
      margin-top: 10px;
      font-size: 16px;
      width: 100%;
      max-width: 100%;
      border-radius: 8px;
      border: 1px solid #3b82f6; /* Blue border */
      box-sizing: border-box;
      background-color: rgba(30, 58, 138, 0.3); /* Semi-transparent blue */
      color: #fff;
      transition: border-color 0.3s;
    }
    
    input[type="text"]:focus,
    textarea:focus {
      border-color: #60a5fa; /* Lighter blue border on focus */
      outline: none;
    }
    
    input::placeholder {
      color: #94a3b8;
    }
    
    button {
      padding: 12px;
      margin-top: 12px;
      font-size: 16px;
      width: 100%;
      border-radius: 8px;
      background-color: #3b82f6; /* Lighter blue buttons */
      color: white;
      cursor: pointer;
      border: none;
      transition: background-color 0.3s, transform 0.2s;
    }
    
    /* Simple hover effect without animation */
    button:hover {
      background-color: #60a5fa; /* Even lighter blue on hover */
      transform: scale(1.02);
    }
    
    .row-inputs {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .row-inputs input[type="text"],
    .row-inputs input[type="file"] {
      flex: 1;
    }
    
    .button-row {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .button-row input[type="text"],
    .button-row input[type="file"] {
      flex: 1;
    }
    
    hr {
      margin: 25px 0;
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, #1e40af, #60a5fa, #ffffff, transparent); /* Blue and white gradient */
    }
    
    #aiQuestion {
      font-style: italic;
      color: #e2e8f0;
      margin-top: 12px;
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 8px;
      background-color: rgba(59, 130, 246, 0.2); /* Light blue background */
      border-left: 2px solid #60a5fa; /* Lighter blue accent */
    }
    
    #statusMessage {
      margin-top: 10px;
      font-size: 14px;
      color: #93c5fd; /* Very light blue */
    }
    
    #motivationModal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    
    .modal-content {
      background-color: rgba(59, 130, 246, 0.25); /* Lighter blue background */
      padding: 30px 40px;
      border-radius: 16px;
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-align: center;
      box-shadow: 0 0 25px rgba(0,0,0,0.7);
      animation: fadeInZoom 0.5s ease-in-out;
      max-width: 600px;
      border: 2px solid;
      border-image: linear-gradient(45deg, #1e40af, #60a5fa, #ffffff) 1; /* Blue and white gradient border */
    }
    
    @keyframes fadeInZoom {
      0% {
        opacity: 0;
        transform: scale(0.7);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  </style>`;

document.body.innerHTML = 
`<div class="focus-container">
    <h1>FocusIn</h1>
    <p>This site is blocked while you're studying. Ask Gemini to generate a question.</p>
    <p id="aiQuestion">No question loaded yet.</p>

    <div class="row-inputs">
      <input id="topicInput" type="text" placeholder="What are you studying?" />
      <input type="file" id="fileInput" accept=".txt">
    </div>

    <div class="button-row">
      <button id="askTopic">Ask Question from Topic</button>
      <button id="askAI">Ask Question from Notes</button>
    </div>

    <hr>

    <input id="answerInput" type="text" placeholder="Enter your answer..." />
    <button id="unlockButton">Unlock</button>
    <p id="statusMessage"></p>
  </div>
  
  <div id="motivationModal" style="display:none;">
    <div class="modal-content" id="motivationText"></div>
  </div>`;

    let questionLoaded = false;
    let storedQuestion = "";

    document.getElementById("askTopic").addEventListener("click", async () => {
      const topic = document.getElementById("topicInput").value.trim();
      const status = document.getElementById("aiQuestion");
      if (!topic) {
        status.textContent = "❌ Please enter a topic.";
        return;
      }
      const prompt = `Create a quiz question with a clear answer about: ${topic}. Respond in the format:\nQuestion: ...\nAnswer: ...`;
      await askGemini(prompt, status);
    });

    document.getElementById("askAI").addEventListener("click", () => {
      const file = document.getElementById("fileInput").files[0];
      const status = document.getElementById("aiQuestion");

      if (!file || file.type !== "text/plain") {
        status.textContent = "❌ Please upload a valid .txt file.";
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result.slice(0, 8000);
        const prompt = `Create a quiz question with a clear answer based on these notes:\n\n${content}\nRespond in the format:\nQuestion: ...\nAnswer: ...`;
        await askGemini(prompt, status);
      };
      reader.readAsText(file);
    });

    async function askGemini(prompt, statusElem) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText?.includes("Question:")) {
          const parts = responseText.split("Answer:");
          storedQuestion = parts[0].replace("Question:", "").trim();
          statusElem.textContent = "🧠 " + storedQuestion;
          questionLoaded = true;
        } else {
          statusElem.textContent = "⚠ Unexpected format.";
        }
      } catch (err) {
        statusElem.textContent = "⚠ Error: " + err.message;
      }
    }

    document.getElementById("unlockButton").addEventListener("click", async () => {
      const userAnswer = document.getElementById("answerInput").value.trim();
      const status = document.getElementById("statusMessage");

      if (!storedQuestion || !userAnswer) {
        status.textContent = "❌ Please provide an answer.";
        return;
      }

      const validationPrompt = `Is this a correct answer?\nQuestion: ${storedQuestion}\nUser Answer: ${userAnswer}\nRespond only YES or NO.`;

      try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: validationPrompt }] }] })
        });

        const data = await res.json();
        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text.toLowerCase();

        if (result.includes("yes")) {
          status.textContent = "✅ Correct! Generating a motivational message...";
        
          const motivationPrompt = "Create a motivational sentence about succuess and dedication for a user who got the correct answer for a quiz.";
          const motivationRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: motivationPrompt }] }] })
          });
        
          const motivationData = await motivationRes.json();
          const motivation = motivationData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Great job! Keep it up!";
        
          // Show popup
          document.getElementById("motivationText").textContent = motivation;
          document.getElementById("motivationModal").style.display = "flex";
        
          // Wait a bit before unlocking
          setTimeout(() => {
            chrome.storage.local.set({ unlockGranted: true }, () => {
              chrome.runtime.sendMessage({ type: "unlock", url: window.location.href });
              location.reload();
            });
          }, 3000); // Wait 3 seconds so they see the popup
        }
                
        else {
          status.textContent = "❌ Incorrect. Try again.";
        }
      } catch (err) {
        status.textContent = "⚠ Validation error: " + err.message;
      }
    });
  }
});