import createElement, { Component } from "./framework";

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

const d = [
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901792&di=213dfef5e822ccf4fa2f1fdb740a6abd&imgtype=0&src=http%3A%2F%2Fe0.ifengimg.com%2F12%2F2019%2F0223%2F5B060438306C61FD75991235A03FA4EA4D544DC2_size471_w1440_h2560.jpeg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901792&di=78d7417b396623162addcc73590cec53&imgtype=0&src=http%3A%2F%2Fimg1.qunliao.info%2Ffastdfs4%2FM00%2FD0%2F53%2FChMf8F1JdymAUXzXAAev7_gau2I931.jpg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901791&di=0c8ce183bb53c86601c56cbe20d83a24&imgtype=0&src=http%3A%2F%2Fpic.rmb.bdstatic.com%2Fa74c95a330e97b5b9b3995be69601844.jpeg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901791&di=0deb6417c56eda336de71a007eea35e0&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20171031%2F9eefc2fa661246d1b326ceeca1b6dbbb.jpeg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901791&di=bf6e0778496ac0afa397de695c1840fe&imgtype=0&src=http%3A%2F%2Fimg.mp.itc.cn%2Fupload%2F20170418%2F679f950743c1480e83711fe2fbcb5581_th.jpg",
];

let a = <Carousel src={d} />;

a.mountTo(document.body);
