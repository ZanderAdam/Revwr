function handleRequest(
    request,
    sender, sendResponse
) {
    if (request.callFunction == "toggleSidebar")
        toggleSidebar();
}
chrome.extension.onRequest.addListener(handleRequest);

var sidebarOpen = false;

function toggleSidebar() {
    if (sidebarOpen) {
        var el = document.getElementById('side-panel');
        el.parentNode.removeChild(el);
        sidebarOpen = false;
    } else {

        let sidePanel = document.createElement('div')
        let parseButton = document.createElement('button')

        sidePanel.id = 'side-panel'
        parseButton.id = 'parse-button'

        sidePanel.style.cssText =
            "position: fixed; top: 0; \
        right: 0; width: 300px; height: 100%; \
        background-color: #f1f1f1; \
        padding: 20px; box-sizing: border-box; \
        overflow-y: scroll; z-index:9999999999"
        parseButton.innerHTML = 'Parse'
        sidePanel.appendChild(parseButton)
        document.body.appendChild(sidePanel)

        document.body.appendChild(sidePanel);
        sidebarOpen = true;
    }
}