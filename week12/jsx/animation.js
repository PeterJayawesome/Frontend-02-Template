const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("start-time");
const PAUSE_START = Symbol("pause-start");
const PAUSE_TIME = Symbol("pause-time");

export class TimeLine {
  constructor() {
    this.state = "inited";
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[PAUSE_TIME] = 0;
  }

  start() {
    if (this.state !== "inited") return;
    this.state = "started";
    let startTime = Date.now();
    this[TICK] = () => {
      let now = Date.now();
      for (let animation of this[ANIMATIONS]) {
        let t;
        // 如果调用start之前添加的动画，以startTime作为开始
        if (this[START_TIME].get(animation) < startTime) {
          t = now - startTime;
        } else {
          // 如果在start调用之后再添加动画，动画添加时刻作为开始
          t = now - this[START_TIME].get(animation);
        }
        // 减去暂停时长
        t -= this[PAUSE_TIME];
        // 距离开始时间超过动画时长则移除动画
        if (animation.duration < t) {
          this[ANIMATIONS].delete(animation);
        }
        animation.receiveTime(Math.min(animation.duration, t));
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    };
    this[TICK]();
  }

  // set rate() {}
  // get rate() {}

  pause = () => {
    if (this.state !== "started") return;
    this.state = "paused";
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  };
  resume = () => {
    if (this.state !== "paused") return;
    this.state = "started";
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  };

  add(animation, startTime) {
    startTime = startTime || Date.now();
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, startTime);
  }

  reset = () => {
		this.pause();
		this.state = 'inited';
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[PAUSE_START] = 0;
    this[TICK_HANDLER] = null;
  };
}

export class Animation {
  constructor(
    object,
    property,
    startValue,
    endValue,
    duration,
    delay = 0,
    timingFunction = (v) => v,
    template = (v) => v
  ) {
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction;
    this.delay = delay;
    this.template = template;
  }

  receiveTime(time) {
    const {
      object,
      property,
      startValue,
      endValue,
      duration,
      timingFunction,
    } = this;
    let range = endValue - startValue;
    let progress = timingFunction(time / duration);
    let value = startValue + range * progress;
    if (typeof this.template === "function") {
      value = this.template(value);
      // console.log(time/ duration, progress);
    }
    object[property] = value;
  }
}
