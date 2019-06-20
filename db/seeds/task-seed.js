

const { Task } = require('../../app/models');

// User seeds
Task.destroy({ where: {} })
  .then(() => Task.bulkCreate([
    {
      id: 1,
      url_path: 'my-name-is-noah',
      body: 'Finish this task app.',
      author_id: 1,
    },
    {
      id: 2,
      url_path: 'basketball_classes',
      body: 'Class one is the jump shot. Class two is the slam.',
      author_id: 2,
    },
  ]))
  .then((data) => {
    console.log(`Inserted ${data.length} Task records`);
  });
