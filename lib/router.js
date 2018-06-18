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
      route.pattern = (mountPath + route.pattern).replace(/(?!^\/)\/$/, ''); // this removes trailing slash
      if (route.pattern.includes(':')) {
        route.regex = patternRegex(route);
        route.params = getParams(route);
        const paramHandles = route.params
          .filter(param => this.params[param])
          .map(param => this.params[param]);
        route.handles = [].concat(paramHandles, route.handles);
      }
    });
  }

  find(req, route) {
    if (route.method != '*' && route.method != req.method) {
      // wrong method
      return false;
    }

    if (route.pattern == req.pathname) {
      // perfect match of pattern and pathname
      return route.handles;
    }

    if (route.pattern == '' || route.mounted && req.pathname.startsWith(route.pattern)) {
      // mounted apps that don't have regex patterns
      return route.handles;
    }

    if (!route.regex) {
      return false;
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
  const capture = route.pattern.replace(/:[^\/:.-]+/g, '([^/]+)');
  const regex = route.mounted ? `^${capture}.*$` : `^${capture}$`;
  return route.pattern ? new RegExp(regex) : false;
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
