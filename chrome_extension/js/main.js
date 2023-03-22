import { getSelectedLines, getPullRequestDiffs } from './github.js';

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
  return fetch('http://localhost:3000/review', {
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
      return data;
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
        let explainAllButton = templateContent.querySelector('#explain-all-button');
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
          getReview(selectedLines)
            .then(data => {
              var displayElem = document.getElementById('parsed-lines');
              displayElem.innerHTML = data.review;
            });
        });

        explainAllButton.addEventListener('click', () => {
          const parsedFiles = getPullRequestDiffs();
          displayAllDiffsAndExplanations(parsedFiles);
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

function displayAllDiffsAndExplanations(fileDiffs) {
  const displayElem = document.getElementById('parsed-lines');
  displayElem.innerHTML = '';

  fileDiffs.forEach((fileDiff, index) => {
    const fileContainer = document.createElement('div');
    fileContainer.className = 'file-container';

    const fileNameElem = document.createElement('h3');
    fileNameElem.textContent = fileDiff.fileName;
    fileContainer.appendChild(fileNameElem);

    const fileContentsElem = document.createElement('pre');
    fileContentsElem.className = 'file-contents';
    fileContentsElem.textContent = fileDiff.fileContent;
    fileContainer.appendChild(fileContentsElem);

    const explanationElem = document.createElement('div');
    explanationElem.className = 'explanation';
    explanationElem.id = `explanation-${index}`;

    getReview(fileDiff.fileContent).then((data) => {
      explanationElem.innerHTML = data.review;
    });

    fileContainer.appendChild(explanationElem);
    displayElem.appendChild(fileContainer);
  });
}

export function main() {
  console.log("main");
  chrome.runtime.onMessage.addListener(handleRequest);

  document.body.onmouseup = function () {
    isSelectMode = false;
  };
}
