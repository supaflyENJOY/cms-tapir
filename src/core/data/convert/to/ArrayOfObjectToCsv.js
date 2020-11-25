



const checkSpecialCharsAndEmpty = (value) => {
  const thisValue = value.toString().toLowerCase();
  let hasSpecialChars = false;
  if (typeof value === 'string') {
    hasSpecialChars = thisValue.includes('\n')
      || thisValue.includes('\t')
      || thisValue.includes(',')
      || thisValue.includes(';')
      || thisValue.includes('.')
      || thisValue.includes('"')
      || thisValue.includes('\'')
      || thisValue.includes('`')
      || thisValue.includes('´')
      || thisValue.includes(' ')
      || thisValue.length === 0;
  }

  return hasSpecialChars;
};


const separatorOrLineBreak = (length, elementIdx, separator) => (
  length - 1 === elementIdx ? '\n' : separator
);

const escapeDoubleQuotesInsideElement = (element) => {
  const thisElement = element.replace(/"/g, '""');

  return thisElement;
};

const appendElement = (element, lineLength, elementIdx, separator) => {
  const includesSpecials = checkSpecialCharsAndEmpty(element);

  let thisElement = element;

  if (includesSpecials) {
    thisElement = escapeDoubleQuotesInsideElement(thisElement);
  }

  return (
    includesSpecials
      ? `"${thisElement}"${separatorOrLineBreak(lineLength, elementIdx, separator)}`
      : `${thisElement}${separatorOrLineBreak(lineLength, elementIdx, separator)}`
  );
};
const toCSV = data => convertArrayOfObjectsToCSV(data, {separator: ','});


const convertArrayOfObjectsToCSV = (data, { header, separator }) => {
  const array = [...data];
  let csv = '';

  if (header) {
    header.forEach((headerEl, i) => {
      const thisHeaderEl = headerEl || (headerEl === 0 ? 0 : '');

      csv += appendElement(thisHeaderEl, header.length, i, separator);
    });
  }

  array.forEach((row, idx) => {
    const thisRow = Object.keys(row);
    if (!header && idx === 0) {
      thisRow.forEach((key, i) => {
        const value = key || (key === 0 ? 0 : '');

        csv += appendElement(value, thisRow.length, i, separator);
      });
    }

    thisRow.forEach((key, i) => {
      const value = row[key] || (row[key] === 0 ? 0 : '');

      csv += appendElement(value, thisRow.length, i, separator);
    });
  });

  return csv;
};