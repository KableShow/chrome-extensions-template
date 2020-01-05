chrome.runtime.onInstalled.addListener(function () {
  console.log('on onInstalled')
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log("The color is green.");
  });
})
