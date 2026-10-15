const fs = require('fs');
const path = require('path');

// ПЗ1 (нечётный вариант): лог запросов в файл
const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'pz1-requests.log');

function ensureLogFile() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '', 'utf8');
  }
}

function pz1Logger(req, res, next) {
  const line = `${new Date().toISOString()} ${req.method} ${req.originalUrl}\n`;

  try {
    ensureLogFile();
    fs.appendFileSync(logFile, line, 'utf8');
  } catch (err) {
    return next({
      status: 500,
      message: 'Не удалось записать лог запроса в файл',
    });
  }

  console.log(line.trim());
  next();
}

module.exports = { pz1Logger };
