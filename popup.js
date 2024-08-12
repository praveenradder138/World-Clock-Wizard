let timezones = [];

function getTimezones() {
  try {
    timezones = Intl.supportedValuesOf('timeZone');
  } catch (error) {
    console.error('Error fetching timezones:', error);
    timezones = [new Date().getTimezoneOffset()]; // Fallback to browser time
  }
}

function populateSelect(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Select a timezone</option>';
  timezones.forEach(tz => {
    const option = document.createElement('option');
    option.value = tz;
    option.text = tz;
    select.appendChild(option);
  });
}

function saveSelectedTimezones() {
  const selectedTimezones = [];
  for (let i = 1; i <= 4; i++) {
    const select = document.getElementById(`timezone${i}`);
    selectedTimezones.push(select.value);
  }
  chrome.storage.sync.set({selectedTimezones}, () => {
    updateClock();
  });
}

function loadSelectedTimezones() {
  chrome.storage.sync.get('selectedTimezones', ({selectedTimezones}) => {
    if (selectedTimezones) {
      selectedTimezones.forEach((tz, index) => {
        const select = document.getElementById(`timezone${index + 1}`);
        if (select && timezones.includes(tz)) select.value = tz;
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
    populateSelect(`timezone${i}`);
    document.getElementById(`timezone${i}`).addEventListener('change', saveSelectedTimezones);
  }
  
  loadSelectedTimezones();
  
  setInterval(updateClock, 1000);
});