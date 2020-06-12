const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const dylan = require('../index');
chai.use(chaiHttp);

describe('Dylan', function() {
  const host = 'http://127.0.0.1:8888';
  const request = chai.request(host);
  let config = {
    engine: {
      name: 'beard',
      opts: {
        root: process.cwd(),
        cache: true,
      }
    }
  };
  let app;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    app = dylan(config);
  });
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

      request
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

      request
        .get('/static')
        .end((err, res) => {
          expect(res.text).to.equal('i went through static');
          done();
        });
    });
  });

  it('returns 404s for unhandled routes', (done) => {
    app.listen(8888);

    request
      .get('/invalid-path')
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.text).to.include('Not Found');
        done();
      });
  });

  describe('error handler', function() {
    it('sends a default error response on error', (done) => {
      app.get('/error', (req, res) => {
        throw new Error('Error!');
      });
      app.listen(8888);

      request
        .get('/error')
        .end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.text).to.include('500');
          done();
        });
    });

    describe('in production', function() {
      beforeEach(() => process.env.NODE_ENV = 'production');

      it('sends a default error response on error', (done) => {
        app.get('/error', (req, res) => {
          throw new Error('Error!');
        });
        app.listen(8888);

        request
          .get('/error')
          .end((err, res) => {
            expect(res.status).to.equal(500);
            expect(res.text).to.include('500');
            done();
          });
      });
    });

    describe('configured', function() {
      beforeEach(() => {
        config.errorHandle = (err, req, res, next) => {
          res.end('error!');
        };
      });

      afterEach(() => delete config.errorHandle);

      it('uses the error handler on error', (done) => {
        app.get('/error', (req, res) => {
          throw new Error('Error!');
        });
        app.listen(8888);

        request
          .get('/error')
          .end((err, res) => {
            expect(res.status).to.equal(500);
            expect(res.text).to.include('error!');
            done();
          });
      });

      describe('in production', function() {
        beforeEach(() => process.env.NODE_ENV = 'production');

        it('sends a default error response on error', (done) => {
          app.get('/error', (req, res) => {
            throw new Error('Error!');
          });
          app.listen(8888);

          request
            .get('/error')
            .end((err, res) => {
              expect(res.status).to.equal(500);
              expect(res.text).to.include('error!');
              done();
            });
        });
      });
    });
  });

  describe('Router', function() {
    it('handles / hello world', (done) => {
      app.get('/', (req, res) => {
        res.end('hello world');
      });
      app.listen(8888);

      request
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

      request
        .get('/jack-black')
        .end((err, res) => {
          expect(res.text).to.equal('jack-black');
          done();
        });
    });

    it('handles regex validation for params', (done) => {
      app.get('/:name(uno|dos)', (req, res) => {
        res.end(req.params.name);
      });
      app.listen(8888);

      request
        .get('/uno')
        .end((err, res) => {
          expect(res.text).to.equal('uno');
          done();
        });
    });

    it('handles optional path segments', (done) => {
      app.get('/:uno/:dos?/:tres?/:quatro?', (req, res) => {
        res.end(JSON.stringify(req.params));
      });
      app.listen(8888);

      request
        .get('/library/articles/hello-world')
        .end((err, res) => {
          expect(res.text).to.equal('{"uno":"library","dos":"articles","tres":"hello-world"}');
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

      request
        .get('/articles/salvation/dylan')
        .end((err, res) => {
          expect(res.text).to.equal('articles about salvation by dylan');
        });

      request
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

        request
          .get('/library')
          .end((err, res) => {
            expect(res.text).to.equal('library index');
          });

        request
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

        request
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

      request
        .get('/number/dos')
        .end((err, res) => {
          expect(res.text).to.equal('dos');
        });

      request
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

      request
        .get('/google')
        .redirects(0)
        .then((res) => {
          expect(res).to.redirectTo('http://www.google.com');
          done();
        });
    });

    it('can render', (done) => {
      app.get('/', (req, res) => {
        res.render('test');
      });
      app.listen(8888);

      request
        .get('/')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text.trim()).to.equal('content foo block');
          done();
        });
    });
  });
});
