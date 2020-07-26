# 学习笔记

## 浏览器总论

## 状态机(FSA)

### Find 'a' in a string

```js
function findA(str) {
    for (let letter of str) {
        if (letter === 'a') return true;
    }
    return false
}

console.log(findA('test')) // false
console.log(findA('react')) // true
```

### Find 'ab' in a string

```js
function match(str) {
    let findA = false;
    for (let letter of str) {
        if (letter === a)
            findA = true;
        else if (findA && letter === 'b')
            return true;
        else 
            findA === false;
    }
    return false;
}
```

### Find 'abcdef' in a string

```js
function match(str) {
    let [findA, findB, findC, findD, findE] = [false, false, false, false, false];
    for (let l of str) {
        if (l === 'a') {
            findA = true;
        } else if (findA && l === 'b')
            findB = true;
        else if (findB && l === 'c')
            findC = true;
        else if (findC && l === 'd')
            findD = true;
        else if (findD && l === 'e')
            findE = true;
        else if (findE && l === 'f')
            return true;
        else
            [findA, findB, findC, findD, findE] = [false, false, false, false, false];
    }
    return false;
}
console.log(match('abeabcdef')) // true
console.log(match('asdfasdg')) // false
```

#### Solve the problem with FSA(finite-state automaton)
```js
function match(str) {
    let state = start;
    for (let l of str) {
        state = state(l)
    }
    return state === end;
}

let start = l => l === 'a' ? foundA : start;
let foundA = l => l === 'b' ? foundB : start(l);
let foundB = l => l === 'c' ? foundC : start(l);
let foundC = l => l === 'd' ? foundD : start(l);
let foundD = l => l === 'e' ? foundE : start(l);
let foundE = l => l === 'f' ? end : start(l);
let end = l => end;

console.log(match('abeabcdef')) // true
console.log(match('asdfasdg')) // false
console.log(match('avababcdef')) // true
```
### Find 'abcabx' in a string with FSA

```js
function match(str) {
    let state = start;
    for (let l of str) {
        state = state(l);
    }
    return state === end;
}

let start = l => l === 'a' ? foundA : start;
let foundA = l => l === 'b' ? foundB : start(l);
let foundB = l => l === 'c' ? foundC : start(l);
let foundC = l => l === 'a' ? foundA2 : start(l);
let foundA2 = l => l === 'b' ? foundB2 : start(l);
let foundB2 = l => {
    if (l === 'x')
        return end;
    else
        return foundB(l)
}
let end = l => end;

console.log(match('abcabcabx')); // true
console.log(match('abcabcabc')); // false
console.log(match('abcabaabx')); // false
```

#### Find 'abababx' in a string

```js
function match(str) {
    let state = start;
    for (let l of str) {
        state = state(l);
    }
    return state === end;
}

let start = l => l === 'a' ? foundA : start;
let foundA = l => l === 'b' ? foundB : start(l);
let foundB = l => l === 'a' ? foundA2 : start(l);
let foundA2 = l => l === 'b' ? foundB2 : start(l);
let foundB2 = l => l === 'a' ? foundA3 : foundB(l);
let foundA3 = l => l === 'b' ? foundB3 : start(l);
let foundB3 = l => l === 'x' ? end : foundB2(l);
let end = l => end;

console.log(match('abababababababx')); // true
console.log(match('ababaxaa')); // false
```

#### Generate FSA for given pattern

[KMP Algorithm](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm)
[KMP 字符匹配算法](https://baike.baidu.com/item/kmp%E7%AE%97%E6%B3%95/10951804?fr=aladdin)

```js
function FSAFactory(pattern) {
    let res = [
        l => l === pattern[0] ? res[1] : res[0],
    ];
    let j = 0;
    for (let i = 1; i < pattern.length; i ++) {
        let k = j;
        res[i] = l => {
            return l === pattern[i] ? res[i + 1] : res[k](l)
        };
        if (pattern[i] === pattern[j])
            j ++;
        else
            j = 0;
    }
    res[pattern.length] = l => res[pattern.length];
    return res;
}

function match(str, pattern) {
    let FSAarr = FSAFactory(pattern);
    let state = FSAarr[0];
    for (let l of str) {
        state = state(l);
    }
    return state === FSAarr[pattern.length];
}

console.log(match('abcabababx', 'ababx')); // true
console.log(match('abcabababx', 'ababa')); // true
console.log(match('abcabababx', 'ababc')); // false
```

## HTTP请求

### HTTP协议解析

ISO-OSI 七层网络模型

应用、表示、会话、传输、网络、数据链路、物理层
HTTP、TCP、Internet、4G/5G/WiFi

#### TCP与IP的一些基础知识

- 流
- 端口
- require('net')

- 包
- IP地址
- libnet/libpcap

#### HTTP

- Request
- Response


