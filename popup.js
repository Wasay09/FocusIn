// button switch (on or off)
const buttonInput = document.getElementById("unlockBtn");

document.getElementById("unlockBtn").addEventListener("click", function () {
  if (this.style.backgroundColor === "rgb(76, 175, 80)") {
    this.style.backgroundColor = "rgb(211, 47, 47)";
  } else {
    this.style.backgroundColor = "rgb(76, 175, 80)";
  }  
});

// 🔒 Site Block List
const siteInput = document.getElementById("siteInput");
const addSite = document.getElementById("addSite");
const list = document.getElementById("blockedSitesList");

function refreshSiteList() {
  chrome.storage.local.get("blockedSites", (data) => {
    const sites = data.blockedSites || [];
    list.innerHTML = "";
    sites.forEach((site, i) => {
      const li = document.createElement("li");
      li.textContent = site;
      const btn = document.createElement("button");
      btn.textContent = "Remove";
      btn.onclick = () => {
        sites.splice(i, 1);
        chrome.storage.local.set({ blockedSites: sites }, refreshSiteList);
      };
      li.appendChild(btn);
      list.appendChild(li);
    });
  });
}

addSite.addEventListener("click", () => {
  const site = siteInput.value.trim();
  if (!site) return;
  chrome.storage.local.get("blockedSites", (data) => {
    const sites = data.blockedSites || [];
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.local.set({ blockedSites: sites }, refreshSiteList);
    }
    siteInput.value = "";
  });
});

refreshSiteList();

// // 💬 Gemini AI Integration
// const GEMINI_API_KEY = "AIzaSyCVIjBZ9Nyq9WDCqYfy1ZflrsqkXUZhCDc";  // Replace with your actual API key

// document.getElementById("askGeminiBtn").addEventListener("click", () => {
//   const userInput = document.getElementById("geminiInput").value.trim();
//   const responseDisplay = document.getElementById("geminiResponse");

//   if (!userInput) return;

//   responseDisplay.textContent = "⏳ Thinking...";

//   fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyCVIjBZ9Nyq9WDCqYfy1ZflrsqkXUZhCDc}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       contents: [{ parts: [{ text: userInput }] }]
//     })
//   })
//   .then(res => res.json())
//   .then(data => {
//     const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
//     responseDisplay.textContent = reply || "⚠️ No response from Gemini.";
//   })
//   .catch(() => {
//     responseDisplay.textContent = "❌ Error reaching Gemini API.";
//   });
// });