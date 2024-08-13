let timezones = [];

function getTimezones() {
  try {
    timezones = Intl.supportedValuesOf('timeZone');
  } catch (error) {
    console.error('Error fetching timezones:', error);
    timezones = ['UTC']; // Fallback to just UTC if there's an error
  }
}

function autocomplete(inp) {
  let currentFocus;
  inp.addEventListener("input", function(e) {
    let a, b, i, val = this.value;
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    for (i = 0; i < timezones.length; i++) {
      if (timezones[i].toLowerCase().includes(val.toLowerCase())) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + timezones[i].substr(0, val.length) + "</strong>";
        b.innerHTML += timezones[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + timezones[i] + "'>";
        b.addEventListener("click", function(e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
          saveSelectedTimezones();
        });
        a.appendChild(b);
      }
    }
  });
  inp.addEventListener("keydown", function(e) {
    let x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

function saveSelectedTimezones() {
  const selectedTimezones = [];
  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`timezone${i}`);
    selectedTimezones.push(input.value);
  }
  chrome.storage.sync.set({selectedTimezones}, () => {
    updateClock();
  });
}

function loadSelectedTimezones() {
  chrome.storage.sync.get('selectedTimezones', ({selectedTimezones}) => {
    if (selectedTimezones) {
      selectedTimezones.forEach((tz, index) => {
        const input = document.getElementById(`timezone${index + 1}`);
        if (input && timezones.includes(tz)) input.value = tz;
      });
    }
    updateClock();
  });
}

function updateClock() {
  chrome.storage.sync.get('selectedTimezones', ({selectedTimezones}) => {
    const clockDiv = document.getElementById('clock');
    clockDiv.innerHTML = '';
    if (selectedTimezones && selectedTimezones.some(tz => tz !== '')) {
      selectedTimezones.forEach(tz => {
        if (tz) {
          const time = new Date().toLocaleTimeString('en-US', {timeZone: tz});
          clockDiv.innerHTML += `${tz}: ${time}<br>`;
        }
      });
    } else {
      clockDiv.innerHTML = 'Please select at least one timezone.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getTimezones();
  
  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`timezone${i}`);
    autocomplete(input);
    input.addEventListener('change', saveSelectedTimezones);
  }
  
  loadSelectedTimezones();
  
  setInterval(updateClock, 1000);
});