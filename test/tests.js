const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const dylan = require('../index');
chai.use(chaiHttp);

describe('Dylan', function() {
  const host = 'http://127.0.0.1:8888';
  let app;

  beforeEach(() => app = dylan({
    engine: {
      name: 'beard',
      opts: {
        root: process.cwd(),
        cache: true,
      }
    }
  }));
  afterEach(() => app.server.close());

  describe('Middleware', function() {
    it('run on all requests', (done) => {
      app.use((req, res, next) => {
        res.locals.foo = 'yo';
        next();
      });
      app.get('/foo', (req, res) => {
        res.end(res.locals.foo);
      });
      app.listen(8888);

      chai.request(host)
        .get('/foo')
        .end((err, res) => {
          expect(res.text).to.equal('yo');
          done();
        });
    });

    it('mount middleware at pattern', (done) => {
      app.use('/static', (req, res, next) => {
        res.locals.static = 'i went through static';
        next();
      });
      app.get('/static', (req, res) => {
        res.end(res.locals.static);
      });
      app.listen(8888);

      chai.request(host)
        .get('/static')
        .end((err, res) => {
          expect(res.text).to.equal('i went through static');
          done();
        });
    });
  });

  describe('Router', function() {
    it('handles / hello world', (done) => {
      app.get('/', (req, res) => {
        res.end('hello world');
      });
      app.listen(8888);

      chai.request(host)
        .get('/')
        .end((err, res) => {
          expect(res.text).to.equal('hello world');
          done();
        });
    });

    it('handles /:name single param', (done) => {
      app.get('/:name', (req, res) => {
        res.end(req.params.name);
      });
      app.listen(8888);

      chai.request(host)
        .get('/jack-black')
        .end((err, res) => {
          expect(res.text).to.equal('jack-black');
          done();
        });
    });

    it('handles nested params', (done) => {
      app.get('/articles/:category/:author', (req, res) => {
        res.end(`articles about ${req.params.category} by ${req.params.author}`);
      });
      app.get('/:type/lookup/:id', (req, res) => {
        res.end(req.params.type + ' with id ' + req.params.id);
      });
      app.listen(8888);

      chai.request(host)
        .get('/articles/salvation/dylan')
        .end((err, res) => {
          expect(res.text).to.equal('articles about salvation by dylan');
        });

      chai.request(host)
        .get('/particular-baptist/lookup/spurgeon')
        .end((err, res) => {
          expect(res.text).to.equal('particular-baptist with id spurgeon');
          done();
        });
    });

    describe('Subapps', function() {
      it('mount at route', (done) => {
        library = dylan();
        library.get('/', (req, res) => {
          res.end('library index');
        });
        library.get('/popular', (req, res) => {
          res.end('popular library');
        });
        app.use('/library', library);
        app.listen(8888);

        chai.request(host)
          .get('/library')
          .end((err, res) => {
            expect(res.text).to.equal('library index');
          });

        chai.request(host)
          .get('/library/popular')
          .end((err, res) => {
            expect(res.text).to.equal('popular library');
            done();
          });
      });

      it('mount child subapps', (done) => {
        library = dylan();
        articles = dylan();
        articles.get('/', (req, res) => {
          res.end('library articles index');
        });

        library.use('/articles', articles);
        app.use('/library', library);
        app.listen(8888);

        chai.request(host)
          .get('/library/articles')
          .end((err, res) => {
            expect(res.text).to.equal('library articles index');
            done();
          });
      });
    });

    it('handles param checks', (done) => {
      app.param('count', (req, res, next) => {
        if (/(uno|dos|tres)/.test(req.params.count)) {
          next();
        } else {
          res.sendStatus(404);
        }
      });
      app.get('/number/:count', (req, res) => {
        res.end(req.params.count);
      });
      app.listen(8888);

      chai.request(host)
        .get('/number/dos')
        .end((err, res) => {
          expect(res.text).to.equal('dos');
        });

      chai.request(host)
        .get('/number/cuatro')
        .end((err, res) => {
          expect(res.text).to.include('404');
          done();
        });
    });

  });

  describe('Response', function() {
    it('can redirect', (done) => {
      app.get('/google', (req, res) => {
        res.redirect('http://www.google.com');
      });
      app.listen(8888);

      chai.request(host)
        .get('/google')
        .redirects(0)
        .then(Promise.reject)
        .catch(({ response }) => {
          expect(response).to.redirectTo('http://www.google.com');
          done();
        });
    });

    it('can render', (done) => {
      app.get('/', (req, res) => {
        res.render('test');
      });
      app.listen(8888);

      chai.request(host)
        .get('/')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text.trim()).to.equal('content foo block');
          done();
        });
    });
  });
});
