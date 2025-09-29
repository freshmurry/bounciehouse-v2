import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.post('/api/functions/:fn', (req, res) => {
  res.json({ ok: true, function: req.params.fn, args: req.body });
});

app.post('/api/entities/:entity/:method', (req, res) => {
  res.json({ ok: true, entity: req.params.entity, method: req.params.method, body: req.body });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email && password) {
    const token = `devtoken:${email}`;
    return res.json({ token, user: { email, name: 'Dev User' } });
  }
  res.status(401).send('Invalid credentials');
});

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth) return res.json(null);
  const parts = auth.replace('Bearer ', '').split(':');
  const email = parts[1] || 'dev@example.com';
  res.json({ email, name: 'Dev User' });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log('Mock API server listening on port', port);
});
