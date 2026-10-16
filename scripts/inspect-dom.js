const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const target = list.find(t => t.url && t.url.includes('127.0.0.1:3000'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            Array.from(document.querySelectorAll('*')).filter(e => {
              return e.innerText && ['Home', 'Explore', 'Create', 'Activity', 'Profile'].includes(e.innerText.trim());
            }).map(e => ({
              tag: e.tagName,
              role: e.getAttribute('role'),
              text: e.innerText.trim(),
              cls: e.className,
              rect: e.getBoundingClientRect()
            }))
          `,
          returnByValue: true
        }
      }));
    });
    ws.on('message', m => {
      const msg = JSON.parse(m);
      if (msg.id === 1) {
        console.log(JSON.stringify(msg.result.value, null, 2));
        ws.close();
      }
    });
  });
});
