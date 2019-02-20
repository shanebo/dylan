const http = require('http');
const Router = require('./router');

class Dylan extends Router {
  constructor(opts = {}) {
    super();
    this.locals = {};
    this.opts = opts;
  }

  createServer() {
    this.server = http.createServer(this.hydrate.bind(this));
    return this.server;
  }

  listen() {
    const engine = this.opts.engine
      ? require('@dylan/engines')(this.opts.engine)
      : false;
    this.engine = engine.instance;
    this.inherit(engine.render);
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
    res.on('error', res.error); // do we need this?
    this.handle(req, res, () => res.sendStatus(404));
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
    } catch (e) {
      res.error(e, 500);
    }
  }
}

module.exports = Dylan;
