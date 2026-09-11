// ПЗ2: монтирование трёх REST-ресурсов на /api/*
const { sprints, actionItems, retrospectives } = require('../data/pz2Store');
const { createCrudRouter } = require('./pz2Crud');
const v = require('./pz2Validators');

function mountPz2Api(app) {
  app.use(
    '/api/sprints',
    createCrudRouter(sprints, {
      validateCreate: v.validateSprintCreate,
      validateReplace: v.validateSprintReplace,
      validatePatch: v.validateSprintPatch,
      // доп. операция: фильтр ?status=planned|active|done
      filterList(rows, query) {
        if (!query.status) return rows;
        return rows.filter((row) => row.status === String(query.status));
      },
    }),
  );

  app.use(
    '/api/action-items',
    createCrudRouter(actionItems, {
      validateCreate: v.validateActionCreate,
      validateReplace: v.validateActionReplace,
      validatePatch: v.validateActionPatch,
      filterList(rows, query) {
        if (!query.sprintId) return rows;
        return rows.filter((row) => row.sprintId === Number(query.sprintId));
      },
    }),
  );

  app.use(
    '/api/retrospectives',
    createCrudRouter(retrospectives, {
      validateCreate: v.validateRetroCreate,
      validateReplace: v.validateRetroReplace,
      validatePatch: v.validateRetroPatch,
      filterList(rows, query) {
        if (!query.sprintId) return rows;
        return rows.filter((row) => row.sprintId === Number(query.sprintId));
      },
    }),
  );
}

module.exports = { mountPz2Api };
