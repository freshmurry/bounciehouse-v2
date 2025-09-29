import http from 'http';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 8787,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8787,
      path,
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const login = await post('/api/auth/login', { email: 'dev@local', password: 'pass' });
    console.log('LOGIN', login.status, login.body);
    if (login.status === 200) {
      const token = JSON.parse(login.body).token;
      const me = await get('/api/auth/me', token);
      console.log('ME', me.status, me.body);
    }
  } catch (e) {
    console.error('ERR', e);
  }
})();
