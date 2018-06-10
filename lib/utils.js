const typeOf = (item) => ({}).toString.call(item).slice(8, -1).toLowerCase();

function defineProperty(obj, name, descriptor) {
  descriptor = typeOf(descriptor) == 'object'
    ? descriptor
    : { get: descriptor };
  Object.defineProperty(obj, name, descriptor);
};

function extendProto(proto, obj) {
  Object.keys(obj).forEach(function (type) {
    Object.keys(obj[type]).forEach(function (prop) {
      if (type === 'properties') {
        defineProperty(proto, prop, obj[type][prop]);
      } else {
        proto[prop] = obj[type][prop];
      }
    });
  });
}

exports.getCallsite = (layer) => layer
  .getFileName()
  .replace(/\/[^\/]+$/, '')
  .replace(process.cwd(), '');

exports.production = process.env.NODE_ENV === 'production';
exports.defineProperty = defineProperty;
exports.extendProto = extendProto;
