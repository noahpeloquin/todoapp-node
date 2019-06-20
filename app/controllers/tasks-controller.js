

const { respondWithErrors, logError } = require('../utils/error-factory');
const { PERMISSIONS_ERROR, NOT_FOUND_ERROR } = require('../constants');
const _ = require('lodash');

const { Task } = require('../models/index');

const strongParams = ['body'];
const publicParams = ['id', 'url_path', 'body', 'author_id', 'updated_at', 'created_at'];

module.exports.filters = (req, res, next) => {
  // Filter that does nothing for future use if needed
  // Custom controller specific filters could be added here

  next();
};

// Create a new task
module.exports.create = async (req, res) => {
  try {
    let task = _.pick(req.body.task, strongParams);
    // console.log('in module export create task:');
    // console.dir(task);
    task.author_id = req.user.id;
    task.url_path = task.author_id + Date.now();

    task = await Task.create(task);
    // console.log('After creation task:');
    // console.dir(task);

    return res.json({
      task: _.pick(task, publicParams),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

// View a list of all tasks
module.exports.index = async (req, res) => {
  try {
    if (req.query.url_path) {
      const task = await Task.findOne({
        where: { url_path: req.query.url_path },
      });

      if (!task) {
        throw new Error(NOT_FOUND_ERROR);
      }

      return res.json({
        task: _.pick(task, publicParams),
      });
    }
    const tasks = await Task.findAll({});
    return res.json({
      tasks: _.map(tasks, task => _.pick(task, publicParams)),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

// Read a task
module.exports.show = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
    });

    if (!task) {
      throw new Error(NOT_FOUND_ERROR);
    }

    return res.json({
      task: _.pick(task, publicParams),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

// Update a task
module.exports.update = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
    });

    if (task.author_id !== req.user.id) {
      throw new Error(PERMISSIONS_ERROR);
    }

    Object.assign(task, _.pick(req.body.task, strongParams));

    if (req.body.task.url_path) {
      task.url_path = req.body.task.url_path.replace(/\s/g, '-');
    }

    await task.save();

    return res.json({
      task: _.pick(task, publicParams),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

// Delete a task
module.exports.destroy = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task.author_id !== req.user.id) {
      throw new Error(PERMISSIONS_ERROR);
    }

    await task.destroy();

    return res.json({
      deleted_id: req.params.id,
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

module.exports.tasksByUser = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        author_id: req.params.user_id,
      },
    });

    return res.json({
      tasks: _.map(tasks, task => _.pick(task, publicParams)),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};
