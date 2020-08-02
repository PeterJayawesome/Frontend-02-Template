const css = require("css");
const layout = require('./layout');
const EOF = Symbol("EOF"); // end of file

let currentToken = null;
let currentAttribute = null;
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
    computeCSS(element);
    top.children.push(element);
    // element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }
    currentTextNode = null;
  } else if (token.type === "endTag") {
    if (top.tagName === token.tagName) {
      // 遇到style标签时，执行添加css规则的操作
      if (top.tagName === "style") {
        addCSSRules(top.children[0].content);
      }
      layout(top);
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
}
// css规则
let rules = [];

function addCSSRules(text) {
  var ast = css.parse(text);
  // console.log(JSON.stringify(ast, null, "   "));
  rules.push(...ast.stylesheet.rules);
}

function computeCSS(elem) {
  let elements = stack.slice().reverse();

  if (!elem.computedStyle) elem.computedStyle = {};

  for (let rule of rules) {
    let selectorParts = rule.selectors[0].split(" ").reverse();
    // 如果选择器最末一个没有和elem匹配则跳过
    if (!match(elem, selectorParts[0])) continue;

    // let matched = false;

    let j = 1;
    // 双循环elements和selectorParts来进行匹配
    elements.forEach((element) => {
      match(element, selectorParts[j]) && j++;
    });

    // for (var i = 0; i < elements.length; i++) {
    //   if (match(elements[i], selectorParts[j])) {
    //     j++;
    //   }
    // }

    let matched = j >= selectorParts.length;

    // if (j >= selectorParts.length) matched = true;

    if (matched) {
      // 如果匹配到
      let computedStyle = elem.computedStyle;
      const sp = specificity(rule.selectors[0]);
      // for (let declaration of rule.declaration) {
      //   if (!computedStyle[declaration.property]) {
      //     computedStyle[declaration.property] = {};
      //   }
      //   computedStyle[declaration.property].value = declaration.value
      // }
      rule.declarations.forEach(({ property, value }) => {
        if (!computedStyle[property]) computedStyle[property] = {};
        // 此前没有匹配到规则或者之前的规则优先级不高于本次匹配到的规则
        if (!computedStyle[property].specificity || compare(computedStyle[property].specificity, sp) <= 0) {
          computedStyle[property].value = value;
          computedStyle[property].specificity = sp;
        }
      });
    }
  }
}

function match(elem, selector) {
  // 没有selector或elem是文本节点
  if (!selector || !elem.attributes) return false;
  if (selector.charAt(0) === "#") {
    // id选择器
    let attr = elem.attributes.find((attr) => attr.name === "id");
    return attr && attr.value === selector.replace("#", "");
  } else if (selector.charAt(0) === ".") {
    // class选择器
    let attr = elem.attributes.find((attr) => attr.name === "class");
    return attr && attr.value === selector.replace(".", "");
  }
  // tag选择器
  return elem.tagName === selector;
}
// css匹配优先级计算
function specificity(selector) {
  const p = [0, 0, 0, 0];
  const selecotrParts = selector.split(" ");
  selecotrParts.forEach((part) => {
    if (part.charAt(0) === "#") {
      p[1] += 1;
    } else if (part.charAt(0) === ".") {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  });
  return p;
}
// 优先级比较
function compare(sp1, sp2) {
  for (let i = 0; i < 4; i++) {
    if (sp1[i] - sp2[i]) return sp1[i] - sp2[i];
  }
  return sp1[3] - sp2[3];
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
  } else if (c === EOF) {
    // 报错
  } else {
    // 报错
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
    return afterAttributeName(c);
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
    currentAttribute[currentAttribute.name] = true;
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
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function UnquotedAttributeValue(c) {
  if (c === EOF) {
  } else if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
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
    emit(currentToken);
    return data;
  } else if (c === EOF) {
    // 报错
  } else {
    // 报错
  }
}

module.exports.parseHTML = function parseHTML(html) {
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF); // EOF 作为最后一个状态给到状态机，用于强制闭合所有html标签
  // console.log(stack);
  // console.log(rules);
  return stack;
};
