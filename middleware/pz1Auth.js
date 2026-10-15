// ПЗ1: имитация авторизации (?auth=1)
function pz1Auth(req, res, next) {
  if (req.query.auth === '1') {
    req.user = { name: 'Участник' };
    return next();
  }

  return res.redirect('/login');
}

module.exports = { pz1Auth };