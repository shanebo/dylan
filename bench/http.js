const http = require('http');
const hostname = '127.0.0.1';
const port = 3100;
const server = http.createServer((req, res) => {
  req.one = true;
  req.two = true;
  if (req.url === '/favicon.ico') return res.end('favicon.ico');
  if (req.url === '/') return res.end('hello world');
  if (req.url === '/user/123') return res.end('User 123');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
