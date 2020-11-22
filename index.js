const express = require("express");
const app = express();
app.use(express.static("public"));
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.set("views", "./views");

const Stack = require('./Stack');
const Queue = require('./Queue');
const {
  isNumber,
  isOperator,
  getPriority,
  isOpenParentheses,
  isCloseParentheses,
  isParentheses,
  isAdd,
  isDiv,
  isSub,
  isSquareBrackets,
  isOpenSquareBrackets,
  isCloseSquareBrackets,
  isComma
} = require('./services');

const PORT = 3001;

const getSplitData = (data) => {
  let arrString;
  if (typeof data === 'string') {
    arrString = data.split('');
  } else {
    arrString = data;
  }
  const result = [];
  for (let i = 0; i < arrString.length; ++i) {
    if (isNumber(arrString[i]) || isComma(arrString[i])) {
      result.push(arrString[i]);
    } else if (isOperator(arrString[i]) || isParentheses(arrString[i])) {
      while (isOperator(arrString[i]) || isParentheses(arrString[i])) {
        result.push(arrString[i++]);
      }
      let number = '';
      while (isNumber(arrString[i])) {
        number += arrString[i++]
      }
      if (number.length) {
        result.push(number);
        --i;
      }
      if (!number.length) {
        --i;
      }
    } else if (['s', 'c'].includes(arrString[i])) {
      let sin = '';
      while (!isOperator(arrString[i]) && !isParentheses(arrString[i]) && !isNumber(arrString[i]) && i < arrString.length) {
        sin += arrString[i++];
      }
      result.push(sin);
      --i;
    } else if (arrString[i] === 'p') {
      let pow = '';
      while (!isOperator(arrString[i]) && !isSquareBrackets(arrString[i]) && !isNumber(arrString[i]) && i < arrString.length) {
        pow += arrString[i++];
      }
      result.push(pow);
      --i;
    } else if (isOpenSquareBrackets(arrString[i])) {
      result.push(arrString[i++]);
      let num = '';
      while (!isComma(arrString[i])) {
        num += arrString[i++];
      }
      result.push(num);
      i++;
      let num2 = '';
      while (!isCloseSquareBrackets(arrString[i])) {
        num2 += arrString[i++];
      }
      result.push(num2);
      result.push(arrString[i++]);
      --i;
    } else {
      return 'An error has been occurred'
    }
  }
  return result;
}

const calculateArrayData = (arrayData) => {
  const result = [];
  for (let i = 0; i < arrayData.length; ++i) {
    if (['sin', 'cos'].includes(arrayData[i])) {
      i += 2;
      let countParentheses = 1;
      const expressionInSinOrCos = [];
      while (!(isCloseParentheses(arrayData[i]) && countParentheses === 0)) {
        if (isOpenParentheses(arrayData[i])) {
          countParentheses++;
        }
        if (isCloseParentheses(arrayData[i + 1])) {
          countParentheses--;
        }
        expressionInSinOrCos.push(arrayData[i]);
        ++i;
      }
      const resultSinOrCode = handleData(expressionInSinOrCos);
      result.push(Math.sin(parseFloat(resultSinOrCode * Math.PI / 180)));
    } else if (arrayData[i] === 'pow') {
      const powXY = Math.pow(parseInt(arrayData[i + 2]), parseInt(arrayData[i + 3]));
      if (!powXY) {
        return 'An error has been occurred';
      }
      result.push(powXY);
      i += 4;
    } else {
      result.push(arrayData[i]);
    }
  }
  return result;
}

const handleData = (data) => {
  const stack1 = new Stack();
  const queue = new Queue();
  const arrayData = getSplitData(data);
  if (typeof arrayData !== 'object') {
    return 'An error has been occurred';
  }

  const arrayCalculatedData = calculateArrayData(arrayData);
  if (typeof arrayCalculatedData !== 'object') {
    return 'An error has been occurred';
  }

  for (const element of arrayCalculatedData) {
    if (isNumber(element)) {
      queue.enqueue(parseFloat(element));
    } else if (isOperator(element)) {
      if (stack1.length) {
        const popOperator = stack1.pop();
        if (getPriority(popOperator) >= getPriority(element)) {
          queue.enqueue(popOperator);
          stack1.push(element)
        } else {
          stack1.push(popOperator);
          stack1.push(element);
        }
      } else {
        stack1.push(element);
      }
    } else if (isOpenParentheses(element) || isCloseParentheses(element)) {
      if (isOpenParentheses(element)) {
        stack1.push(element)
      } else {
        while (stack1.length) {
          const operator = stack1.pop();
          if (isOpenParentheses(operator)) {
            break;
          }
          queue.enqueue(operator);
        }
      }
    } else {
      return 'An error has been occurred';
    }

  }
  if (stack1.length) {
    while (stack1.length) {
      const popOperator = stack1.pop();
      queue.enqueue(popOperator)
    }
  }

  const stack2 = new Stack();
  while (queue.length) {
    const topItem = queue.dequeue();
    if (isNumber(topItem)) {
      stack2.push(topItem);
    } else if (isOperator(topItem)) {
      const firstItem = stack2.pop();
      const secondItem = stack2.pop();
      if (isAdd(topItem)) {
        stack2.push(secondItem + firstItem);
      } else if (isSub(topItem)) {
        stack2.push(secondItem - firstItem);
      } else if (isDiv(topItem)) {
        stack2.push(secondItem / firstItem);
      } else {
        stack2.push(secondItem * firstItem);
      }
    } else {
      return 'An error has been occurred';
    }
  }

  const result = stack2.pop();
  return result;
}

server.listen(PORT);

io.sockets.on("connection", function (socket) {
  console.log('connected');
  console.log('123123123', socket.request);
  socket.on("disconnect", function () {
  });
  //server lắng nghe dữ liệu từ client
  socket.on("client-sent-data", async function (data) {
    try {
      const newData = await handleData(data);
      //sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
      socket.emit("server-sent-data", { IP: '123', value: newData });
    } catch (err) {
      throw err;
    }
  });
});
