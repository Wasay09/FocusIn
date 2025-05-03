chrome.storage.local.get(["unlockGranted", "blockedSites"], (data) => {
  const unlock = data.unlockGranted;
  const blockedSites = data.blockedSites || [];
  const hostname = window.location.hostname.toLowerCase();

  const shouldBlock = blockedSites.some(site => {
    return hostname.includes(site.toLowerCase().replace("www.", "").trim());
  });

  if (shouldBlock && !unlock) {
    document.body.innerHTML = `
      <div style="font-size:30px; padding:50px; text-align:center; background-color:black; color:white;">
        🚫 Blocked by FocusGuard<br><br>
        This site is blocked while you're studying.<br>
        Solve the challenge in the extension popup to continue.
      </div>`;
  }
});