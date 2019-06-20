# todoapp-node
For this task, keep it simple but make it look good.

This just needs to be an extremely basic todo list app where a user can log in and (add edit and delete) todolist items. It doesn't need to be more complex than that.

A to-do list API written in NodeJS and REST.

### Authentication

Authentication is handled via JWT and an XSRF Token. Analyzing in postman should suffice. You will need to make sure you have the 'Interceptor' extension installed since the JWT is being sent via a cookie.

## Validations

**Validations are done using these libraries**

- [Joi](https://github.com/hapijs/joi/blob/v10.4.1/API.md) - The library actually doing the validations
- [Joi-Sequlize](https://github.com/mibrito/joi-sequelize) - This automates most of the validations by automatically setting up joi validations from sequelize models. This is all handled in the app/models/index.js file. This is great for those validations that aren't complex.
- [Express Validation](https://github.com/andrewkeig/express-validation) - Allows us to attach the validations to requests

## Deployment

Be sure to update the whitelist in index.js for staging and review environments.

Details on this will vary from project to project
