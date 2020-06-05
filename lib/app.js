const http = require('http');
const Router = require('./router');

class Dylan extends Router {
  constructor(opts = {}) {
    super();
    this.locals = {};
    this.opts = opts;

    const parsingDefaults = {
      allowDots: true,
      arrayFormat: 'repeat'
    }

    this.opts.parsing = {
      ...parsingDefaults,
      ...opts.parsing
    }

    if (this.opts.engine) {
      const engine = require('@dylan/engines')(this.opts.engine);
      this.engine = engine.instance;
      this.engineRender = engine.render;
    }
  }

  createServer() {
    this.server = http.createServer(this.hydrate.bind(this));
    return this.server;
  }

  listen() {
    if (this.engineRender) this.inherit(this.engineRender);
    if (!this.server) this.createServer();
    return this.server.listen.apply(this.server, arguments);
  }

  inherit(render, mountPath = '') {
    this.render = render;
    this.stack.forEach((route) => {
      route.handles.forEach((thing, t) => {
        if (thing instanceof Dylan) {
          thing.inherit(render, mountPath + route.pattern);
          route.handles[t] = thing.handle.bind(thing);
        }
      });
    });
    this.build(mountPath);
  }

  hydrate(req, res) {
    req.response = res;
    req.app = this;
    res.app = this;
    res.locals = {};
    res.request = req;
    req.on('error', res.error);
    res.on('error', res.error);
    this.handle(req, res, () => { throw new Error('Not Found'); });
  }

  handle(req, res, final) {
    let s = 0;
    const nextRoute = () => {
      const handles = this.find(req, this.stack[s++]);
      if (handles) {
        let h = 0;
        const nextHandle = () => {
          handles[h++](req, res, handles[h] ? nextHandle : nextRoute);
        }
        nextHandle();
      } else if (this.stack[s]) {
        nextRoute();
      } else {
        final();
      }
    }

    try {
      nextRoute();
    } catch (err) {
      res.error(err);
    }
  }
}

module.exports = Dylan;
