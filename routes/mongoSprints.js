const express = require('express');
const controller = require('../controllers/mongoSprintsController');

const router = express.Router();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.post('/:id/action-items', controller.addActionItem);
router.patch('/:id/action-items/:itemId', controller.updateActionItem);
router.delete('/:id/action-items/:itemId', controller.removeActionItem);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
