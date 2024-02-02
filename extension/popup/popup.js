let imgData;
let isActive = false;

chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
    dataImg = dataUrl;
    imgData = dataUrl;
    isActive = !isActive; // Toggle the state
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "displayImage", message: dataImg, active: isActive});
    });
});
