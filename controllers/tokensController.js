/*
 * Toke entity {
 *    Id : primary key
 *    Email : required
 *    Expires : required
 * }
 * */

 const { statusCode, emailRegex } = require('../lib/commons');
 const { constructValidResponse, constructInvalidResponse, hashString, makeRandomString } = require('../lib/helpers');
 const repository = require('../lib/repository');
 const userRepository = repository('user');
 const tokenRepository = repository('token');

const getId = (str) => {
    return (typeof str === 'string' && str.length === 16) ? str : false;
}

const getValidEmail = (str) => {
    return (typeof str === 'string' && str.length > 0 && emailRegex.test(str)) ? str : false;
}

const getHashPassword = (str) => {
    return (typeof str === 'string' && str.length > 0) ? hashString(str) : false;
}

const constructError = (statusCode, message) => {
  return {statusCode : statusCode, message :  message};
}

const handleError = (e, elementNotFound) => {
    switch (e.code) {
        case 'EEXIST':
          return constructInvalidResponse(statusCode.badRequest, 'Token already exists');
        case 'ENOENT':
            return constructInvalidResponse(statusCode.notFound, `${elementNotFound} not found`);
        case 'EACCES':                  
        case 'EISDIR':
          return constructInvalidResponse(statusCode.internalError, 'Internal server error');
        default:
          return constructInvalidResponse(statusCode.badRequest, e.message);
    }
}

const tokenPost = async ({payload}) => {
    const email = getValidEmail(payload.email);
    const hashPassword = getHashPassword(payload.password);

    if (email && hashPassword) {
        try {
            const user = await userRepository.read(email);
            if (user.email === email && user.password === hashPassword) {

              const tokenId = makeRandomString(16);
              const token = {id: tokenId, email: email, expires: Date.now() + 1000 * 60 * 60 * 24};
              await tokenRepository.create(tokenId, token);
      
              return constructValidResponse(statusCode.ok, token);
            } 
            else {
              return constructInvalidResponse(statusCode.badRequest, 'wrong email or password');
            }
        }
        catch (e){
            return handleError(e, 'User');
        }
    }
    else {
        return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    } 
};

const tokenPut = async ({ payload, queryString }) => {
    const id = typeof payload.id === 'undefined' ? getId(queryString.id) : false;
    const expires = (typeof payload.expires === 'number' && payload.expires.length > 0) ? payload.expires : false;
    if (id && expires) {
      try {
        const token = await tokenRepository.read(id);
        token.expires = expires || token.expires;
  
        await tokenRepository.update(id, token);
        return constructValidResponse(statusCode.ok, token);
      } 
      catch (e) {
        handleError(e, 'Token')
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

const tokenDelete = async ({ queryString }) => {
    const id = getId(queryString.id);
    if (id) {
      try {
        await tokenRepository.remove(id);
        return constructValidResponse(statusCode.ok);
      } 
      catch (e) {
        return handleError(e, 'Token');
      }
    } else {
      return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
  };

const tokenGet = async ({ queryString }) => {
    const id = getId(queryString.id);
    if (id) {
      try {
        const tokenData = await tokenRepository.read(id);
        return constructValidResponse(statusCode.ok, tokenData);
      } 
      catch (e) {
        return handleError(e, 'Token');
      }
    } 
    else {
      return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
  };

  const tokenVerify = async (tokenId, email) => {
    const id = getId(tokenId);
    const validEmail = getValidEmail(email);
    if (id && validEmail) {
      try {
        const token = await tokenRepository.read(id);
        if (token.email === validEmail && token.expires > Date.now()) {
          return true;
        } 
        else if (token.email !== validEmail) {
          throw constructError(statusCode.forbidden, 'Unauthorized access');
        } 
        else {
          throw constructError(statusCode.forbidden, 'Token has expired');
        }
      } 
      catch (e) {
        switch (e.code) {
          case 'EEXIST':
            throw constructError(statusCode.badRequest, 'Token already exists');
          case 'ENOENT':
            throw constructError(statusCode.notFound, 'Token not found');
          case 'EACCES':                  
          case 'EISDIR':
            throw constructError(statusCode.internalError, 'Internal server error');
          default:
            throw constructError(e.statusCode || statusCode.badRequest, e.message);
        } 
      }
    } 
    else {
      throw new Error('Unauthorized access', statusCode.forbidden);
    }
  };

module.exports = {
    get: tokenGet,
    post: tokenPost,
    put: tokenPut,
    delete: tokenDelete,
    verify: tokenVerify
  };