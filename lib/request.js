const typeis = require('type-is');
const parseurl = require('parseurl');
const qs = require('qs');
const { coerce } = require('coerce');


const Request = {

  properties: {

    querystring() {
      return parseurl(this).query;
    },

    ip() {
      return this.ips[0] || this.connection.remoteAddress;
    },

    ips() {
      return (this.get('x-forwarded-for') || '').split(',');
    },

    xhr() {
      return (this.get('x-requested-with') || '').toLowerCase() === 'xmlhttprequest';
    },

    ua() {
      return this.get('user-agent');
    },

    protocol() {
      return this.get('x-forwarded-proto') || this.connection.encrypted
        ? 'https'
        : 'http';
    },

    secure() {
      return this.protocol === 'https';
    },

    originalUrl() {
      return `${this.protocol}://${this.headers.host}${this.url}`;
    }
  },

  methods: {

    is(types) {
      let arr = types;
      if (!Array.isArray(types)) {
        arr = new Array(arguments.length);
        for (var i = 0; i < arr.length; i++) {
          arr[i] = arguments[i];
        }
      }
      return typeis(this, arr);
    },

    get(header) {
      return this.headers[header.toLowerCase()];
    }
  }
};

['auth', 'host', 'hostname', 'href', 'port', 'slashes']
  .forEach(function(prop) {
    Request.properties[prop] = function() {
      return parseurl.original(this)[prop];  // much slower
    }
  });

['hash', 'path', 'pathname', 'search']
  .forEach(function(prop) {
    Request.properties[prop] = function() {
      return parseurl(this)[prop];
    }
  });


module.exports = (opts = { parsing: {}}) => {
  Request.properties.query = {
    get() {
      if (!this._query) {
        const querystring = (this.querystring || '').replace(/[^=&]+=(&|$)/g, '').replace(/&$/, '');
        const map = opts && opts.parsing.coerceMap ? opts.parsing.coerceMap : null;

        this._query = querystring
          ? coerce(qs.parse(querystring, opts.parsing), opts.parsing, querystring)
          : querystring;
      }
      return this._query;
    },
    set(val) {
      this._query = val;
    }
  }

  return Request;
};
