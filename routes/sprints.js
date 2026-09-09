const express = require('express');
const controller = require('../controllers/sprintsController');

const router = express.Router();

router.all('/', (req, res, next) => {
  if (req.method === 'QUERY') {
    return controller.search(req, res, next);
  }
  next();
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
