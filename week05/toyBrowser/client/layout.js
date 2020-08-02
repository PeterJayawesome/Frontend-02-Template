function layout(element) {
  if (!element.computedStyle) return;

  let elementStyle = getStyle(element);

  if (elementStyle.display !== "flex") return;

  let items = element.children.filter((e) => e.type === "element");

  items.sort((a, b) => (a.order || 0) - (b.order || 0));

  let style = elementStyle;

  ["width", "height"].forEach((size) => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });

  const defaultProps = {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
    flexWrap: "nowrap",
    alignContent: "stretch",
  };

  for (let prop in defaultProps) {
    if (!style[prop] || style[prop] === "auto") {
      style[prop] = defaultProps[prop];
    }
  }

	// init params
  let mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase;

  if (style.flexDirection === "row") {
    mainSize = "width";
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1;
    mainBase = 0;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
	}
  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1;
    mainBase = style.width;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }
  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1;
    mainBase = 0;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }
  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1;
    mainBase = style.height;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexWrap === "wrap-reverse") {
    [crossStart, crossEnd] = [crossEnd, crossStart];
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  let isAutoMainSize = false;
  if (!style[mainSize]) {
    elementStyle[mainSize] = 0;
    items.forEach((item) => {
      let itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0))
        elementStyle[mainSize] += itemStyle[mainSize];
    });
    isAutoMainsize = true;
  }
  // 元素进入line
  let flexLines = [];

  let flexLine, mainSpace, crossSpace;

  const initLine = (item) => {
    flexLine = item ? [item] : [];
    flexLines.push(flexLine);
    mainSpace = style[mainSize];
    crossSpace = 0;
  };
  const getCrossSpace = (space) =>
    space !== null && space !== (void 0)
      ? Math.max(crossSpace, space)
      : crossSpace;

  initLine();

  items.forEach((item) => {
    let itemStyle = getStyle(item);
    if (itemStyle[mainSize] === null) itemStyle[mainSize] = 0;

    if (itemStyle.flex) {
      // 可伸缩的子元素一定能放入这一行
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      // 强制不换行的情况
      mainSpace -= itemStyle[mainSize];
      crossSpace = getCrossSpace(itemStyle[crossSize]);
      flexLine.push(item);
    } else {
      if (itemStyle[mainSize] > style[mainSize])
        itemStyle[mainSize] = style[mainSize];
      if (mainSpace < itemStyle[mainSize]) {
        // 换行
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        initLine(item);
      } else {
        flexLine.push(item);
      }
      crossSpace = getCrossSpace(itemStyle[crossSize]);
      mainSpace -= itemStyle[mainSize];
    }
  });

  flexLine.mainSpace = mainSpace;
  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== (void 0) ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // 单行处理
    let scale = style[mainSize] / (style(mainSize) - mainSpace);
    let currentMain = mainBase;

    items.forEach((item) => {
      const itemStyle = getStyle(item);
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }
      // 缩放
      itemStyle[mainSize] *= scale;

      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] =
        itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    });
  } else {
    flexLines.forEach((items) => {
      let mainSpace = items.mainSpace;
      let flexTotal = 0;
      items.forEach((item) => {
        const itemStyle = getStyle(item);
        if (itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
          flexTotal += itemStyle.flex;
        }
      });

      if (flexTotal > 0) {
        let currentMain = mainBase;

        items.forEach((item) => {
          const itemStyle = getStyle(item);
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = currentMain + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        });
      } else {
        // There is NO flexible flex items, which means, justifyContent should work
        let currentMain, step;
        switch (style.justifyContent) {
          case "flex-start":
            currentMain = mainBase;
            step = 0;
            break;
          case "flex-end":
            currentMain = mainSpace * mainSign + mainBase;
            step = 0;
            break;
          case "center":
            currentMain = (mainSpace / 2) * mainSign + mainBase;
            step = 0;
            break;
          case "space-between":
            currentMain = mainBase;
            step = (mainSpace / (items.length - 1)) * mainSign;
            break;
          case "space-around":
            step = (mainSpace / items.length) * mainSign;
            currentMain = mainBase + step / 2;
            break;
          default:
            break;
        }
        items.forEach((item) => {
          const itemStyle = getStyle(item);
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = currentMain + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        });
      }
    });
  }

  // compute the cross axis sizes
  // align-items, align-self
  const computeCrossSpace = () => {
    let crossSpace;

    if (!style[crossSize]) {
      // auto sizing
      crossSpace = 0;
      elementStyle[crossSize] = 0;
      flexLines.forEach((line) => {
        elementStyle[crossSize] += line.crossSpace;
      });
    } else {
      crossSpace = style[crossSize];
      flexLines.forEach((line) => {
        crossSpace -= line.crossSpace;
      });
    }

    crossBase = style.flexWrap === "wrap-reverse" ? style[crossSize] : 0;

    let lineSize = style[crossSize] / flexLines.length;

    let step;

    switch (style.alignContent) {
      case "flex-start":
        crossBase += 0;
        step = 0;
        break;
      case "flex-end":
        crossBase += crossSign * crossSpace;
        step = 0;
        break;
      case "center":
        crossBase += (crossSign * crossSpace) / 2;
        step = 0;
        break;
      case "space-between":
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
        break;
      case "space-around":
        step = crossSpace / flexLines.length;
        crossBase += (crossSign * step) / 2;
        break;
      case "stretch":
        crossBase += 0;
        step = 0;
        break;

      default:
        break;
    }

    flexLines.forEach((line) => {
      let lineCrossSize =
        style.alignContent === "stretch"
          ? line.crossSpace + crossSpace / flexLines.length
          : line.crossSpace;
      line.forEach((item) => {
        const itemStyle = getStyle(item);
        const align = itemStyle.alignSelf || style.alignItems;

        if (itemStyle[crossSize] === null || itemStyle[crossSize] === (void 0))
          itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;

        switch (align) {
          case "flex-start":
            itemStyle[crossStart] = crossBase;
            itemStyle[crossEnd] = crossBase + crossSign * itemStyle[crossSize];
            break;
          case "flex-end":
            itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
            itemStyle[crossStart] =
              itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
            break;

          case "center":
            itemStyle[crossStart] =
              crossBase +
              (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
            itemStyle[crossEnd] =
              itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            break;
          case "stretch":
            itemStyle[crossStart] = crossBase;
            itemStyle[crossEnd] = crossBase + crossSign * itemStyle[crossSize];
            break;
          default:
            break;
        }
      });

      crossBase += crossSign * (lineCrossSize + step);
    });
  };

  computeCrossSpace();
}

function getStyle(element) {
  if (!element.style) element.style = {};

  for (let prop in element.computedStyle) {
    let p = element.computedStyle[prop].value;
    element.style[prop] = p;

    if (p.toString().match(/px$/) || p.toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(p);
    }
  }

  return element.style;
}

module.exports = layout;
