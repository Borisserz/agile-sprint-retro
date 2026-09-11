// ПЗ1: логирующее middleware — метод, URL и время каждого запроса
function pz1Logger(req, res, next) {
  const when = new Date().toISOString();
  console.log(`[ПЗ1] ${when} ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = { pz1Logger };
