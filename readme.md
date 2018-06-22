# Dylan

## Middleware
A function that runs on any route and any method.

## Route
A string or regex pattern on a particular method type handled by a dylan instance or a function(s).

## Example
```
const dylan = require('dylan');
const static = require('@dylan/static');
const app = dylan();

app.use(/\/static.*/, static('public'));

app.get('/speak', (req, res) => {
  res.status('200').end('hi');
});

app.param('id', (req, res, next) => {
  if (accountExists(req.params.id)) {
    next();
  } else {
    res.sendStatus(404);
  }
});

app.get('/accounts/:id', (req, res) => {
  res.status('200').end(`Account "${req.params.id}"`);
});

app.get('/foo', preprehandle, prehandle, handle);

const subapp = dylan();
app.use('/docs', subapp);

app.listen(port);
```
