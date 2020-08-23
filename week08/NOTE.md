# 学习笔记

# DOM API

## 导航类操作

- Node导航:
    - parentNode
    - childNodes
    - firsChild
    - lastChild
    - nextSibling
    - previousSibling

- Element导航：
    - parentElementt: 与parentNode结果相同（有子节点的Node一定是Element）
    - children
    - firstElementChild
    - lastElementChild
    - nextElementSibling
    - previousElementSibling

## 修改操作

- appendChild
- insertBefore
- removeChild
- replaceChild

## 高级操作

- compareDocumentPosition: 用于比较两个节点在DOM中的位置关系的函数
- contains：检查一个节点是否包含另一个节点
- isEqualNode: 检查两个节点是否完全相同
- isSameNode: 检查两个节点是否是同一个节点，实际上在JS中可以用‘===’
- cloneNode: 复制一个节点，如果传入参数true，则会连同子元素作深拷贝

# Event API

## 事件对象模型

target.addEventListener(type, listener [, options]);

options: 
- capture: true捕获模式/false冒泡模式
- once: 是否只相应一次
- passive：是否会产生副作用，默认为false，即可以调用preventDefault()，一些浏览器为了提高性能会把触摸事件和滚动事件的passive设置成true
- mozSystemtGroup: 只能在XBL、FireFox、Chrome中使用，表示listener被添加到System group

# Range API

## 创建range
- let range = new Range();
- reange.setStart(element, 9);
- range.setEnd(element, 4);
- let range = document.getSelection().getRangeAt(0)

- range.setStartBefore
- range.setEndBefore
- range.setStartAfter
- range.setEndAfter
- range.selectNode
- range.selectNodeContents

- let fragment = range.extractContents();取出range选中的dom，返回fragment对象
- range.insertNode(document.createTextNode("aaa"));插入节点