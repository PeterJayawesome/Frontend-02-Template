# Week03 学习笔记

## 运算符与表达式

### Grammer

语法树与运算符优先级的关系：运算符的优先级会影响到语法树的构建，例如四则运算中乘除优先级高于加减，而括号优先级更高，所以在构造四则运算的语法树时没有括号的情况下加减运算会构成更高一级的语法结构，而乘法运算则更偏底部优先运算。即：运算优先级越高，在语法树中更靠底部，构成更末一级的语法结构。

### Expression

语法结构能够表达的要多于运算符优先级所能表达的，所以有的时候用优先级来解释运算符其实并不是严谨的说法，真正严谨的还是产生式来描述运算的优先顺序

优先级由高到低：
- Member
  - a.b
  - a[b]
  - foo`string`
  - super.b：super关键字，在class中用到
  - super['b']
  - new.target
  - new Foo(): 带括号的new运算优先级更高，和member运算同级
- New
  - new Foo
- Reference：引用类型（标准中的类型，而不是语言类型）
  - Object
  - Key
  - delete
  - assign：赋值（+=、-=、*=、/=）
- Call
  - foo()
  - super()
  - foo()['b']
  - foo().b
  - foo()`abc`
Example：`new a()['b']` 先执行`new a()` 对象，之后访问其`b`属性

- Left Handside & Right Handside 左表达式与右表达式（能否放在等号左边作为赋值的对象）
- Update
  - a++
  - a--
  - -- a
  - ++ a
Example: `++ a ++` === `++ (a ++)` 然而这个语句是不合法的，因为`a ++`不是左手表达式，不能作为前++的作用对象

- Unary
  - `delete a.b`
  - `void foo()`
  - `typeof a`
  - `+ a`: 正号，并不会改变a的值，更多是类型转换
  - `- a`
  - `~ a`： 整数，强制取整
  - `!a`：取反
  - `await a`：会对更大的语法结构产生影响
- Exponental：指数，幂次运算
  - **：`2**3**2` === `2**(3**2)`
- Multiplicative
  - `*/%`
- Additive
  - `+-`
- Shift
  - `<< >> >>>`
- Relationship: 关系比较表达式
  - `< > <= >= instanceof in`
- Equality
  - `==`：老问题了，会对两边进行类型转换
  - `!=`
  - `===`
  - `!==`
- Bitwise: 位运算
  - `& ^ |`：按位与，异或，按位或
- Logical: 注意短路原则
  - `&&`
  - `||`
- Conditional: 也有短路原则
  - `a?b:c`


## 类型转换

| Type      | Number         | String           | Boolean  | Undefined | Null | Object | Symbol |
| --------- | -------------- | ---------------- | -------- | --------- | ---- | ------ | ------ |
| Number    | -              | later            | 0 false  | ×         | ×    | boxing | ×      |
| String    | later          | -                | "" false | ×         | ×    | boxing | ×      |
| Boolean   | true:1,false:0 | 'true''false'    | -        | ×         | ×    | boxing | ×      |
| Undefined | NaN            | 'Undefined'      | false    | -         | ×    | ×      | ×      |
| Null      | 0              | 'null'           | false    | ×         | -    | ×      | ×      |
| Object    | valueOf        | valueOf toString | true     | ×         | ×    | -      | ×      |
| Symbol    | ×              | ×                | ×        | ×         | ×    | boxing | -      |

### Unboxing

- ToPrimitive
- ToString vs valueOf
- Symbol.toPrimitive

如果定义了Symbol.toPrimitive会忽略toSting和valueOf
```js
var o={
    toString(){return '2'},
}
var p = {
    toString(){return '2'},
    valueOf(){return 1},
    [Symbol.toPrimitive](){return '3'}
}
var x = {}
x[o] = 1;
x[p] = 3
console.log('x' + o, 2 + o, 'x'+ p, 2 + p); // 'x2' '22' 'x3' '23'
o[`valueOf`] = () => 1;
x[o] = 2;
console.log(x, 'x' + o, 2 + o); // {2: 2, 3: 3} "x1" 3
```

### Boxing

| 类型    | 对象                      | 值          |
| ------- | ------------------------- | ----------- |
| Number  | `new Number(1)`           | 1           |
| String  | `new String('a)`          | 'a'         |
| Boolean | `New Boolean(true)`       | true        |
| Symbol  | `new Object(Symbol("a"))` | Symbol("a") |


