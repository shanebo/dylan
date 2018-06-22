const polka = require('polka');
const app = polka();
const subapp = polka();
const subsubapp = polka();



function one(req, res, next) {
  req.one = true;
  next();
}

function two(req, res, next) {
  req.two = true;
  next();
}

// app
//   .use(one)
//   .use(two)
//   .get('/favicon.ico', _ => { })
//   .get('/', (req, res) => res.end('hello world'));


// function param1(req, res, next) {
//   next();
// }

// function param2(req, res, next) {
//   next();
// }

// app.param('userId', param1);
// app.param('projectId', param2);

app
  .use(one)
  .use(two)
  .get('/favicon.ico', _ => { })
  .get('/', (req, res) => res.end('hello world'))
  .post('/articles', (req, res) => res.end('POST /articles'))
  .get('/articles', (req, res) => res.end('GET /articles'))
  .get('/name/:name', (req, res) => res.end(`Name: ${req.params.name}`))
  .get('/uno', (req, res) => res.end('GET /uno'))
  .get('/dos', (req, res) => res.end('GET /dos'))
  .get('/tres', (req, res) => res.end('GET /tres'))
  .get('/quatro', (req, res) => res.end('GET /quatro'))
  .get('/sinco', (req, res) => res.end('GET /sinco'))
  .get('/seis', (req, res) => res.end('GET /seis'))
  .get('/siete', (req, res) => res.end('GET /siete'))
  .get('/ocho', (req, res) => res.end('GET /ocho'))
  .get('/nueve', (req, res) => res.end('GET /nueve'))
  .get('/diez', (req, res) => res.end('GET /diez'))

  .get('/one', (req, res) => res.end('GET /uno'))
  .get('/two', (req, res) => res.end('GET /dos'))
  .get('/three', (req, res) => res.end('GET /tres'))
  .get('/four', (req, res) => res.end('GET /quatro'))
  .get('/five', (req, res) => res.end('GET /sinco'))
  .get('/six', (req, res) => res.end('GET /seis'))
  .get('/seven', (req, res) => res.end('GET /siete'))
  .get('/eigth', (req, res) => res.end('GET /ocho'))
  .get('/nine', (req, res) => res.end('GET /nueve'))
  .get('/ten', (req, res) => res.end('GET /diez'))

  .get('/user/:id', (req, res) => {
    res.end(`User: ${req.params.id}`);
  })
  .get('/user/:userId/project/:projectId', (req, res) => {
    res.end(`User: ${req.params.userId} Project: ${req.params.projectId}`);
  });


const articles = polka();
articles.get('/', (req, res) => res.end('should be at /library/articles'));
articles.get('/popular', (req, res) => res.end('should be at /library/articles/popular'));

const library = polka();
library.get('/', (req, res) => res.end('should be at /library'));
library.get('/articles', (req, res) => res.end('should be at /library/articles'));
library.use('/articles', articles);

app.use('/library', library);




// subsubapp.use((req, res, next) => {
//   // console.log('subsubapp ware 1');
//   next();
// });

// subsubapp.get('/yo', (req, res) => {
//   res.end('yo');
// });

// subapp.use('/foo', subsubapp);


// subapp.use((req, res, next) => {
//   // console.log('subapp ware 1');
//   next();
// });

// subapp.get('/hello', (req, res, next) => {
//   // console.log('subapp im in hello route');
//   next();
// });

// subapp.use((req, res, next) => {
//   // console.log('subapp ware 2');
//   next();
// });

// subapp.get('/hello', (req, res) => {
//   // console.log('hello from subapp');
//   res.end('hello from subapp');
// });

// app.use((req, res, next) => {
//   // console.log('ware 1');
//   next();
// });

// app.use('/', subapp);

// app.get('/foo/boo', (req, res, next) => {
//   // console.log('im in foo boo route');
//   next();
// });

// app.use((req, res, next) => {
//   // console.log('main ware 3');
//   next();
// });

// app.use('/foo/boo', (req, res, next) => {
//   // console.log('im in foo boo ware');
//   next();
// });

// app.get('/foo/boo', (req, res) => {
//   // console.log('im in foo boo final handle');
//   res.end('i finished /foo/boo');
// });

// app.get('/foo/boo/moo', (req, res, next) => {
//   // console.log('/foo/boo/moo handle #1');
//   next();
// }, (req, res, next) => {
//   // console.log('/foo/boo/moo handle #2');
//   next();
// }, (req, res) => {
//   // console.log('/foo/boo/moo handle #3');
//   res.end('/foo/boo/moo');
// });

// app.use('/account', (req, res, next) => {
//   // console.log('ware at /account');
//   next();
// });

// app.use('/user/:id', (req, res, next) => {
//   // console.log('im in /user/:id');
//   next();
// });

// app.get('/user/:id', (req, res) => {
//   res.end(`User: ${req.params.id}`);
// });

// app.get('/account', (req, res) => res.end('/account'));

// app.get('/', (req, res) => res.end('im at / index'));

app.listen(5000);



// function one(req, res, next) {
//   req.one = true;
//   next();
// }

// function two(req, res, next) {
//   req.two = true;
//   next();
// }

// app
//   .use(one, two)
//   .get('/favicon.ico', _ => {})
//   .get('/', (req, res) => res.end('hello world'))
//   .post('/articles', (req, res) => res.end('POST /articles'))
//   .get('/articles', (req, res) => res.end('GET /articles'))
//   .get('/:name', (req, res) => res.end(`Name: ${req.params.name}`))
//   .get('/uno', (req, res) => res.end('GET /uno'))
//   .get('/dos', (req, res) => res.end('GET /dos'))
//   .get('/tres', (req, res) => res.end('GET /tres'))
//   .get('/quatro', (req, res) => res.end('GET /quatro'))
//   .get('/sinco', (req, res) => res.end('GET /sinco'))
//   .get('/user/:id', (req, res) => {
//     res.end(`User: ${req.params.id}`);
//   })
//   .get('/user/:userId/project/:projectId', (req, res) => {
//     res.end(`User: ${req.params.userId} Project: ${req.params.projectId}`);
//   });


// const articles = polka();
// articles.get('/', (req, res) => res.end('should be at /library/articles'));
// articles.get('/popular', (req, res) => res.end('should be at /library/articles/popular'));

// const library = polka();
// library.get('/', (req, res) => res.end('should be at /library'));
// library.get('/articles', (req, res) => res.end('should be at /library/articles'));
// library.use('/articles', articles);

// app.use('/library', library);
// app.listen(4500);
