/*
 * No carts entity, append as a property to user entity
 * 
 * */

const { statusCode } = require('../lib/commons');
const { constructValidResponse, constructInvalidResponse } = require('../lib/helpers');
const repository = require('../lib/repository');
const userRepository = repository('user');
const menuRepository = repository('menu');
const tokenRepository = repository('token');
const { verify } = require('./tokensController');

const getValidTokenId = (str) => {
    return (typeof str === 'string' && str.length === 16) ? str : false;
}

const getValidItemId = (str) => {
    return (typeof str === 'string' && str.length === 16) ? str : false;
}

const getValidCount = (nbr) => {
  return (typeof nbr === 'number' && nbr > 0) ? nbr : false;
}

const handleError = (e, elementNotFound) => {
  switch (e.code) {
    case 'ENOENT':
      return constructInvalidResponse(statusCode.notFound, `${elementNotFound} not found`);
    case 'EACCES':                  
    case 'EISDIR':
      return constructInvalidResponse(statusCode.internalError, 'Internal server error');
    default:
      return constructInvalidResponse(e.statusCode || statusCode.badRequest, e.message);
  }
}

const cartPost = async ({ payload, headers }) => {
    const tokenId = getValidTokenId(headers.tokenid);
    const itemId = getValidItemId(payload.itemId);
    const count = getValidCount(payload.count);

    if (itemId && tokenId) {
      try {
        const token = await tokenRepository.read(tokenId);
        await verify(tokenId, token.email);
  
        await menuRepository.read(itemId);
        const user = await userRepository.read(token.email);
        const items = user.cartItems instanceof Array && user.cartItems.length > 0 ? [...user.cartItems] : [];

        items.push({itemId, count});

        const updatedUser = {...user, cartItems: items};
        await userRepository.update(token.email, updatedUser);
        delete updatedUser.password;
  
        return constructValidResponse(statusCode.ok, updatedUser);
      } 
      catch (e) {
        return handleError(e, 'Item');
      }
    } 
    else {
      return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
  };

const cartPut = async ({payload, queryString, headers}) => {
  const tokenId = getValidTokenId(headers.tokenid);
  const itemId = getValidItemId(queryString.itemId);
  const count = getValidCount(payload.count);

  if (itemId && tokenId) {
    try {
      const token = await tokenRepository.read(tokenId);
      await verify(tokenId, token.email);

      await menuRepository.read(itemId);
      const user = await userRepository.read(token.email);
      const items = user.cartItems instanceof Array && user.cartItems.length > 0 ? [...user.cartItems] : [];

      let itemUpdated = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].itemId == itemId) {
          if (count > 0)
            items[i].count = count;
          else
            items.splice(i, 1);

          itemUpdated = true;
          break;
        }
      }

      if (itemUpdated) { 
        const updatedUser = {...user, cartItems: items};
        await userRepository.update(token.email, updatedUser);
        delete updatedUser.password;

        return constructValidResponse(statusCode.ok, updatedUser);
      }
      else {
        return constructInvalidResponse(statusCode.notFound, 'Cart item not found');
      }
    } 
    catch (e) {
      return handleError(e, 'Item');
    }
  } 
  else {
    return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
  }
};

const cartDelete = async ({ queryString, headers }) => {
  const itemId = getValidTokenId(queryString.itemId);
  const tokenId = getValidTokenId(headers.tokenid);

  if (itemId && tokenId) {
    try {
      const token = await tokenRepository.read(tokenId);
      await verify(tokenId, token.email);

      await menuRepository.read(itemId);
      const user = await userRepository.read(token.email);
      const items = user.cartItems instanceof Array && user.cartItems.length > 0 ? [...user.cartItems] : [];

      let itemUpdated = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].itemId == itemId) {
          items.splice(i, 1);
          itemUpdated = true;
          break;
        }
      }

      if (itemUpdated) {
        const updatedUser = {...user, cartItems: items};
        await userRepository.update(token.email, updatedUser);
        delete updatedUser.password;

        return constructValidResponse(statusCode.ok, updatedUser);
      } 
      else {
        return constructInvalidResponse(statusCode.notFound, 'Cart item not found');
      }
    } 
    catch (e) {
      return handleError(e, 'User');
    }
  } 
  else if (!tokenId) {
    return constructInvalidResponse(statusCode.forbidden, 'Unauthorized access');
  } 
  else {
    return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
  }
};

const cartGet = async ({ headers }) => {
  const tokenId = getValidTokenId(headers.tokenid);

  if (tokenId) {
    try {
      const token = await tokenRepository.read(tokenId);
      await verify(tokenId, token.email);
      
      const user = await userRepository.read(token.email);
      const cartItems = user.cartItems instanceof Array && user.cartItems.length > 0 ? [...user.cartItems] : [];

      const itemList = await Promise.all(cartItems.map(item => menuRepository.read(item.itemId)));
      return constructValidResponse(statusCode.ok, itemList);
    } 
    catch (e) {
      return handleError(e, 'Item');
    }
  } 
  else {
    return constructInvalidResponse(statusCode.forbidden, 'Unauthorized access');
  }
};

module.exports = {
    get: cartGet,
    post: cartPost,
    put: cartPut,
    delete: cartDelete
};