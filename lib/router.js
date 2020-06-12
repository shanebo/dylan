const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

class Router {
  constructor() {
    this.stack = [];
    this.params = {};
    METHODS.forEach(method => {
      this[method.toLowerCase()] = this.add.bind(this, method);
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

  add(method, pattern, ...handles) {
    this.stack.push(buildRoute(method, pattern, handles));
    return this;
  }

  build(mountPath) {
    this.stack.forEach(route => {
      // route.pattern = (mountPath + route.pattern).replace(/(?!^\/)\/+$/, ''); // this removes all trailing slashes
      route.pattern = (mountPath + route.pattern).replace(/(?!^\/)\/$/, ''); // this removes trailing slash
      if (/:|\?|\(|\)/g.test(route.pattern)) {
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
    if (!route) return false;

    const { pathname } = req;
    const { method, regex, pattern, handles, mounted } = route;

    if (method !== '*' && method !== req.method) {
      // wrong method
      return false;
    }

    if (!pattern) {
      // middleware or subapp with no route
      return handles;
    }

    if (pattern === pathname) {
      return handles;
    }

    if (mounted && pathname.startsWith(pattern)) {
      // subapp
      return handles;
    }

    if (!regex) {
      return false;
    }

    const matches = pathname.match(regex);

    if (matches) {
      matches.shift();
      req.params = {};
      let i = 0;
      const paramsLength = route.params.length;
      for (; i < paramsLength; i++) {
        req.params[route.params[i]] = matches[i];
      }
      return handles;
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
  const capture = route.pattern
    .replace(/\(\//g, '(?:/') // make explicit optional path segments non-capturing
    .replace(/(\/:[^\/\(\):.-]+(\([^\/]+)?)\?/g, '(?:$1)?') // optional path segment use case
    .replace(/\/:[^\/\(\):.-]+(\([^\?][^\/]*)/, '/$1') // param options use case
    .replace(/\/:[^\/\(\):.-]+/g, '/([^/]+)'); // normal use case
  const regex = route.mounted ? `^${capture}.*$` : `^${capture}$`;
  return route.pattern ? new RegExp(regex) : false;
}

const getParams = (route) => {
  const matches = route.pattern.match(/:[^\/\(\)\?:.-]+/g);
  return matches
    ? matches.map(item => item.replace(':', ''))
    : [];
}

module.exports = Router;
