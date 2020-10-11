import { enableGesture } from "./gesture";

export default function createElement(type, attributes, ...children) {
  let element;
  if (typeof type === "string") {
    element = new ElementWrapper(type);
  } else {
    element = new type({timer: {}});
  }
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  let visit = children => {
    for(let child of children) {
      if (typeof child === 'object' && child instanceof Array) {
        visit(child);
        continue;
      }
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    }
  }

  visit(children);
  return element;
}

export class Component {
  constructor() {}
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class ElementWrapper {
  constructor(type) {
    // super();
    this.children = [];
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
    // console.log(name);
    if (name.match(/^on([\s\S]+)$/)) {
      let eventName = RegExp.$1.replace(/^[\s\S]/, c =>c.toLowerCase());
      // console.log(eventName);
      this.root.addEventListener(eventName, value);
    }

    if (name === 'enableGesture') {
      enableGesture(this.root);
    }
  }
  addEventListener() {
    this.root.addEventListener(...arguments);
  }
  getAttribute(name) {
    return this.root.getAttribute(name);
  }
  appendChild(child) {
    this.children.push(child);
  }
  get style() {
    return this.root.style;
  }
  get classList() {
    return this.root.classList;
  }

  set InnerText(text) {
    return this.root.innerText = text;
  }
  mountTo(parent) {
    parent.appendChild(this.root);

    for (let child of this.children) {
      child.mountTo(this.root);
    }
  }
}

class TextWrapper {
  constructor(content) {
    this.children = [];
    this.root = document.createTextNode(content);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
  getAttribute(name) {
    return;
  }
}
