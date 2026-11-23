const express = require('express');
const controller = require('../controllers/mongoSprintsController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.getAll);
router.post('/', authenticate, controller.create);
router.post('/:id/action-items', authenticate, controller.addActionItem);
router.patch('/:id/action-items/:itemId', authenticate, controller.updateActionItem);
router.delete(
  '/:id/action-items/:itemId',
  authenticate,
  requireRole('facilitator'),
  controller.removeActionItem,
);
router.get('/:id', controller.getById);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, requireRole('facilitator'), controller.remove);

module.exports = router;
