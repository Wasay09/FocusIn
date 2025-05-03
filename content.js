chrome.storage.local.get(["unlockGranted", "blockedSites"], (data) => {
  const unlock = data.unlockGranted;
  const blockedSites = data.blockedSites || [];
  const hostname = window.location.hostname.toLowerCase();

  const shouldBlock = blockedSites.some(site => {
    return hostname.includes(site.toLowerCase().replace("www.", "").trim());
  });

  if (shouldBlock && !unlock) {
    document.head.innerHTML = 
`<style>
  body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #a8e6cf, #000000); /* light green to black */
    color: #fff;
    font-family: 'Segoe UI', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  .focus-container {
    background: rgba(0, 0, 0, 0.85);
    padding: 40px 30px;
    border-radius: 18px;
    text-align: center;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 0 20px rgba(0,0,0,0.6);
  }
  h1 {
    font-size: 28px;
    margin-bottom: 18px;
  }
  p {
    font-size: 16px;
    margin-bottom: 16px;
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
    border: 1px solid #ccc;
    box-sizing: border-box;
    background-color: white;
    color: #fff;
  }
  input:placeholder {
    color: #aaa;
  }
  button {
    padding: 12px;
    margin-top: 12px;
    font-size: 16px;
    width: 100%;
    border-radius: 8px;
    border: none;
    background: #1abc9c;
    color: white;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s, box-shadow 0.2s;
  }
  button:hover {
    background: #16a085;
    transform: scale(1.03);
    box-shadow: 0 4px 10px rgba(26, 188, 156, 0.4);
  }
  hr {
    margin: 25px 0;
    border: none;
    height: 1px;
    background-color: #444;
  }
  #aiQuestion {
    font-style: italic;
    color: #ffd;
    margin-top: 12px;
    margin-bottom: 8px;
  }
  #statusMessage {
    margin-top: 10px;
    font-size: 14px;
  }
</style>`;

document.body.innerHTML = 
`<div class="focus-container">
  <h1>FocusGuard AI</h1>
  <p>This site is blocked while you're studying. Ask Gemini to generate a question.</p>

  <p id="aiQuestion">No question loaded yet.</p>

  <input id="topicInput" type="text" placeholder="What are you studying?" />
  <button id="askTopic">Ask Question from Topic</button>

  <hr>
  <input type="file" id="fileInput" accept=".txt">
  <button id="askAI">Ask Question from Notes</button>

  <hr>
  <input id="answerInput" type="text" placeholder="Enter your answer..." />

  <button id="unlockButton">Unlock</button>
  <p id="statusMessage"></p>
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
      await askGemini(`Create a quiz question with a clear answer about: ${topic}. Respond in the format:\nQuestion: ...\nAnswer: ...`, status);
    });

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
<<<<<<< HEAD
        const prompt = `Generate one short study question based on this content:\n\n${content}`;

        const apiKey = "AIzaSyATkC3YEp1WnUX8pHfjAyt3TI4v6ztw6Cs";
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
=======
        const prompt = `Create a quiz question with a clear answer based on these notes:\n\n${content}\nRespond in the format:\nQuestion: ...\nAnswer: ...`;
        await askGemini(prompt, status);
>>>>>>> 7b8a222 (changed interface)
      };

      reader.readAsText(file);
    });

    async function askGemini(prompt, statusElem) {
      const apiKey = "AIzaSyATkC3YEp1WnUX8pHfjAyt3TI4v6ztw6Cs"; // your Gemini API key
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await res.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText && responseText.includes("Question:")) {
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

      const apiKey = "AIzaSyATkC3YEp1WnUX8pHfjAyt3TI4v6ztw6Cs";
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

      const validationPrompt = `Is this a correct answer?\nQuestion: ${storedQuestion}\nUser Answer: ${userAnswer}\nRespond only YES or NO.`;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: validationPrompt }] }]
          })
        });

        const data = await res.json();
        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text.toLowerCase();

        if (result.includes("yes")) {
          chrome.storage.local.set({ unlockGranted: true }, () => {
            chrome.runtime.sendMessage({ type: "unlock", url: window.location.href });
            location.reload();
          });
        } else {
          status.textContent = "❌ Incorrect. Try again.";
        }
      } catch (err) {
        status.textContent = "⚠ Validation error: " + err.message;
      }
    });
  }
});