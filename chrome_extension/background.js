chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, 'toggle');
});
