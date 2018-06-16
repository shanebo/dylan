const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

class Router {
  constructor() {
    this.stack = [];
    this.params = {};
    METHODS.forEach(method => {
      this[method.toLowerCase()] = this.create.bind(this, method);
    });
  }

  param(name, handle) {
    this.params[name] = handle;
    return this;
  }

  use(...handles) {
    const pattern = typeof handles[0] === 'string' ? handles.shift() : '';
    this.stack.push(buildRoute('*', pattern, handles, true));
    return this;
  }

  create(method, pattern, ...handles) {
    this.stack.push(buildRoute(method, pattern, handles));
    return this;
  }

  build(mountPath) {
    this.stack.forEach(route => {
      route.pattern = mountPath + route.pattern;
      if (route.mounted || route.pattern.includes(':')) {
        route.regex = patternRegex(route);
        route.params = getParams(route);
        const paramHandles = route.params
          .filter(param => this.params[param])
          .map(param => this.params[param]);
        route.handles = [].concat(paramHandles, route.handles);
      } else {
        route.pathname = route.pattern || '/';
      }
    });
  }

  find(req, route) {
    if (route.method !== '*' && route.method !== req.method) {
      return false;
    }

    if (route.pathname) {
      return route.pathname === req.pathname ? route.handles : false;
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

const buildRoute = (method, pattern, handles, mounted = false) => ({
  method,
  pattern,
  handles,
  mounted
});

const patternRegex = (route) => {
  const capture = route.pattern === '' ? '/' : route.pattern.replace(/:[^\/:.-]+/g, '([^/]+)');
  const regex = route.mounted ? `^${capture}.*$` : `^${capture}$`;
  return new RegExp(regex);
}

const getParams = (route) => {
  let matches = route.pattern.match(route.regex);
  if (matches) {
    matches.shift();
    return matches.map(item => item.replace(':', ''));
  }
  return [];
}

module.exports = Router;
