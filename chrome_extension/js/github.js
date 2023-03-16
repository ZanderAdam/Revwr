const getSelectedLines = (parsedLines) => {
  let selectedLines = [];
  let rowSelectors = document.querySelectorAll('.line-selector:checked');
  rowSelectors.forEach(sel => {
    var row = sel.parentNode;
    var dataElem = row.querySelector('.blob-code .add-line-comment');
    console.log(dataElem.attributes['data-original-line']);
    selectedLines.push(dataElem.attributes['data-original-line'].value);
  });
  parsedLines.innerHTML = selectedLines.join('<br>');
  return selectedLines.join('\n');
};

exports.getSelectedLines = getSelectedLines;
