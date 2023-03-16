function handleRequest(request, sender, sendResponse) {
  if (request === "toggle")
    toggleSidebar();
}

chrome.runtime.onMessage.addListener(handleRequest);

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
        console.log(data);
        let parser = new DOMParser();
        let templateContent = parser.parseFromString(data, "text/html");
        let parseButton = templateContent.querySelector('#parse-button');
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
          let selectedLines = [];
          let rowSelectors = document.querySelectorAll('.line-selector:checked');
          rowSelectors.forEach(sel => {
            var row = sel.parentNode;
            var dataElem = row.querySelector('.blob-code .add-line-comment');
            console.log(dataElem.attributes['data-original-line']);
            selectedLines.push(dataElem.attributes['data-original-line'].value);
          });
          parsedLines.innerHTML = selectedLines.join('<br>');
          getReview(selectedLines.join('\n'));
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

document.body.onmouseup = function () {
  isSelectMode = false;
};
