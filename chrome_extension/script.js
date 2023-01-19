function handleRequest(request, sender, sendResponse) {
    if (request === "toggle")
        toggleSidebar()
}

chrome.runtime.onMessage.addListener(handleRequest);

var sidebarOpen = false;
var isSelectMode = false;

function selectLine(event) {
    if (!isSelectMode)
        return;

    let selElem = event.target
    selElem.checked = true;
}

function toggleSidebar() {
    if (sidebarOpen) {
        var el = document.getElementById('side-panel');
        el.parentNode.removeChild(el);
        sidebarOpen = false;
    } else {
        let codeLines = document.querySelectorAll('.diff-table tr')
        for (let i = 0; i < codeLines.length; i++) {
            let selElem = document.createElement('input')
            selElem.type = 'checkbox'
            selElem.className = 'line-selector'
            selElem.style.cssText = 'position: absolute;left: 0;'
            selElem.addEventListener('mouseover', selectLine)
            codeLines[i].appendChild(selElem)
        }

        let sidePanel = document.createElement('div')
        let parseButton = document.createElement('button')
        let parsedLines = document.createElement('div')

        sidePanel.id = 'side-panel'
        parseButton.id = 'parse-button'
        parsedLines.id = 'parsed-lines'

        sidePanel.style.cssText =
            "position: fixed; top: 0; \
        right: 0; width: 300px; height: 100%; \
        background-color: #f1f1f1; \
        padding: 20px; box-sizing: border-box; \
        overflow-y: scroll; z-index:9999999999"
        parseButton.innerHTML = 'Parse'
        sidePanel.appendChild(parseButton)
        sidePanel.appendChild(parsedLines)
        document.body.appendChild(sidePanel)

        parseButton.addEventListener('click', () => {
            let selectedLines = []
            let rowSelectors = document.querySelectorAll('.line-selector:checked')
            rowSelectors.forEach(sel => {
                var row = sel.parentNode
                var dataElem = row.querySelector('.blob-code .add-line-comment')
                console.log(dataElem.attributes['data-original-line'])
                selectedLines.push(dataElem.attributes['data-original-line'].value)
            })
            parsedLines.innerHTML = selectedLines.join('<br>')
        })
        document.body.appendChild(sidePanel);
        sidebarOpen = true;
    }
}

document.body.onmousedown = function (event) {
    var element = event.target
    console.log(element)
    if (element.classList.contains('line-selector')) {
        console.log('selecting')
        element.checked = true
    }

    isSelectMode = true
}

document.body.onmouseup = function () {
    isSelectMode = false
}