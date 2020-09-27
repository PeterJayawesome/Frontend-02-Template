import createElement from "./framework";
import Carousel from "./carousel";
import { TimeLine, Animation } from "./animation";

const d = [
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901792&di=213dfef5e822ccf4fa2f1fdb740a6abd&imgtype=0&src=http%3A%2F%2Fe0.ifengimg.com%2F12%2F2019%2F0223%2F5B060438306C61FD75991235A03FA4EA4D544DC2_size471_w1440_h2560.jpeg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901792&di=78d7417b396623162addcc73590cec53&imgtype=0&src=http%3A%2F%2Fimg1.qunliao.info%2Ffastdfs4%2FM00%2FD0%2F53%2FChMf8F1JdymAUXzXAAev7_gau2I931.jpg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901791&di=0c8ce183bb53c86601c56cbe20d83a24&imgtype=0&src=http%3A%2F%2Fpic.rmb.bdstatic.com%2Fa74c95a330e97b5b9b3995be69601844.jpeg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901791&di=0deb6417c56eda336de71a007eea35e0&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20171031%2F9eefc2fa661246d1b326ceeca1b6dbbb.jpeg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600625901791&di=bf6e0778496ac0afa397de695c1840fe&imgtype=0&src=http%3A%2F%2Fimg.mp.itc.cn%2Fupload%2F20170418%2F679f950743c1480e83711fe2fbcb5581_th.jpg",
];

let a = <Carousel src={d} />;

a.mountTo(document.body);

const tl = new TimeLine();

window.tl = tl;

window.animation = new Animation({}, 'a', 0, 100, 1000, null);

// tl.add(new Animation({}, 'a', 0, 100, 1000, null));

tl.start();
