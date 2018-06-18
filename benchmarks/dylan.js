const dylan = require('../index');
const app = dylan();
const subapp = dylan();
const subsubapp = dylan();
const library = dylan();

library.use((req, res, next) => {
  // console.log('library ware 1');
  next();
});

library.get('/', (req, res) => {
  // console.log('library index');
  res.end('im at /library');
});

library.get('/:type', (req, res) => {
  // console.log('library type');
  res.end(`im at /library type: ${req.params.type}`);
});

app.use('/library', library);

subsubapp.use((req, res, next) => {
  // console.log('subsubapp ware 1');
  next();
});

subsubapp.get('/yo', (req, res) => {
  res.end('yo');
});

subapp.use('/foo', subsubapp);


subapp.use((req, res, next) => {
  // console.log('subapp ware 1');
  next();
});

subapp.get('/hello', (req, res, next) => {
  // console.log('subapp im in hello route');
  next();
});

subapp.use((req, res, next) => {
  // console.log('subapp ware 2');
  next();
});

subapp.get('/hello', (req, res) => {
  // console.log('hello from subapp');
  res.end('hello from subapp');
});

app.use((req, res, next) => {
  // console.log('main ware 1');
  next();
});

app.use((req, res, next) => {
  // console.log('main ware 2');
  next();
});

app.use(subapp);

app.get('/foo/boo', (req, res, next) => {
  // console.log('im in foo boo route');
  next();
});

app.use((req, res, next) => {
  // console.log('main ware 3');
  next();
});

app.use('/foo/boo', (req, res, next) => {
  // console.log('im in foo boo ware');
  next();
});

app.get('/foo/boo', (req, res) => {
  // console.log('im in foo boo final handle');
  res.end('i finished /foo/boo');
});

app.get('/foo/boo/moo', (req, res, next) => {
  // console.log('/foo/boo/moo handle #1');
  next();
}, (req, res, next) => {
  // console.log('/foo/boo/moo handle #2');
  next();
}, (req, res) => {
  // console.log('/foo/boo/moo handle #3');
  res.end('/foo/boo/moo');
});

app.use('/account', (req, res, next) => {
  // console.log('ware at /account');
  next();
});

app.use('/user/:id', (req, res, next) => {
  // console.log('im in /user/:id');
  next();
});

app.get('/user/:id', (req, res) => {
  res.end(`User: ${req.params.id}`);
});

app.get('/account', (req, res) => res.end('/account'));

app.get('/', (req, res) => res.end('im at / index'));

app.listen(4000);

