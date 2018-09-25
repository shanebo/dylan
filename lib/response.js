const { STATUS_CODES } = require('http');
const mime = require('mime');
const merge = require('utils-merge');
const { production } = require('./utils');

const Response = {

  properties: {

    messages() {
      return STATUS_CODES;
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

    error(error, status) {
      Error.stackTraceLimit = Infinity;
      const message = this.messages[status];
      const errorHandle = this.app.opts.errorHandle;

      if (errorHandle && production) {
        errorHandle.call(errorHandle, this.request, this, error, status, message);
      } else if (production) {
        this.status(status).type('text').send(`${status}: ${message}`);
      } else {
        let trace = (error.stack || '').split('\n');
        let type = trace[0].replace(error.message, '').replace(':', '');
        let stack = trace.slice(1).map(t => `${t}\n`).join('');
        let reason = error.message === status.toString() ? message : error.message;
        let output = `${status}\n${type}\n\n${reason}\n${stack}\n`;
        this.status(status).type('text').send(output);
      }
    },

    status(code) {
      this.statusCode = code;
      return this;
    },

    sendStatus(code) {
      this.status(code);
      this.end(`${code} : ${this.messages[code]}`);
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
      const locals = merge(this.locals, data);
      const html = this.app.render(path, locals);

      // check args and flop them since data is optional

      this.status(200);
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
