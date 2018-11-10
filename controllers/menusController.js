
const { statusCode } = require('../lib/commons');
const { constructValidResponse, constructInvalidResponse, makeRandomString } = require('../lib/helpers');
const repository = require('../lib/repository');
const menuRepository = repository('menu');
const userRepository = repository('user');

const getValidItemId = (str) => {
    return (typeof str === 'string' && str.length === 16) ? str : false;
}

const getValidName = (str) => {
    return (typeof str === 'string' && str.length > 0) ? str : false;
}

const getValidPrice = (nbr) => {
    return (typeof nbr === 'number' && nbr > 0) ? nbr : false;
}

const handleError = (e) => {
    switch (e.code) {
        case 'ENOENT':
            return constructInvalidResponse(statusCode.notFound, 'Menu item not found');
        case 'EACCES':                  
        case 'EISDIR':
          return constructInvalidResponse(statusCode.internalError, 'Internal server error');
        default:
          return constructInvalidResponse(statusCode.badRequest, e.message);
    }
}

const deleteItemFromExistingCarItem = async (id) => {
    const userList = await userRepository.list();
    const filteredUserList = userList.filter(user => user.cartItems != null && user.cartItems.find(itemId => itemId === id));

    await Promise.all(filteredUserList.map(user => {
      const cartItems = user.cartItems.filter(item => item !== id);
      return userRepository.update(user.email, {...user, cartItems})
    }));
}

const menuPost = async ({ payload }) => {
    const name = getValidName(payload.name);
    const price = getValidPrice(payload.price);

    if (name && price) {
      try {
        const id = makeRandomString(16);
        const menuItem = {id, name, price};
        await menuRepository.create(id, menuItem);
  
        return constructValidResponse(statusCode.ok, menuItem);
      } 
      catch (e) {
        return handleError(e);
      }
    } 
    else {
      return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
};

const menuPut = async ({ payload, queryString }) => {
    const id = typeof payload.id === 'undefined' ? getValidItemId(queryString.id) : false;
    const price = getValidName(payload.price);
    const name = getValidPrice(payload.name);

    if (id && (price || name)) {
      try {
        const menuItem = await menuRepository.read(id);
        menuItem.price = price || menuItem.price;
        menuItem.name = name || menuItem.name;
  
        await menuRepository.update(id, menuItem);
  
        return constructValidResponse(statusCode.ok, menuItem);
      } 
      catch (e) {
          return handleError(e);
      }
    } 
    else if (!id && payload.id){
      return constructInvalidResponse(statusCode.badRequest, 'id cannot be updated');
    } 
    else if (!id) {
      return constructInvalidResponse(statusCode.badRequest, 'id in querystring is required');
    } 
    else {
      return constructInvalidResponse(statusCode.badRequest, 'Nothing to update');
    }
  };

const menuDelete = async ({ queryString }) => {
    const id = getValidItemId(queryString.id);
    if (id) {
      try {
        await menuRepository.delete(id);
        await deleteItemFromExistingCarItem();
  
        return constructValidResponse(statusCode.ok, {});
      } 
      catch (e) {
        return handleError(e);
      }
    } 
    else {
      return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
  };

const getItem = async (id) => {
    try {
        const item = await menuRepository.read(id);
        return constructValidResponse(statusCode.ok, item);
    } 
    catch (e) {
        return handleError(e);
    }
}

const getItemList = async({ queryString }) => {
    try {
        const items = await menuRepository.list();

        const name = getValidName(queryString.name);
        const price = getValidPrice(queryString.price);

        return constructValidResponse(statusCode.ok, items.filter(item => {
          return name
            ? price
              ? item.name === name && item.price === price
              : item.name === name
            : price
              ?  item.price === price
              : true
        }));
      } 
      catch (e) {
        return handleError(e);
      }
}

const menuGet = async ({ queryString }) => {
    const id = getValidItemId(queryString.id);
    
    if (id) {
        return getItem(id);
    } 
    else {
        return getItemList({queryString});
    }
};

module.exports = {
    get: menuGet,
    post: menuPost,
    put: menuPut,
    delete: menuDelete
};