# 学习笔记

## CSS 排版

主要讲了盒模型的行级排布和块级排布还有flex排版

### 行级排布(IFC)

由上到下：line-top, text-top, base-line, text-bottom, line-bottom
中英文的文字都是要按照基线对齐的，

### 块级排布(BFC)

- float：先根据dom正常进行排版，之后再根据float方向向左或者向右移到父元素边缘，float元素之间也是正常流排布，想要换行需要使用clear，br元素对float布局无法换行
- margin折叠
- BFC合并条件：block box && overflow: visible
    - Block Container: 内有BFC的，能容纳正常流的盒，里面就有BFC，display：block/inline-block/table-cell/flex item/grid cell/table-caption
    - Block-level Box: 外面有BFC的， display: block level/inline level相互对应
    - Block Box = Block Container + Block-level Box: 内外都有BFC的

### Flex排版

- 收集盒进行
- 计算盒在主轴方向的排布
- 计算盒在交叉轴方向的排布

## CSS动画与绘制

### 动画

主要使用@keyframes定义，animation调用
- animation-name
- animation-duration
- animation-timign-function
- animation-delay
- animation-iteration-count
- animation-direction

使用transition作过渡动画

- transition-property
- transition-duration
- transition-timing-function
- transition-delay

cubic-bezier曲线：三次贝塞尔曲线用途比较广，可以绘制抛物线

### 颜色

- RGB、RGBA vs CMYK：原色与补色的差别
- HSL、HSV更适用于保持色彩明亮度与饱和度的情况下改变色相。差别：L为满值时为白色，V为满值时为纯色，因为HSL表达更对称，所以W3C选用了HSL

### 绘制

- 几何图形
    - border
    - box-shadow
    - border-radius
- 文字
    - font
    - text-decoration
- 位图
    - background-image

绘制图形小技巧：
- data uri+svg
- data:image/svg+xml,<svg width='100%' height='100%' version="1.1" xmlns="http://www.w3.org/2000/svg"><ellipse cx="300" cy="150" rx='200' ry='80' style='fill:rgb(200,100,50);stroke:rgb(0,0,100);stroke-width:2'/></svg>

课件不全啊，颜色和绘制的部分没有