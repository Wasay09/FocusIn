const challenges = [
  { q: "5 + 3", a: "8" },
  { q: "12 - 4", a: "8" },
  { q: "6 * 2", a: "12" },
  { q: "15 / 3", a: "5" },
  { q: "9 + 6", a: "15" }
];

let current = challenges[Math.floor(Math.random() * challenges.length)];
document.getElementById("challengeText").textContent = `Solve: ${current.q} = ?`;

document.getElementById("unlockBtn").addEventListener("click", () => {
  document.getElementById("challengeBox").style.display = "block";
});

document.getElementById("submitAnswer").addEventListener("click", () => {
  const answer = document.getElementById("answerInput").value;
  if (answer == current.a) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.runtime.sendMessage({ type: "unlock", url: tabs[0].url });
      chrome.storage.local.set({ unlockGranted: true }, () => {
        document.getElementById("statusMsg").innerText = "✔ Access Granted!";
        chrome.tabs.reload(tabs[0].id);
      });
    });
  } else {
    document.getElementById("statusMsg").innerText = "❌ Incorrect. Try again.";
  }
});

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