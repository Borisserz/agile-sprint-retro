// ПЗ1: метод, URL и время запроса в консоль.
function pz1Logger(req, res, next) {
  const stamp = new Date().toISOString();
  console.log(`${stamp} ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = { pz1Logger };
