const getPriority = (item) => {
  if (['*', '/'].includes(item)) {
    return 2;
  }

  if (['+', '-'].includes(item)) {
    return 1;
  }
}

const isNumber = (item) => {
  return item == parseFloat(item)
}

const isOperator = (operator) => {
  return ['+', '-', '*', '/'].includes(operator);
}

const isParentheses = (item) => {
  return ['(', ')'].includes(item);
}

const isOpenParentheses = (item) => {
  return item === '('
}

const isCloseParentheses = (item) => {
  return item === ')'
}

const isAdd = (operator) => {
  return operator === '+';
}

const isSub = (operator) => {
  return operator === '-';
}

const isMulti = (operator) => {
  return operator === '*';
}

const isDiv = (operator) => {
  return operator === '/';
}

const isSquareBrackets = (item) => {
  return ['[', ']'].includes(item);
}

const isOpenSquareBrackets = (item) => {
  return item === '[';
}

const isCloseSquareBrackets = (item) => {
  return item === ']';
}

const isComma = (comma) => {
  return comma === ',';
}

module.exports = {
  getPriority,
  isNumber,
  isOperator,
  isOpenParentheses,
  isCloseParentheses,
  isParentheses,
  isAdd,
  isSub,
  isMulti,
  isDiv,
  isSquareBrackets,
  isOpenSquareBrackets,
  isCloseSquareBrackets,
  isComma
}