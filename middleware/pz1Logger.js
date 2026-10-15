// ПЗ1: логирование метода, URL и времени
function pz1Logger(req, res, next) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = { pz1Logger };
