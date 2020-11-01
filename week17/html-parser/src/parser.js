// const css = require("css");
// const layout = require('./layout');
const EOF = Symbol("EOF"); // end of file

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;
let stack = [{ type: "document", children: [] }];

function emit(token) {
  let top = stack[stack.length - 1];

  if (token.type === "startTag") {
    let element = {
      type: "element",
      children: [],
      attributes: [],
    };

    element.tagName = token.tagName;

    for (let p in token) {
      if (p !== "type" && p !== "tagName") {
        element.attributes.push({
          name: p,
          value: token[p],
        });
      }
    }
    // 简化版默认在start tag时就能判断元素匹配的css规则
    // computeCSS(element);
    top.children.push(element);
    // // console.log("emit -> top", top);
    // element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }
    currentTextNode = null;
  } else if (token.type === "endTag") {
    if (top.tagName === token.tagName) {
      // 遇到style标签时，执行添加css规则的操作
      //   if (top.tagName === "style") {
      //     addCSSRules(top.children[0].content);
      //   }
      //   layout(top);
      stack.pop();
    } else {
      throw new Error("Tag start end doesn't match!");
    }
    currentTextNode = null;
  } else if (token.type === "text") {
    if (currentTextNode === null) {
      currentTextNode = {
        type: "text",
        content: "",
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
  // //   console.log('stack', JSON.stringify(stack));
}

function data(c) {
  if (c === "<") {
    // 标签
    return tagOpen;
  } else if (c === EOF) {
    emit({
      type: "EOF",
    });
    return;
  } else {
    // 文本节点
    emit({
      type: "text",
      content: c,
    });
    return data;
  }
}

function tagOpen(c) {
  if (c === "/") {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: "",
    };
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: "",
    };
    return tagName(c);
  } else if (c === ">") {
    // 报错
    throw new Error(`Unexpected character: "${c}"`);
  } else if (c === EOF) {
    // 报错
    throw new Error(`Unexpected character: "${c}"`);
  } else {
    // 报错
    throw new Error(`Unexpected character: "${c}"`);
  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c === ">") {
    emit(currentToken);
    return data; // 标签结束
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c === EOF) {
  } else if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/" || c === ">" || c === EOF) {
    // console.log("beforeAttributeName -> c", c)
    if (c === "/") return selfClosingStartTag;
    if (c === ">") {
      emit(currentToken);
      return data;
    }
    return beforeAttributeName;
  } else if (c === "=") {
    return beforeAttributeName;
  } else {
    currentAttribute = {
      name: "",
      value: "",
    };
    return attirbuteName(c);
  }
}

function attirbuteName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
    // console.log("attirbuteName -> c", c)
    return afterAttributeName(c);
  } else if (c === "=") {
    return beforeAttributeValue;
  } else if (c === "\u0000") {
  } else if (c === '"' || c === "'" || c === "<") {
  }
  currentAttribute.name += c;
  return attirbuteName;
}

function afterAttributeName(c) {
  if (c === EOF) {
  } else if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">") {
    // console.log("afterAttributeName -> c", c, currentAttribute);
    currentToken[currentAttribute.name] = true;
    if (c === "/") return selfClosingStartTag;
    if (c === ">") {
      emit(currentToken);
      return data;
    }
    return beforeAttributeName;
  } else if (c === "=") {
    return beforeAttributeValue;
  }
  return afterAttributeName;
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c === "/" || c === EOF) {
    return beforeAttributeValue;
  } else if (c === '"') {
    return doubleQuotedAttributeValue;
  } else if (c === "'") {
    return singleQuotedAttributeValue;
  } else if (c === ">") {
    // return data;
  }
  return UnquotedAttributeValue(c);
}

function doubleQuotedAttributeValue(c) {
  if (c === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === "\u0000") {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === "\u0000") {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

function afterQuotedAttributeValue(c) {
  if (c === EOF) {
  } else if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else {
    throw new Error(`Unexpected character: "${c}"`);
  }
}

function UnquotedAttributeValue(c) {
  if (c === EOF) {
  } else if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue(c);
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c === "\u0000") {
  } else if (c === '"' || c === "'" || c === "<" || c === "=" || c === "`") {
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

function selfClosingStartTag(c) {
  if (c === ">") {
    currentToken.isSelfClosing = true;
    // console.log("selfClosingStartTag -> currentToken", currentToken)
    emit(currentToken);
    return data;
  } else if (c === EOF) {
    // 报错
  } else {
    // 报错
  }
}

export function parseHTML(html) {
  let state = data;
  stack = [{ type: "document", children: [] }];
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF); // EOF 作为最后一个状态给到状态机，用于强制闭合所有html标签
  // console.log(stack);
  // console.log(rules);
  return stack[0];
}
