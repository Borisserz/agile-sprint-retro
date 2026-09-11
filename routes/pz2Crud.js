// ПЗ2: фабрика CRUD-роутера (GET list/id, POST, PUT, PATCH, DELETE)
const express = require('express');

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function createCrudRouter(collection, { validateCreate, validateReplace, validatePatch, filterList }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    let rows = collection.list();
    if (filterList) rows = filterList(rows, req.query);
    res.status(200).json(rows);
  });

  router.get('/:id', (req, res) => {
    const row = collection.get(req.params.id);
    if (!row) return sendError(res, 404, 'Not found');
    res.status(200).json(row);
  });

  router.post('/', (req, res) => {
    const parsed = validateCreate(req.body);
    if (parsed.error) return sendError(res, 400, parsed.error);
    const row = collection.create(parsed.data);
    res.status(201).json(row);
  });

  router.put('/:id', (req, res) => {
    if (!collection.get(req.params.id)) return sendError(res, 404, 'Not found');
    const parsed = validateReplace(req.body);
    if (parsed.error) return sendError(res, 400, parsed.error);
    const row = collection.replace(req.params.id, parsed.data);
    res.status(200).json(row);
  });

  router.patch('/:id', (req, res) => {
    if (!collection.get(req.params.id)) return sendError(res, 404, 'Not found');
    const parsed = validatePatch(req.body);
    if (parsed.error) return sendError(res, 400, parsed.error);
    const row = collection.patch(req.params.id, parsed.data);
    res.status(200).json(row);
  });

  router.delete('/:id', (req, res) => {
    const ok = collection.remove(req.params.id);
    if (!ok) return sendError(res, 404, 'Not found');
    res.status(204).send();
  });

  return router;
}

module.exports = { createCrudRouter, sendError };
