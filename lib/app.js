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

  hydrate(req, res) {
    req.response = res;
    req.app = this;
    res.app = this;
    res.locals = {};
    res.request = req;
    res.on('error', res.error); // do we need this?
    this.handle(req, res);
  }

  handle(req, res, next = null) {
    let s = 0;
    const stack = this.keyArr(req);
    if (!next) next = () => res.sendStatus(404);

    // if (!stack) {
    //   next();
    //   return;
    // }

    console.log('\n\n\nstack:');
    console.log(stack);


    const nextRoute = () => {
      const route = stack[s++];

      console.log('\n\nroute');
      console.log(route);

      const handles = this.matches(req, route);
      if (handles) {
        let h = 0;
        const nextHandle = () => {
          handles[h++](req, res, handles[h] ? nextHandle : nextRoute);
        }
        nextHandle();
      } else if (stack[s]) {
        console.log('stack[s]');
        nextRoute();
      } else {
        next();
      }
    }

    try {
      nextRoute();
    } catch (e) {
      res.error(e, 500);
    }
  }

  // handle(req, res, next = null) {
  //   if (!next) next = () => res.sendStatus(404);
  //   let w = 0;
  //   const nextWare = () => {
  //     const ware = this.wares[w++];
  //     if (ware) {
  //       ware(req, res, nextWare);
  //     } else {
  //       const handles = this.find(req) || this.find(req, '/');
  //       if (handles) {
  //         let h = 0;
  //         const nextHandle = () => {
  //           handles[h++](req, res, nextHandle);
  //         }
  //         nextHandle();
  //       } else {
  //         next();
  //       }
  //     }
  //   }

  //   try {
  //     nextWare();
  //   } catch (e) {
  //     res.error(e, 500);
  //   }
  // }

  inherit(render, mountPath = '') {
    this.render = render;

    console.log('mountPath', mountPath);


    // THIS IS PROBABLY WHERE THE NEW SUBAPPS ARE BROKEN
    this.layers
      .forEach((route, r) => {
        if (route.app) {
          const app = route.app;
          // route.handles = app.handle.bind(app);
          route.handles = [app.handle.bind(app)];
          // app.inherit(render, mountPath);
        }
      });

    this.layers
      .filter(route => route.app)
      .forEach(route => {
        route.app.inherit(render, mountPath + route.pattern);
      });
    this.build(mountPath);
  }

  // inherit(render, mountPath = '') {
  //   this.render = render;
  //   this.wares
  //     .forEach((ware, a) => {
  //       if (ware instanceof Dylan) {
  //         const app = ware;
  //         app.inherit(render, mountPath);
  //         this.wares[a] = app.handle.bind(app);
  //       }
  //     });

  //   this.stack
  //     .filter(route => route.app)
  //     .forEach(route => {
  //       route.app.inherit(render, mountPath + route.pattern);
  //     });
  //   this.build(mountPath);
  // }

  listen() {
    const render = this.opts.engine
      ? require('@dylan/engines')(this.opts.engine)
      : false;
    this.inherit(render);
    if (!this.server) this.createServer();
    return this.server.listen.apply(this.server, arguments);
  }
}

module.exports = Dylan;
