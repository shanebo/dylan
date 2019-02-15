# Dylan

## Middleware
A function that runs on any route and any method.

## Route
A string or regex pattern on a particular method type or any method type that is handled by a dylan instance or a function(s).


app.get(/\/static.*/, static('public'));
app.get('/foo', handle, handle, handle);
app.all(/\/static.*/, static('public'));
app.all(/\/static.*/, handle, handle, handle);


app.mount(pattern, handle);
app.mount('/static', static('public'));
app.mount('/foo', dylaninstance);


app.use(fn);
app.use('/solidjoys', subapp);
app.use('/static', static('public'));


1. accept patterns that are regexes in routes
2. add an 'all' type of route method
3. conditional inside of mount that figures out if it's a dylan app or function





app.get('/foo', handle, handle, handle);

app.use('/static', (req, res, next => {
  res.set('custom-header', value);
  next();
});
app.use('/static', static('public'));


app.all('/static', prehandle, static('public'));



app.get('/foo', handle, handle, handle);
app.use('/user/:id', fn);
app.use('/solidjoys', subapp);
app.use('/static', static('public'));




app.get('/foo', handle, handle, handle);

wares: [ware, ware, subapp]
routes: {
  GET: {
    f: [{
      pattern: '/foo',
      handles: [handle, handle, handle]
    }]
  }
}
