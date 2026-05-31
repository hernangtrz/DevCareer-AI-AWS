const http = require('http');
const port = 8080;
// Reemplaza esta URL con la DNS pública de tu ALB de frontend si reinicias el lab
const targetHost = 'devcareer-dev-alb-ext-1559258728.us-east-1.elb.amazonaws.com';

http.createServer((req, res) => {
  const options = {
    hostname: targetHost,
    port: 80,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: targetHost }
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  req.pipe(proxyReq, { end: true });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    res.writeHead(502);
    res.end('Bad Gateway');
  });
}).listen(port, () => {
  console.log(`Proxy server listening on port ${port} and forwarding to ${targetHost}`);
});
