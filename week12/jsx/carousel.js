import { Component } from "./framework";

class Carousel extends Component {
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    console.log(this.attributes.src);
    for (let record of this.attributes.src) {
      let child = document.createElement("div");
      child.style.backgroundImage = `url(${record})`;

      child.src = record;
      this.root.appendChild(child);
    }

    let position = 0;
    this.root.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const startX = event.clientX;
      const children = this.root.children;
      console.log("mousedown");
      let move = (e) => {
        let x = e.clientX - startX;

        let current = position + (x - (x % 800)) / 800;
        for (let offset of [-2, -1, 0, 1, 2]) {
          let pos = (current + offset + children.length) % children.length;
          let child = children[pos];
          x = x % 800;
          child.style.transition = "none";
          child.style.transform = `translateX(${
            -pos * 800 + offset * 800 + x
          }px)`;
        }
      };
      let up = (e) => {
        console.log("mouseup");
        let x = e.clientX - startX;
        let current = position - Math.round(x / 800);
        for (let offset of [
          0,
          -Math.sign(Math.round(x / 800) - x + 400 * Math.sign(x)),
        ]) {
          let pos = (current + offset + children.length) % children.length;
          console.log("Carousel -> up -> offset", offset);
          let child = children[pos];
          x = x % 800;
          child.style.transition = "";
          child.style.transform = `translateX(${-pos * 800 + offset * 800}px)`;
        }
        position = (current + children.length) % children.length;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mouseup", up);
      document.addEventListener("mousemove", move);
    });
    // let currentIndex = 0;
    // setInterval(() => {
    //   let children = this.root.children;
    // 	let nextIndex = (currentIndex + 1) % children.length;

    //   let current = children[currentIndex];
    // 	let next = children[nextIndex];
    // 	console.log(nextIndex)

    //   next.style.transition = "none";
    //   next.style.transform = `translateX(${100 - nextIndex * 100}%)`;
    //   setTimeout(() => {
    //     next.style.transition = "";
    //     current.style.transform = `translateX(-${100 + currentIndex * 100}%)`;
    //     next.style.transform = `translateX(-${nextIndex * 100}%)`;
    //     currentIndex = nextIndex;
    //   }, 16);
    // }, 3000);
    return this.root;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
}

export default Carousel;
