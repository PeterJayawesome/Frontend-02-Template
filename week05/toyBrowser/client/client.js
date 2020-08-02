const parser = require("./parser.js");
const render = require('./render.js');
const net = require("net");
const images = require("images");

class Request {
  constructor(options) {
    const { method, host, port, path, body, headers } = options;
    console.log("Request -> constructor -> options", options);
    this.method = method || "GET";
    this.host = host;
    this.port = port || 80;
    this.path = path || "/";
    this.body = body || [];
    this.headers = headers || {};
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    if (this.headers["Content-Type"] === "application/json") {
      this.bodyText = JSON.stringify(this.body);
    } else if (
      this.headers["Content-Type"] === "application/x-www-form-urlencoded"
    ) {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join("&");
    }
    this.headers["Content-Length"] = this.bodyText.length;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new ResponseParser();
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString());
            // console.log("Request -> send -> this.toString()", this.toString());
          }
        );
        connection.on("data", (data) => {
          // console.log("data", data.toString());
          parser.receive(data.toString());
          if (parser.isFinished) {
            resolve(parser.response);
            connection.end();
          }
        });
        connection.on("error", (err) => {
          console.error("err:", err);
          reject(err);
          connection.end();
        });
      }
    });
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map((key) => `${key}: ${this.headers[key]}`)
  .join("\r\n")}\r
\r
${this.bodyText}`;
  }
}

class ResponseParser {
  constructor() {
    // response解析状态机定义
    this.WAITING_STATUS_LINE = (char) => {
      if (char === "\r") {
        return this.WAITING_HEADER_LINE_END;
      }
      this.statusLine += char;
      return this.WAITING_STATUS_LINE;
    };
    this.WAITING_STATUS_LINE_END = (char) =>
      char === "\n" ? this.WAITING_HEADER_NAME : this.WAITING_STATUS_LINE_END;
    this.WAITING_HEADER_NAME = (char) => {
      if (char === ":") {
        return this.WAITING_HEADER_SPACE;
      } else if (char === "\r") {
        // transfer-encoding 默认为chunked
        if (this.headers["Transfer-Encoding"] === "chunked") {
          this.bodyParser = new TrunkedBodyParser();
        }
        return this.WAITING_HEADER_BLOCK_END;
      } else {
        this.headerName += char;
        return this.WAITING_HEADER_NAME;
      }
    };
    this.WAITING_HEADER_SPACE = (char) =>
      char === " " ? this.WAITING_HEADER_VALUE : this.WAITING_HEADER_SPACE;
    this.WAITING_HEADER_VALUE = (char) => {
      if (char === "\r") {
        this.headers[this.headerName] = this.headerValue;
        this.headerName = "";
        this.headerValue = "";
        return this.WAITING_HEADER_LINE_END;
      }
      this.headerValue += char;
      return this.WAITING_HEADER_VALUE;
    };
    this.WAITING_HEADER_LINE_END = (char) =>
      char === "\n" ? this.WAITING_HEADER_NAME : this.WAITING_HEADER_LINE_END;
    this.WAITING_HEADER_BLOCK_END = (char) =>
      char === "\n" ? this.WAITING_BODY : this.WAITING_HEADER_BLOCK_END;
    this.WAITING_BODY = (char) => {
      // console.log("body: ", char);
      this.bodyParser.receiveChar(char);
      return this.WAITING_BODY;
    };

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(""),
    };
  }

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }
  receiveChar(char) {
    this.current = this.current(char);
  }
}

class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = (char) => {
      if (char === "\r") {
        if (this.length === 0) {
          this.isFinished = true;
        }
        return this.WAITING_LENGTH_LINE_END;
      }
      // length 是16进制的，所以读的时候是*16
      this.length *= 16;
      this.length += parseInt(char, 16);
      return this.WAITING_LENGTH;
    };
    this.WAITING_LENGTH_LINE_END = (char) =>
      char === "\n" ? this.READING_TRUNK : this.WAITING_LENGTH_LINE_END;
    // 需要根据this.length来判断是否进入下一状态，不是严格意义上的米利状态机
    this.READING_TRUNK = (char) => {
      this.content.push(char);
      this.length--;
      if (this.length === 0) return this.WAITING_NEW_LINE;
      return this.READING_TRUNK;
    };
    this.WAITING_NEW_LINE = (char) =>
      char === "\r" ? this.WAITING_NEW_LINE_END : this.WAITING_NEW_LINE;
    this.WAITING_NEW_LINE_END = (char) =>
      char === "\n" ? this.WAITING_LENGTH : this.WAITING_NEW_LINE_END;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WAITING_LENGTH;
  }
  receiveChar(char) {
    this.current = this.current(char);
  }
}

void (async function () {
  let request = new Request({
    method: "POST",
    host: "127.0.0.1",
    port: "8088",
    path: "/",
    headers: {
      ["X-Foo2"]: "customed",
    },
    body: {
      name: "winter",
    },
  });
  let response = await request.send();

  // console.log("response:", response);

  // 浏览器实际上是对body进行异步分段处理成DOM的，这里简化处理成直接全部传入处理
  let dom = parser.parseHTML(response.body)[0];

  // console.log(JSON.stringify(dom, null, '    '));
  let viewport = images(800, 600);

  render(viewport, dom);

  viewport.save("viewport.jpg");
})();
