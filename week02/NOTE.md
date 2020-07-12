# 学习笔记
本周课程主要分为两部分，第一部分为JS语言通识，第二部分为JS语言类型与对象
# JS语言通识
## 深入理解产生式

### 通过产生式理解乔姆斯基谱系

- 0型 无限制文法
	- ?::=?
- 1型 上下文相关文法
	- ?<A>?::=?<B>?
- 2型 上下文无关文法
	- <A>::=?
- 3型 正则文法
	- <A>::=<A>?
	- <A>::=?<A> *wrong*

JavaScript 总体上是上下文无关文法，表达式部分大部分为正则文法，也有特例是上下文相关文法。
特例：
```javascript
{
	get a {return 1},
	get: 1
}// get 后加a是类似于关键字的结构，不写a直接加：是作为属性名的，表现为上下文相关文法，这是一种特殊情况

2**1**2 === 2 // true, 乘方运算是一个右结合的，并不是正则文法
```

### 其他产生式

- EBNF
- ABNF
- Customized

javascript给出的产生式书写方式：
缩进代表开头，冒号代表::=，加黑粗体表示终结符
```
AdditiveExpression:
	MultiplicativeExpression
	AdditiveExpression +
MultiplicativeExpression
	AdditiveExpression -
MultiplicativeExpression
```

## 现代语言的分类

### 现代语言的特例

- C++中，*可能表示乘号或者指针，具体是哪个，取决于星号前面的标识符是否被声明为类型；
- VB中，<可能是小于号，也可能是是XML直接量的开始，取决于当前位置是否可以接受XML直接量；
- Python中，行首的tab符和空格会根据上一行的行首空白以一定规则被处理成终结符indent或者dedent；
- JavaScript中，/可能是除号，也可能是正则表达式开头，处理方式类似于VB，字符串模板中也需要特殊处理}，还有自动插入分号规则；

### 语言的分类

- 形式语言——用途
  - 数据描述语言：JSON，HTML，XAML，SQL，CSS
  - 编程语言：C,C++, Java, C#, Python, Ruby, Perl, Lisp, T-SQL, Clojure, Haskell, JavaScript
- 形式语言——表达方式
  - 声明式语言：JSON,HTML,XAML,SQL,CSS,Lisp,Clojure,Haskell
  - 命令型语言：C, C++, Java, C#, Python, Ruby, Perl, JavaScript

### 练习
尽可能寻找你知道的计算机语言，并尝试把他们分类

## 编程语言的性质

### 图灵完备性

- 图灵完备性: 两种流派实现图灵完备性（现在语言一般两种都支持）
  - 命令式————图灵记
    - goto
    - if和while
  - 声明式————lambda（邱奇提出的lambda演算）
    - 递归

### 动态与静态

- 动态：
  - 在用户的设备/在线服务器上
  - 产品时间运行时
  - Rantime
- 静态：
  - 在程序员的设备上
  - 产品开发时
  - Compiletime

### 类型系统

- 动态类型系统与静态类型系统（同动态与静态）
- 强类型与弱类型
  - String+Number
  - String == Boolean（JavaScript的老设计问题了）
- 复合类型
  - 结构体
  ```
	{
		a: T1,
		b: T2
	}
	```
  - 函数签名`(T1,T2) => T3`
- 子类型 
- 泛型
  - 逆变/协变：
  ```
  协变：凡是能用Array<Parent>的地方，都能用Array<Child>
  逆变：凡是能用Function<Child>的地方，都能用Function<Parent>
  ```


	## 一般命令式编程语言的设计方式

	### 一般命令式语言

	- Atom
  	- Identifier
  	- Literal
	- Expression
  	- Atom
  	- Operator
  	- Punctuator
	- Statement
  	- Expression
  	- Keyword
  	- Punctuator
	- Structure
  	- Function
  	- Class
  	- Process
  	- Namespace
  	- ......
	- Program
  	- Program
  	- Module
  	- Package
  	- Library

### 重学JavaScript
	语言 =语义=> 运行时

# JS类型

## Number

### Atom

Grammer：
- Literal
- Variable
- Keywords
- Whitespace
- Line Terminator

Runtime
- Types
- Execution Context

### Types
- Number
- String
- Boolean
- Object
- Null：`typeof Null === 'Object' // true`
- Undefined
- Symbol: 注意与String的区别（专门用于Object属性名）
- Bigint

### Number

- IEEE 754 Double Float: 双精度浮点数，小数点来回浮动
  - Sign (1): 符号位
  - Exponent(11)：指数位
  - Fraction(52)：有效位数119911009
  - 有一个隐藏位在指数位与有效数位之间，值为1，作为有效数位的开头

## String

- Character字符 `a`
- Code Point码点 `97`
- Encoding编码方式	`01100001`

### 字符集
- ASCII只规定了127个字符（最常用的，52大小写字母+数字0-9+各种符号，没有中文）
- Unicode（全世界各种字符合集，最全，开始设计为0000~FFFF，后来发现两个字节居然不够用……）
- UCS（Unicode中0000~FFFF部分）
- GB：国标（与Unicode不兼容，同一个字符码点不一致）比Unicode编码省空间
  - GB2312：第一个版本，应用较广
  - GBK(GB13000)：扩充版本
  - GB18030：大全版本，补齐大部分缺失字符
- ISO-8859：一些东欧国家搞的标准，没有中文，不是一个统一的标准，但是都与ASCII兼容
- BIG5：台湾大五码

### Encoding
ASCII字符集最多只占一个字节，编码与码点一样，所以ASCII不存在编码问题

#### UTF

- UTF8：默认用一个字节表示一个字符
- UTF16：默认用两个字节表示一个字符
  
举例，'一'的编码：

	UTF8：11100100 10111000 10000000 （每个字节前几位需要有占位表示需要用几个字节表示这个字符，和后续的对应字节）
	UTF16：01001110 00000000

### Grammar

对于JS，单双引号没有区别，引号内的回车等字符需要特殊处理

反引号比较厉害，内部可以使用回车和tab之类的字符

随堂练习：A regular Expression to match string Literal.
Answer: 
"(?:[^"\n\\\r\u2028\u2029"]|\\(?:['"\\bfntv\n\r\u2028\u2029]|\r\n)|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}\\[^0-9ux'"\\bfntv\n\\\r\u2028\u2029])*"

'(?:[^'\n\\\r\u2028\u2029"]|\\(?:['"\\bfntv\n\r\u2028\u2029]|\r\n)|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}\\[^0-9ux'"\\bfntv\n\\\r\u2028\u2029])*'

- \n: 换行
- \r: 回到行首
- \u2028：分段
- \u2029：分页
- \x: 转义
- \u: 转义

#### 反引号

其实是JS的一个语法结构，并非词法结构；
在JS引擎角度来看，被${}括起来的其实是JS语法，括号外面的是字符串

`ab${x}abs${y}abc`

- `ab${
- }abc${
- }abc`

## 其他类型
### Boolean

- true
- false
- 都是关键字

### Null&Undefined

- null
- undefined
- void 0;(最简单也是最可靠的获得undefined值的方法)


## Object对象

### 对象三要素

- 状态 state
- 行为 behavior
- 唯一标识 identifier

### Object - Class

'归类'和'分类'

- 对于归类方法而言，多继承是非常自然的事情
- 分类则更多是单继承结构，并且会有一个基类Object