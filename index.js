const http = require('http');
const Request = require('./lib/request');
const Response = require('./lib/response');
const Dylan = require('./lib/app');
const { extendProto } = require('./lib/utils');

extendProto(http.IncomingMessage.prototype, Request);
extendProto(http.ServerResponse.prototype, Response);

module.exports = (opts) => new Dylan(opts);
