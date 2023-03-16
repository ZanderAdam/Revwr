import { getSelectedLines } from './github.js';

function handleRequest(request, sender, sendResponse) {
  if (request === "toggle")
    toggleSidebar();
}

var sidebarOpen = false;
var isSelectMode = false;

function selectLine(event) {
  if (!isSelectMode)
    return;

  let selElem = event.target;
  selElem.checked = true;
}

function getReview(selectedCode) {
  fetch('http://localhost:3000/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: selectedCode
    })
  })
    .then(response => response.json())
    .then(data => {
      var displayElem = document.getElementById('parsed-lines');
      displayElem.innerHTML = data.review;
    })
    .catch(error => {
      console.error(error);
    });
}

function toggleSidebar() {
  if (sidebarOpen) {
    console.log('closing sidebar');
    var el = document.getElementById('side-panel');
    el.parentNode.removeChild(el);

    document.body.style.cssText = "margin-right: 0px;";

    sidebarOpen = false;
  } else {
    console.log('opening sidebar');
    fetch(chrome.runtime.getURL("template.html"))
      .then(response => response.text())
      .then(data => {
        let parser = new DOMParser();
        let templateContent = parser.parseFromString(data, "text/html");
        let parseButton = templateContent.querySelector('#parse-button');
        let closeButton = templateContent.querySelector('#close-button');
        let parsedLines = templateContent.querySelector('#parsed-lines');

        let codeLines = document.querySelectorAll('.diff-table tr');
        for (let i = 0; i < codeLines.length; i++) {
          let selElem = document.createElement('input');
          selElem.type = 'checkbox';
          selElem.className = 'line-selector';
          selElem.style.cssText = 'position: absolute;left: 0;';
          selElem.addEventListener('mouseover', selectLine);
          codeLines[i].appendChild(selElem);
        }

        parseButton.addEventListener('click', () => {
          const selectedLines = getSelectedLines(parsedLines);
          getReview(selectedLines);
        });

        closeButton.addEventListener('click', () => {
          toggleSidebar();
        });

        document.body.appendChild(templateContent.firstChild);

        document.body.style.cssText = "margin-right: 300px;";

        sidebarOpen = true;
      })
      .catch(error => {
        console.error(error);
      });
  }
}

document.body.onmousedown = function (event) {
  var element = event.target;
  if (element.classList.contains('line-selector')) {
    console.log('selecting');
    element.checked = true;
  }

  isSelectMode = true;
};



export function main() {
  console.log("main");
  chrome.runtime.onMessage.addListener(handleRequest);

  document.body.onmouseup = function () {
    isSelectMode = false;
  };
}
