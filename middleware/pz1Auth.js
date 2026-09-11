// ПЗ1: имитация авторизации — без ?auth=1 редирект на /login (только SSR-маршруты)
function pz1Auth(req, res, next) {
  if (req.path === '/login') {
    req.user = { name: 'Гость' };
    return next();
  }

  if (req.query.auth === '1') {
    req.user = { name: 'Участник' };
    return next();
  }

  return res.redirect('/login');
}

module.exports = { pz1Auth };
