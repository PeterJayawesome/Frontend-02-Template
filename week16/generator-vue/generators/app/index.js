var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  async initPackage() {
    // let answer = await this.prompt([
    //   {
    //     type: "input",
    //     name: "name",
    //     message: "Your project name",
    //     default: this.appname,
    //   },
    // ]);
    const pkgJson = {
      name: "demo",
      version: "1.0.0",
      description: "",
      main: "src/main.js",
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      author: "",
      license: "ISC",
      devDependencies: {
        webpack: "^4.44.0",
      },
      dependencies: {},
    };

    this.fs.extendJSON(this.destinationPath("package.json"), pkgJson);
    this.npmInstall();
    this.npmInstall(["vue"], { "save-dev": false });
    // this.npmInstall(["webpack", "vue-loader"], { "save-dev": true });
    this.npmInstall(
      [
        "vue-loader",
        "vue-template-compiler",
        "vue-style-loader",
        "css-loader",
        "copy-webpack-plugin",
      ],
      { "save-dev": true }
    );
  }

  copyFiles() {
    this.fs.copyTpl(
      this.templatePath("helloWorld.vue"),
      this.destinationPath("src/helloWorld.vue"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("webpack.config.js"),
      this.destinationPath("webpack.config.js"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("main.js"),
      this.destinationPath("src/main.js"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("index.html"),
      this.destinationPath("src/index.html"),
      { title: "demo" }
    );
  }
};
