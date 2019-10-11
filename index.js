const http = require('http');
const Request = require('./lib/request');
const Response = require('./lib/response');
const Dylan = require('./lib/app');
const { extendProto } = require('./lib/utils');

let setup = false;

extendProto(http.ServerResponse.prototype, Response);

module.exports = (opts) => {
  if (!setup) {
    extendProto(http.IncomingMessage.prototype, Request(opts));
    setup = true;
  }

  return new Dylan(opts);
}
