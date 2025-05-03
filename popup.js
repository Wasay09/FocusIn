// button switch (on or off)
// const buttonInput = document.getElementById("unlockBtn");

// document.getElementById("unlockBtn").addEventListener("click", function () {
//   if (this.style.backgroundColor === "rgb(76, 175, 80)") {
//     this.style.backgroundColor = "rgb(211, 47, 47)";
//   } else {
//     this.style.backgroundColor = "rgb(76, 175, 80)";
//   }  
// });

const buttonInput = document.getElementById("unlockBtn");

// Initialize button state from storage
chrome.storage.local.get("blockingEnabled", (data) => {
  const enabled = data.blockingEnabled ?? true; // default to true
  updateButtonState(enabled);
});

function updateButtonState(isEnabled) {
  buttonInput.style.backgroundColor = isEnabled ? "rgb(76, 175, 80)" : "rgb(211, 47, 47)";
}

buttonInput.addEventListener("click", () => {
  chrome.storage.local.get("blockingEnabled", (data) => {
    const currentlyEnabled = data.blockingEnabled ?? true;
    const newValue = !currentlyEnabled;

    chrome.storage.local.set({ blockingEnabled: newValue }, () => {
      updateButtonState(newValue);
    });
  });
});

// site Block List
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