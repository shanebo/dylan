const framework = require(process.env.FRAMEWORK);
const app = framework();

app
  .use((req, res, next) => {
    req.one = true;
    next();
  })
  .use((req, res, next) => {
    req.two = true;
    next();
  })
  .get('/favicon.ico', _ => { })
  .get('/', (req, res) => res.end('hello world'))
  .get('/user/:id', (req, res) => {
    res.end(`User: ${req.params.id}`);
  })
  .get('/articles', (req, res) => res.end('GET /articles'))
  .get('/user/:userId/project/:projectId', (req, res) => {
    res.end(`User: ${req.params.userId} Project: ${req.params.projectId}`);
  });

const articles = framework();
articles.get('/', (req, res) => res.end('GET /library/articles'));
articles.get('/popular', (req, res) => res.end('GET /library/articles/popular'));

const library = framework();
library.use((req, res, next) => {
  // library ware 1
  next();
});
library.use((req, res, next) => {
  // library ware 2
  next();
});
library.get('/', (req, res) => res.end('GET /library'));
library.get('/articles', (req, res) => res.end('GET /library/articles'));
library.use('/articles', articles);

app.use('/library', library);
app.listen(3000);
