// button switch (on or off)
const buttonInput = document.getElementById("unlockBtn");

// Initialize button state from storage
chrome.storage.local.get("blockingEnabled", (data) => {
  const enabled = data.blockingEnabled ?? true; // default to true
  updateButtonState(enabled); // change the color based on the button being on or off
});

// if the color is green, the button is enabled else the button is not enabled
function updateButtonState(isEnabled) {
  buttonInput.style.backgroundColor = isEnabled ? "rgb(76, 175, 80)" : "rgb(211, 47, 47)";
}

// enabling the button when it is clicked
buttonInput.addEventListener("click", () => {
  chrome.storage.local.get("blockingEnabled", (data) => {
    const currentlyEnabled = data.blockingEnabled ?? true;

    // if it was true, make it false. If it was false, make it true
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

// shows all the websites saved for blocking
function refreshSiteList() {
  chrome.storage.local.get("blockedSites", (data) => {
    const sites = data.blockedSites || [];
    list.innerHTML = "";

    // make a new list for each website added
    sites.forEach((site, i) => {
      const li = document.createElement("li");
      li.textContent = site;

      // creating a remove button for each website in the list
      const btn = document.createElement("button");
      btn.textContent = "Remove";

      // when the button is clicked we remove the website from the list 
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
  let site = siteInput.value.trim();

  if (!site) return;

  // Normalize the site input
  site = site
    .replace(/^[a-z]+:\/\//, "")     // remove http:// or https://
    .replace(/^ww[w\d]*\./, "")      // remove www., www2., ww. etc.
    .replace(/[^a-z0-9.-/]/g, "")    // remove bad characters (like ] or #)
    .split("/")[0];                          // remove any path after the domain

  chrome.storage.local.get("blockedSites", (data) => {
    const sites = data.blockedSites || [];

    // Only add if not already in the list
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.local.set({ blockedSites: sites }, refreshSiteList);
    }

    siteInput.value = ""; // Clear the input box
  });
});

// showing the blocked site list
refreshSiteList();