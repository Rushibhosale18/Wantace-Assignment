function requireOwnerAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Owner Panel"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const auth = Buffer.from(authHeader.split(' ')[1] || '', 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  const adminUser = process.env.ADMIN_USERNAME || 'rushi18';
  const adminPass = process.env.ADMIN_PASSWORD || 'Rushi@18';

  if (user === adminUser && pass === adminPass) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Owner Panel"');
  return res.status(401).json({ error: 'Invalid credentials' });
}

module.exports = { requireOwnerAuth };
