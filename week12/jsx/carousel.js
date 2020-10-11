import createElement from "./framework";
import { TimeLine, Animation } from "./animation";
import { ease } from "./timingFunctions.js";

class Carousel {
  constructor() {
    this.width = this.width || 800;
    this.attributes = new Map();
    this.children = [];
    this.properties = new Map();
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  appendChild(child) {
    this.children.push(child);
  }
  render() {
    let timeLine = new TimeLine();
    timeLine.start();

    let position = 0;
    let nextPicStopHandler = null;

    let children = this.data.map((url, currentPosition) => {
      let lastPosition =
        (currentPosition - 1 + this.data.length) % this.data.length;
      let nextPosition = (currentPosition + 1) % this.data.length;

      let offset = 0;

      let onStart = () => {
        // console.log("start");
        timeLine.pause();
        clearTimeout(nextPicStopHandler);

        let currentElement = children[currentPosition];

        let currentTransformValue = Number(
          currentElement.style.transform.match(/translateX\(([\s\S]+)px\)/)[1]
        );

        offset = currentTransformValue + 800 * currentPosition;
      };
      const onPan = (e) => {
        // console.log("pan");
        let lastElement = children[lastPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];

        let { clientX, startX } = e;
        let dx = clientX - startX;

        let lastTrasformValue = this.width * (-1 - lastPosition) + offset + dx;
        let currentTrasformValue =
          this.width * (-1 * currentPosition) + offset + dx;
        let nextTrasformValue = this.width * (1 - nextPosition) + offset + dx;
        // console.log("carousel pan", clientX - startX);
        lastElement.style.transform = `translateX(${lastTrasformValue}px)`;
        currentElement.style.transform = `translateX(${currentTrasformValue}px)`;
        nextElement.style.transform = `translateX(${nextTrasformValue}px)`;
      };
      const onPanend = (e) => {
        // console.log("panend");
        let direction = 0;
        let dx = e.clientX - e.startX;

        console.log("flick", e.isFlick);

        if (dx + offset > 0.5 * this.width || (dx > 0 && e.isFlick)) {
          direction = 1;
        } else if (dx + offset < -0.5 * this.width || (dx < 0 && e.isFlick)) {
          direction = -1;
        }

        timeLine.reset();
        timeLine.start();

        let lastElement = children[lastPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];

        let lastAnimation = new Animation(
          lastElement.style,
          "transform",
          this.width * (-1 - lastPosition) + offset + dx,
          this.width * (-1 - lastPosition + direction),
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        );
        let currentAnimation = new Animation(
          currentElement.style,
          "transform",
          this.width * -1 * currentPosition + offset + dx,
          this.width * (-1 * currentPosition + direction),
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        );
        let nextAnimation = new Animation(
          nextElement.style,
          "transform",
          this.width * (1 - nextPosition) + offset + dx,
          this.width * (1 - nextPosition + direction),
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        );
        timeLine.add(currentAnimation);
        timeLine.add(lastAnimation);
        timeLine.add(nextAnimation);

        position = (position - direction + this.data.length) % this.data.length;

        nextPicStopHandler = setTimeout(nextPic, 3000);
      };
      let element = (
        <img
          src={url}
          onStart={onStart}
          onPan={onPan}
          onPanEnd={onPanend}
          enableGesture={true}
        />
      );
      element.style.transform = "translateX(0px)";
      element.addEventListener("dragStart", (e) => e.preventDefault());
      return element;
    });

    let nextPic = () => {
      let nextPosition = (position + 1) % children.length;

      let current = children[position];
      let next = children[nextPosition];
      // console.log(nextPosition);

      next.style.transition = "none";
      next.style.transform = `translateX(${100 - 100 * nextPosition}%)`;

      let currentAmination = new Animation(
        current.style,
        "transform",
        -1 * position,
        -1 - position,
        500,
        0,
        ease,
        (v) => `translateX(${this.width * v}px)`
      );
      let nextAmination = new Animation(
        next.style,
        "transform",
        100 - 100 * nextPosition,
        -100 * nextPosition,
        500,
        0,
        ease,
        (v) => `translateX(${8 * v}px)`
      );

      timeLine.add(currentAmination);
      timeLine.add(nextAmination);
      position = nextPosition;

      nextPicStopHandler = setTimeout(nextPic, 3000);
    };
    nextPicStopHandler = setTimeout(nextPic, 3000);

    return <div class="carousel">{children}</div>;
  }
  mountTo(parent) {
    this.render().mountTo(parent);
  }
}

export default Carousel;
