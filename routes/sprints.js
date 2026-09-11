const express = require('express');
const controller = require('../controllers/sprintsController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.all('/', (req, res, next) => {
  if (req.method === 'QUERY') {
    return controller.search(req, res, next);
  }
  next();
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, requireRole('facilitator'), controller.remove);

module.exports = router;
