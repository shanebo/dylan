const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

class Router {
  constructor() {
    this.wares = [];
    // this.stack = [];

    this.layers = [];
    this.things = {};

    this.params = {};
    this.routes = {};
    METHODS.forEach(method => {
      this[method.toLowerCase()] = this.create.bind(this, method);
      this.routes[method] = {};
    });
  }

  param(name, handle) {
    this.params[name] = handle;
    return this;
  }

  use(pattern, ...handles) {
    const args = Array.from(arguments);
    let route;

    if (typeof args[0] !== 'string') {
      route = buildRoute('*', '/', args, args[0].handle ? args[0] : false, true);
    } else {
      const app = args[1];
      handles = handles.map(handle => handle.handle ? handle.handle.bind(handle) : handle);
      if (app.handle) {
        route = buildRoute('*', pattern, handles, app, true);
      } else {
        route = buildRoute('*', pattern, handles, false, true);
      }
    }

    this.layers.push(route);
    return this;
  }

  create(method, pattern, ...handles) {
    this.layers.push(buildRoute(method, pattern, handles));
    // this.stack.push(buildRoute(method, pattern, handles));
    return this;
  }

  build(mountPath) {
    // 1. Iterates through each route and create the second char props empty array
    // 2. Iterates through each route extend them with their details
    // 3. Push the extended routes with method * and route * into all 2nd char prop arrays
    // - only * routes needs to get put on all keys
    // 4. Push all other routes onto the 2nd char prop arrays they belong on

    // 1
    this.layers.forEach(route => {
      if (mountPath === '/') mountPath = '';
      route.pattern = mountPath + (route.pattern === '/' ? '' : route.pattern);

      const key = keyFor(route.pattern);
      if (!this.things[key]) {
        this.things[key] = [];
      }
    });

    // console.log('\n');
    // console.log(this.things);

    // 2
    this.layers.forEach(route => {
      if (route.pattern === '' || route.app || route.mounted || route.pattern.includes(':')) {
        route.regex = patternRegex(route);
        route.params = getParams(route);
        const paramHandles = route.params
          .filter(param => this.params[param])
          .map(param => this.params[param]);
        route.handles = [].concat(paramHandles, route.handles);
      } else {
        route.pathname = (route.pattern === '' ? '/' : route.pattern);
      }
    });

    // 3
    this.layers.forEach(route => {
      const key = keyFor(route.pattern);
      console.log('route.pattern', route.pattern);
      if (route.pattern === '' && route.mounted === true) {
        Object.keys(this.things).forEach((prop) => {
          this.things[prop].push(route);
        });
      } else {
        this.things[key].push(route);
      }
    });

    // console.log('\n');
    // console.log('\n');
    // console.log(this.layers);
    console.log('\n');
    console.log('\n');
    console.log(this.things);
  }

  keyArr(req, key = req.pathname.charAt(1) || '/') {
    console.log('\n\n\nkey inside keyArr', key);
    console.log('this.things', this.things);

    return this.things[key];
  }

  matches(req, route) {
    if (route.pathname) {
      return route.pathname === req.pathname
        ? route.handles
        : false;
    }

    if (route.pattern === '') {
      console.log('route.pattern inside matches', route.pattern);
      return route.handles;
    }

    const matches = req.pathname.match(route.regex);
    if (matches) {
      matches.shift();
      req.params = {};
      let i = 0;
      for (; i < route.params.length; i++) {
        req.params[route.params[i]] = matches[i];
      }
      return route.handles;
    }

    return false;
  }
}

const buildRoute = (method, pattern, handles, app = false, mounted = false) => ({
  method,
  pattern,
  handles,
  app,
  mounted
});

const keyFor = (pattern) => {
  const char = pattern.charAt(1);
  return char === ':' || char === '' ? '/' : char;
}

// const wrap = (layer) =>
//   layer.handle
//     ? (req, res, next) => layer.handle(req, res, next)
//     : layer;


const patternRegex = (route) => {
  let capture;
  if (route.pattern === '') {
    capture = '/';
  } else if (route.pattern === '*') {
    return new RegExp('[\s\S]*');
  } else {
    capture = route.pattern.replace(/:[^\/:.-]+/g, '([^/]+)');
  }

  const regex = route.mounted ? `^${capture}.*$` : `^${capture}$`;
  console.log(route);
  console.log('regex', regex);

  return new RegExp(regex);
}

// const patternRegex = (route) => {
//   const capture = route.pattern === '' ? '/' : route.pattern.replace(/:[^\/:.-]+/g, '([^/]+)');
//   const regex = route.app ? `^${capture}.*$` : `^${capture}$`;
//   return new RegExp(regex);
// }

const getParams = (route) => {
  let matches = route.pattern.match(route.regex);
  if (matches) {
    matches.shift();
    return matches.map(item => item.replace(':', ''));
  }
  return [];
}

module.exports = Router;
