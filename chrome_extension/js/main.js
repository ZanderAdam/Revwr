import { getSelectedLines, getPullRequestDiffs } from './github.js';

function handleRequest(request, sender, sendResponse) {
  if (request === "toggle")
    toggleSidebar();
}

let sidebarOpen = false;
let isSelectMode = false;
let isSelectedLinesMode = false;

function selectLine(event) {
  if (!isSelectMode)
    return;

  const selElem = event.target;
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

function displayAllFiles() {
  const fileDiffs = getPullRequestDiffs();
  isSelectedLinesMode = true;

  const displayElem = document.getElementById('parsed-lines');
  displayElem.innerHTML = '';

  fileDiffs.forEach((fileDiff) => {
    const explanationElem = createFileContents(fileDiff.fileName, fileDiff.fileContent, displayElem);

    const explainButton = document.createElement('button');
    explainButton.textContent = 'Explain';
    explainButton.className = 'explain-button';

    explainButton.addEventListener('click', () => {
      showSpinner(explanationElem);
      getReview(fileDiff.fileContent).then((data) => {
        explanationElem.innerHTML = data.review;
      });
    });

    explanationElem.appendChild(explainButton);

  });
}

function handleParseButtonClick(templateContent) {
  isSelectedLinesMode = true;

  const explainAllButton = templateContent.querySelector('#explain-all-button');
  explainAllButton.innerHTML = "Show All Files";

  const displayElem = document.getElementById('parsed-lines');
  displayElem.innerHTML = '';

  const selectedLines = getSelectedLines();

  const explanationElem = createFileContents('', selectedLines, displayElem, false);

  showSpinner(explanationElem);

  getReview(selectedLines).then(data => {
    explanationElem.innerHTML = data.review;
  });;
}

function createFileContents(fileName, selectedDiff, parentElem, hideContents = true) {
  const fileContainer = document.createElement('div');
  fileContainer.className = 'file-container';

  const fileNameElem = document.createElement('h3');
  fileNameElem.textContent = fileName;
  fileContainer.appendChild(fileNameElem);

  const fileContentsElem = document.createElement('pre');
  fileContentsElem.className = 'file-contents';
  fileContentsElem.textContent = selectedDiff;

  if (hideContents)
    fileContentsElem.style.display = 'none';

  fileContainer.appendChild(fileContentsElem);

  fileNameElem.addEventListener('click', () => {
    fileContentsElem.style.display = fileContentsElem.style.display === 'none' ? 'block' : 'none';
  });

  const explanationElem = document.createElement('div');
  explanationElem.className = 'explanation';

  fileContainer.appendChild(explanationElem);
  parentElem.appendChild(fileContainer);

  return explanationElem;
}

function handleExplainAllButtonClick(templateContent) {
  const explainAllButton = templateContent.querySelector('#explain-all-button');
  explainAllButton.innerHTML = "Explain All";

  if (isSelectedLinesMode) {
    isSelectedLinesMode = false;
    displayAllFiles();
    return;
  }

  const explainButtons = document.querySelectorAll('.explain-button');
  explainButtons.forEach(button => {
    button.click();
  });
}

function handleCloseButtonClick() {
  toggleSidebar();
}

function attachResizeHandler(templateContent) {
  const resizeHandle = templateContent.querySelector('#revwr .resize-handle');
  const sidePanel = templateContent.querySelector('#revwr #side-panel');
  let dragging = false;
  let startX;

  resizeHandle.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    dragging = true;
  });

  window.addEventListener('mousemove', (e) => {
    if (dragging) {
      const currentWidth = sidePanel.offsetWidth;
      const deltaX = startX - e.clientX;
      const newWidth = currentWidth + deltaX;

      const newWidthStr = `${newWidth}px`;
      sidePanel.style.width = newWidthStr;
      document.body.style.cssText = `margin-right: ${newWidthStr};`;
      startX = e.clientX;
    }
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });
}

function setupEventListeners(templateContent) {
  const parseButton = templateContent.querySelector('#parse-button');
  const explainAllButton = templateContent.querySelector('#explain-all-button');
  const closeButton = templateContent.querySelector('#close-button');

  parseButton.addEventListener('click', () => { handleParseButtonClick(templateContent); });
  explainAllButton.addEventListener('click', () => { handleExplainAllButtonClick(templateContent); });
  closeButton.addEventListener('click', handleCloseButtonClick);
  attachResizeHandler(templateContent);
}

function appendCheckboxesToCodeLines() {
  const codeLines = document.querySelectorAll('.diff-table tr');
  for (let i = 0; i < codeLines.length; i++) {
    const selElem = document.createElement('input');
    selElem.type = 'checkbox';
    selElem.className = 'line-selector';
    selElem.style.cssText = 'position: absolute;left: 0;';
    selElem.addEventListener('mouseover', selectLine);
    codeLines[i].appendChild(selElem);
  }
}

function showSpinner(parentNode) {
  const spinnerContainer = document.createElement('div');
  spinnerContainer.className = 'spinner-container';
  const spinner = document.createElement('div');
  spinner.className = 'spinner';

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    spinner.appendChild(dot);
  }

  spinnerContainer.appendChild(spinner);
  parentNode.replaceChildren(spinnerContainer);
}

function openSidebar() {
  console.log('opening sidebar');
  fetch(chrome.runtime.getURL("template.html"))
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const templateContent = parser.parseFromString(data, "text/html").firstChild;

      setupEventListeners(templateContent);
      appendCheckboxesToCodeLines();

      document.body.appendChild(templateContent);
      document.body.style.cssText = "margin-right: 600px;";

      displayAllFiles();

      sidebarOpen = true;
    })
    .catch(error => {
      console.error(error);
    });
}

function closeSidebar() {
  console.log('closing sidebar');
  const el = document.getElementById('side-panel');
  el.parentNode.removeChild(el);

  document.body.style.cssText = "margin-right: 0px;";

  sidebarOpen = false;
}

function toggleSidebar() {
  if (
    sidebarOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function handleMouseDown(event) {
  const element = event.target;
  if (element.classList.contains('line-selector')) {
    console.log('selecting');
    element.checked = true;
    isSelectMode = true;
  }
}

function handleMouseUp() {
  isSelectMode = false;
}

export function main() {
  console.log("main");
  chrome.runtime.onMessage.addListener(handleRequest);

  document.body.onmousedown = handleMouseDown;
  document.body.onmouseup = handleMouseUp;
}
