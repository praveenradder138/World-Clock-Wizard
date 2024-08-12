chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.sync.set({selectedTimezones: [Intl.DateTimeFormat().resolvedOptions().timeZone]});
  });