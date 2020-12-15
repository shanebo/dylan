Error.stackTraceLimit = Infinity;

const { STATUS_CODES } = require('http');
const STATUS_MESSAGES = Object.entries(STATUS_CODES)
  .reduce((acc, [key, val]) => {
    acc[val] = Number(key);
    return acc;
  }, {});
const mime = require('mime');
const { production } = require('./utils');


const Response = {

  properties: {

    statusMessage() {
      return STATUS_CODES[this.statusCode] || '';
    }
  },

  methods: {

    get(header) {
      return this.getHeader(header);
    },

    set(header, value) {
      this.setHeader(header, value);
      return this;
    },

    error(err) {
      const errorHandle = this.app.opts.errorHandle;
      this.status(STATUS_MESSAGES[err.message] || 500);

      if (errorHandle) {
        errorHandle.call(errorHandle, err, this.request, this);
      } else if (production) {
        this.type('text').send(`${this.statusCode}: ${this.statusMessage}`);
      } else {
        const trace = (err.stack || '').split('\n');
        const type = trace[0].replace(err.message, '').replace(':', '');
        const stack = trace.slice(1).map(t => `${t}\n`).join('');
        this.type('text').send(`${this.statusCode}\n${type}\n\n${err.message}\n${stack}\n`);
      }
    },

    status(code) {
      this.statusCode = code;
      return this;
    },

    sendStatus(code) {
      this.status(code);
      this.end(`${code} : ${this.statusMessage}`);
    },

    type(value) {
      this.set('Content-Type', mime.getType(value));
      return this;
    },

    send(body) {
      const type = typeof body;
      if (type === 'object') {
        this.json(body);
      } else if (type === 'string') {
        if (!this.get('Content-Type')) this.type('html');
        this.end(body);
      } else {
        this.type('text').end(body.toString());
      }
    },

    json(body, replacer, spaces = production ? 0 : 2) {
      if (typeof body === 'object') {
        body = JSON.stringify(body, replacer, spaces);
      }
      this.type('json').end(body);
    },

    location(url) {
      this.set('Location', url).end();
    },

    redirect(url) {
      const code = this.statusCode;
      if (!(code === 301 || code === 302)) this.status(302);
      this.set('Location', url).end();
    },

    render(path, data = {}, callback) {
      const locals = Object.assign(this.locals, data);
      const html = this.app.render(path, locals);

      // check args and flop them since data is optional

      this.set('Cache-Control', 'no-cache');
      this.set('Content-Type', 'text/html');
      this.set('Content-Length', Buffer.byteLength(html, 'utf8')); // prob should only set this on first and second condition
      this.set('Date', new Date().toUTCString());
      this.set('Vary', 'Accept-Encoding');

      if (callback) {
        callback(html);
      } else {
        this.end(html);
      }
    }
  }
};

module.exports = Response;
