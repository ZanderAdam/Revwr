const getSelectedLines = () => {
  let selectedLines = [];
  let rowSelectors = document.querySelectorAll('.line-selector:checked');
  rowSelectors.forEach(sel => {
    var row = sel.parentNode;
    var dataElem = row.querySelector('.blob-code .add-line-comment');

    if (dataElem && dataElem.hasAttribute('data-original-line'))
      selectedLines.push(dataElem.attributes['data-original-line'].value);
  });
  return selectedLines.join('\n');
};

function getPullRequestDiffs() {
  let files = document.querySelectorAll('.file');
  const parsedFiles = [];

  files.forEach(file => {
    const fileName = file.attributes['data-tagsearch-path'].value;
    const rowSelectors = file.querySelectorAll('.line-selector');

    const fileLines = [];

    rowSelectors.forEach(sel => {
      var row = sel.parentNode;
      var dataElem = row.querySelector('.blob-code .add-line-comment');
      if (!dataElem) return;
      fileLines.push(dataElem.attributes['data-original-line'].value);
    });

    const fileContent = fileLines.join('\n');

    parsedFiles.push({ fileName, fileContent });
  });

  return parsedFiles;
}

export { getSelectedLines, getPullRequestDiffs };
