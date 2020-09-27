import { TimeLine, Animation } from "./animation.js";

const tl = new TimeLine();
// const animation = new Animation(document.querySelector('#el').style.transform, 0, 1000, 10000, 0, null, )
tl.start();

document.querySelector('#pause-btn').addEventListener('click', tl.pause);
document.querySelector('#resume-btn').addEventListener('click', tl.resume);

tl.add(
  new Animation(
    document.querySelector("#el").style,
    "transform",
    0,
    1000,
    10000,
    null,
    v => v,
    (v) => `translateX(${v}px)`
  )
);
