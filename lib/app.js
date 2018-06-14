const http = require('http');
const Router = require('./router');

class Dylan extends Router {
  constructor(opts) {
    super();
    this.locals = {};
    this.opts = opts;
  }

  createServer() {
    this.server = http.createServer(this.hydrate.bind(this));
    return this.server;
  }

  hydrate(req, res) {
    req.response = res;
    req.app = this;
    res.app = this;
    res.locals = {};
    res.request = req;
    res.on('error', res.error); // do we need this?
    this.handle(req, res);
  }

  handle(req, res) {
    let w = 0;
    const nextWare = () => {
      const ware = this.wares[w++];
      if (ware) {
        ware(req, res, nextWare);
      } else {
        const handles = this.find(req) || this.find(req, '/');
        if (handles) {
          let h = 0;
          const nextHandle = () => {
            handles[h++](req, res, nextHandle);
          }
          nextHandle();
        } else {
          res.sendStatus(404);
        }
      }
    }

    try {
      nextWare();
    } catch (e) {
      res.error(e, 500);
    }
  }

  inherit(render, mountPath = '') {
    this.render = render;
    this.stack
      .filter(route => route.app)
      .forEach(route => {
        route.app.inherit(render, mountPath + route.pattern);
      });
    this.build(mountPath);
  }

  listen() {
    const render = require('@dylan/engines')(this.opts.engine);
    this.inherit(render);
    if (!this.server) this.createServer();
    return this.server.listen.apply(this.server, arguments);
  }
}

module.exports = Dylan;
