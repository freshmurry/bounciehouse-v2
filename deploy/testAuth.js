// Simple Node script to test auth endpoints on the running dev server.
(async () => {
  try {
  // Call the mock API directly on port 8787
  const loginRes = await fetch('http://localhost:8787/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dev@local', password: 'pass' })
    });
    const loginBody = await loginRes.text();
    console.log('LOGIN STATUS', loginRes.status);
    console.log('LOGIN BODY', loginBody);

    if (!loginRes.ok) process.exit(1);
    const parsed = JSON.parse(loginBody);
    const token = parsed.token;

  const meRes = await fetch('http://localhost:8787/api/auth/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meBody = await meRes.text();
    console.log('ME STATUS', meRes.status);
    console.log('ME BODY', meBody);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
