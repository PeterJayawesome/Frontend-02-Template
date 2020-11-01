import HelloWorld from "./helloworld.vue";
import Vue from "Vue";

new Vue({
  el: "#app",
  render: (h) => h(HelloWorld),
});
