const commons = require('./commons');
const usersController = require('../controllers/usersController');
const tokensController = require('../controllers/tokensController');
const menusController = require('../controllers/menusController');
const cartsController = require('../controllers/cartsController');
const ordersController = require('../controllers/ordersController');

const handlers = [
  {
    path: 'carts',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'menus',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'orders',
    methods: ['get', 'post']
  },
  {
    path: 'tokens',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'users',
    methods: ['get', 'post', 'put', 'delete']
  }
];

const controllers = {
  'carts': cartsController,
  'menus': menusController,
  'orders': ordersController,
  'tokens': tokensController,
  'users': usersController
};

const route = async (data) =>
{
    console.log(`Received request for path ${data.path} and method ${data.method}`);
    const controller = isValidHandlers(data.path, data.method) ? controllers[data.path] : false;

    return controller ? await controller[data.method](data) :
    {
      statusCode: isValidPath(data.path) ? commons.statusCode.methodeNotAllowed : commons.statusCode.notFound,
      payload: isValidPath(data.path) ? {'Error' : 'Method not allowed'} : {'Error' : 'Route is invalid'},
    };
}

function isValidHandlers(path, method)
{
    return handlers.map(r => r.path).includes(path) && handlers.find(r => r.path === path).methods.includes(method);
}

function isValidPath(path)
{
    return handlers.map(r => r.path).includes(path);
}

module.exports = {
    route: route
};