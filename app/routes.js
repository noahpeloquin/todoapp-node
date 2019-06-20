const express = require('express');

const router = express.Router();
const passport = require('passport');
const xsrfMiddleware = require('./middlewares/xsrf');
const spamMiddleware = require('./middlewares/spam');
const usersController = require('./controllers/users-controller');
const tasksController = require('./controllers/tasks-controller');
const { validators } = require('./models');
const validate = require('express-validation');
const Joi = require('joi');

/**
 ** NOTES:
 ** Order of routes is very important. Don't forget this...
 * */

/**
 ** AUTH MIDDLEWARES
 * */
router.use(spamMiddleware);
router.use(xsrfMiddleware);
router.use(passport.initialize());

/**
 ** PASSPORT STRATEGIES
 ** Currently we are just using the JWT strategy but
 ** Facebook, Twitter strategies, etc could be added. We'd need to
 ** use something like redis for stateful strategies (anything that
 ** is not JWT) if we were scaling across multiple nodes.
 * */
require('./passport-strategies/jwt')(passport);

/**
 ** AUTHENTICATION
 * */

// Because JWT is stateless, we need to check for the JWT before every blockUnauthorized call.
// We may not need the block-unauthorized-user function at all because
// we use the JWT authentication on every endpoint. But let's leave it
// just in case
const blockUnauthorizedUser = [
  passport.authenticate('jwt', { session: false }),
  require('./middlewares/block-unauthorized-user'),
];

/**
 ** GENERAL
 * */
// Validators
const idValidator = {
  id: Joi.number()
    .integer()
    .min(1)
    .required(),
};

// Routes
router.route('/sign-in').post(usersController.authenticate);
router.route('/sign-out').post(usersController.unauthenticate);

/**
 ** USERS
 * */
// Validators
const userValidator = require('./request-validators/user-validator');

router
  .route('/users/me')
  .all(blockUnauthorizedUser)
  .get(usersController.me);

// Normal REST routes. This must come after all the above to make sure /users/me is rendered
// instead of looking at /users/:id
router.route('/users').post(
  validate({
    body: userValidator.requiredKeys([
      'user',
      'user.name',
      'user.email',
      'user.password',
      'user.username',
    ]),
  }),
  usersController.create,
);

router.route('/users').get(usersController.index);

router.route('/users/:user_id/posts').get(tasksController.tasksByUser);

router
  .route('/users/:id')
  .all(validate({ params: idValidator }))
  .get(usersController.show);

router
  .route('/users/:id')
  .all(blockUnauthorizedUser, validate({ params: idValidator }))
  .put(validate({ body: userValidator }), usersController.update)
  .delete(usersController.destroy);

/**
 ** POSTS
 * */
// Validators
const tasksValidator = Joi.object({ task: validators.Task.joi() });

// Routes

router
  .route('/tasks')
  .all(blockUnauthorizedUser)
  .get(tasksController.index);

router
  .route('/tasks')
  .all(blockUnauthorizedUser)
  .post(
    validate({
      body: tasksValidator.requiredKeys(['task', 'task.body']),
    }),
    tasksController.create,
  );

router
  .route('/posts/:id')
  .all(validate({ params: idValidator }))
  .get(tasksController.show);

router
  .route('/posts/:id')
  .all(blockUnauthorizedUser, validate({ params: idValidator }))
  .put(validate({ body: tasksValidator }), tasksController.update)
  .delete(tasksController.destroy);

module.exports = router;