## 运行时相关概念

### Completion Record

描述语句执行结果的数据结构(是否返回了？返回值是啥等等...)

Completion Record 组成：
- `[[type]]`:normal, break, continue, return or throw
- `[[value]]`: 基本类型
- `[[target]]`: label(语句前加标识符和冒号就会变成一个带label的语句，如：`loop1: for(let i of array){`)

## 简单语句与复合语句

### 简单语句

里面不会再容纳其他语句的语句

- ExpressionStatement
- EmptyStatement
- DebuggerStatement: 调试用，代码中插入`debugger`，
- ThrowStatement：抛出异常
- ContinueStatement：结束当次循环
- BreakStatement：结束整个循环
- ReturnStatement：一定在函数中使用

>ExpressionStatement用于是计算机完成指定计算，其余语句基本是用于做流程控制

### 复合语句

- BlockStatement
- IfStatement
- SwitchStatement: 多分支结构，在JS中与`if else`没有性能区别，又容易写错，不建议使用
- IterationStatement
- WithStatement： 广受诟病了，会引发作用域问题
- LabelledStatement： 语句前加`label：`
- TryStatement：`try{...}catch(err){...}finally{...}`中的`{...}`并非BlockStatement，是由Try语句定义的，不能省略

#### BlockStatement

- `[[type]]`: normal
- `[[value]]`: --
- `[[target]]`: --

#### Iteration

- `While(...) ...`
- `do ... while(...);`:与`while`的区别是`do while`会至少执行一次
- `for(;;) ...`
- `for(... in ...) ...`：用掉了`in`，循环内不允许`in`出现
- `for(... of ...) ...`
- `for await (... of ...) ...`：异步循环

#### Label、Loop、Break、Continue

- `[[type]]`: break/continue
- `[[value]]`: --
- `[[target]]`: label

#### Try

- `[[type]]`: return
- `[[value]]`: --
- `[[target]]`: label

*在try语句中return并不会打断try结构的执行*

## 声明

- FunctionDeclaration
- GeneratorDeclaration
- AsyncFunctionDeclaration
- AsyncGeneratorDeclaration
- VariableDeclaration
- ClassDeclaration
- LexicalDeclaration: `let`与`const`

### 预处理机制(pre-process)

```javascript
var a = 2;
void function (){
    a = 1;
    return;
    var a;
}();

console.log(a); // 2
```
const 声明也会提升到所在blockStatement的头部
```js
var a = 2;
void function() {
    a = 1;
    return;
    const a; // Uncaught SyntaxError: Missing initializer in const declaration
}();
console.log(a)
```

### 作用域

```js
var a = 2;
void function(){
    a = 1;
    {
        var a;
    }
}();
console.log(a) // 2
```
```js
var a = 2;
void function () {
    a = 1;
    {
        let a;
    }
}();
console.log(a); // 1
```


## JS 结构化

### JS执行粒度(运行时)

- 宏任务
- 微任务(Promise)
- 函数调用(Execution Context)
- 语句、声明(Completion Record)
- 表达式(Reference)
- 直接量、变量、this...

### 宏任务与微任务

```js
class testClass {
    constructor() {this.a = 1;}
    testRun() {
        this.a = 2;
        let p = new Promise(resolve => resolve());
        p.then(() => this.a = 3);
        this.a = 4;
    }
    geta() {
        return this.a;
    }
}

const t = new testClass();
t.testRun();
console.log(t.geta()); // 4
// 下一个指令中调用
t.geta(); // 3
```

### 事件循环

等待锁 => 获取代码 => 执行 => 等待锁 => ...

### 函数调用

Stack 描述调用的结构

函数中的信息包括函数代码和执行上下文环境

执行上下文:
- Code evaluation state
- Funtion
- Script or Module
- Generator(属于Generator Execution Context, 不属于ECMAScript Code Execution Context)
- Realm
- LexicalEnvironment:this/new.target/super/变量
- VariableEnvironment: var声明, 用于处理`evel()`中的var声明，为了解决历史包袱保留的

闭包：带有执行上下文信息的函数，在JS中每一个函数都会形成一个闭包

### Realm

在JS中，函数表达式和对象直接量均会创建对象
使用，做隐式转换是也会创建对象
这些对象都是有原型的，如果没有Realm，就不知道他们的原型是什么
