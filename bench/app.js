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
articles.use((req, res, next) => {
  req.three = true;
  next();
});
articles.use((req, res, next) => {
  req.four = true;
  next();
});
articles.get('/', (req, res) => res.end('GET /library/articles'));
articles.get('/:sort', (req, res) => res.end(`GET /library/articles/${req.params.sort}`));

const library = framework();
library.use((req, res, next) => {
  req.five = true;
  next();
});
library.use((req, res, next) => {
  req.six = true;
  next();
});
library.get('/', (req, res) => res.end('GET /library'));
library.get('/articles', (req, res) => res.end('GET /library/articles'));
library.use('/articles', articles);

app.use('/library', library);
app.listen(3000);
