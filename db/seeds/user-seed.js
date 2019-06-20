

const { User } = require('../../app/models');

// User seeds
User.destroy({ where: {} })
  .then(() => User.bulkCreate([
    {
      id: '1',
      name: 'Bruce Wayne',
      email: 'test@test.com',
      username: 'brucewayne',
      password: 'testtest',
    },
    {
      id: '2',
      name: 'Kyle Townsbeginning',
      username: 'kylebegin',
      email: 'kyle@begin.com',
      password: 'testtest',
    },
    {
      id: '3',
      name: 'King Bobby',
      username: 'kingbobby',
      email: 'bobby@googly.com',
      password: 'testtest',
    },
  ]))
  .then((data) => {
    console.log(`Inserted ${data.length} User records`);
  });
