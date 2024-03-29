const { resolve } = require('path');
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
        templates: {
           [resolve('test/template')]: '{{block foo}}{{exists override}}{{override}}{{else}}foo{{end}}{{endblock}}content {{foo}}',
        },
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

    it('handles explicit optional path segments', (done) => {
      app.get('/:uno(/:dos)?(/:tres)?', (req, res) => {
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

    it('handles prefixed optional path segments', (done) => {
      app.get('/:type(/about/:topic?)?(/on/:scripture)?(/by/:author)?(/from/:year)?(/sorted/:sort)?', (req, res) => {
        res.end(JSON.stringify(req.params));
      });
      app.listen(8888);

      request
        .get('/resources/about/on/romans/by/spurgeon/from/1919/sorted/newest')
        .end((err, res) => {
          expect(res.text).to.equal('{"type":"resources","scripture":"romans","author":"spurgeon","year":"1919","sort":"newest"}');
          done();
        });
    });

    it('provides null querystring', (done) => {
      app.get('/querystring', (req, res) => {
        res.end(JSON.stringify(req.querystring));
      });
      app.listen(8888);

      request
        .get('/querystring')
        .end((err, res) => {
          expect(res.text).to.equal('null');
          done();
        });
    });

    it('provides querystring', (done) => {
      app.get('/querystring', (req, res) => {
        res.end(req.querystring);
      });
      app.listen(8888);

      request
        .get('/querystring?foo=boo')
        .end((err, res) => {
          expect(res.text).to.equal('foo=boo');
          done();
        });
    });

    it('provides empty query object', (done) => {
      app.get('/query', (req, res) => {
        res.end(JSON.stringify(req.query));
      });
      app.listen(8888);

      request
        .get('/query')
        .end((err, res) => {
          expect(res.text).to.equal('{}');
          done();
        });
    });

    it('provides query object', (done) => {
      app.get('/query', (req, res) => {
        res.end(JSON.stringify(req.query));
      });
      app.listen(8888);

      request
        .get('/query?foo=boo&nacho=libre')
        .end((err, res) => {
          expect(res.text).to.equal('{"foo":"boo","nacho":"libre"}');
          done();
        });
    });

    it('provides query clean of empty params', (done) => {
      app.get('/query', (req, res) => {
        res.end(JSON.stringify(req.query));
      });
      app.listen(8888);

      request
        .get('/query?foo=&yo=')
        .end((err, res) => {
          expect(res.text).to.equal('{}');
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

    it('can render relative paths', (done) => {
      app.get('/', (req, res) => {
        res.render('template');
      });
      app.listen(8888);

      request
        .get('/')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text.trim()).to.equal('content foo');
          done();
        });
    });

    it('can render tilde paths', (done) => {
      app.get('/', (req, res) => {
        res.render('~/template');
      });
      app.listen(8888);

      request
        .get('/')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text.trim()).to.equal('content foo');
          done();
        });
    });

    it('can render with data', (done) => {
      app.get('/', (req, res) => {
        res.render('~/template', { override: 'overridden' });
      });
      app.listen(8888);

      request
        .get('/')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text.trim()).to.equal('content overridden');
          done();
        });
    });
  });
});
