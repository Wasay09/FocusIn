document.addEventListener("DOMContentLoaded", () => {
  // Button toggle logic
  const buttonInput = document.getElementById("unlockBtn");
  chrome.storage.local.get("blockingEnabled", (data) => {
    const enabled = data.blockingEnabled ?? true;
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

  // Site block list logic
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
    let site = siteInput.value.trim().toLowerCase();

    if (!site) return;

    site = site
      .replace(/^https?:\/\//, "")
      .replace(/^.*?(?=www\.)/, "")
      .replace(/^www\./, "")
      .replace(/[^a-z0-9.-/]/g, "")
      .split("/")[0];

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

  // Calendar Logic
  let currentMonth = new Date();
  const monthGrid = document.getElementById("monthGrid");
  const monthYearText = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const statsDisplay = document.getElementById("monthStats");

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function renderMonth(focusDays) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const focusSet = new Set(focusDays);

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    monthYearText.textContent = currentMonth.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    monthGrid.innerHTML = "";

    dayNames.forEach(day => {
      const cell = document.createElement("div");
      cell.className = "day-name";
      cell.textContent = day;
      monthGrid.appendChild(cell);
    });

    let focusCount = 0;
    const totalGridDays = 42;

    for (let i = 0; i < startDay; i++) {
      const day = daysInPrevMonth - startDay + i + 1;
      const cell = document.createElement("div");
      cell.textContent = day;
      cell.className = "other-month";
      monthGrid.appendChild(cell);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDate(date);
      const cell = document.createElement("div");
      cell.textContent = i;

      if (focusSet.has(dateStr)) {
        cell.classList.add("focus-day");
        focusCount++;
      }

      monthGrid.appendChild(cell);
    }

    const daysRendered = startDay + daysInMonth;
    const remainingCells = totalGridDays - daysRendered;
    for (let i = 1; i <= remainingCells; i++) {
      const cell = document.createElement("div");
      cell.textContent = i;
      cell.className = "other-month";
      monthGrid.appendChild(cell);
    }

    statsDisplay.textContent = `${focusCount} focus day${focusCount !== 1 ? "s" : ""} this month`;
  }

  prevMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    loadCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    loadCalendar();
  });

  function loadCalendar() {
    chrome.storage.local.get("focusDays", (data) => {
      renderMonth(data.focusDays || []);
    });
  }

  loadCalendar();
});
