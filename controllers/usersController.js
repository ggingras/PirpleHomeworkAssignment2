/*
 * User entity {
 *    Email : primary key
 *    Address : required
 *    password : required and hash for security
 *    name : required
 * }
 * */

const { statusCode, emailRegex } = require('../lib/commons');
const { constructValidResponse, constructInvalidResponse, hashString } = require('../lib/helpers');
const repository = require('../lib/repository');
const userRepository = repository('user');
const { verify } = require('./tokensController');

const getValidEmail = (str) => {
    return (typeof str === 'string' && str.length > 0 && emailRegex.test(str)) ? str : false;
}

const getValidAddress = (str) => {
    return (typeof str === 'string' && str.length > 0) ? str : false;
}

const getValidName = (str) => {
    return (typeof str === 'string' && str.length > 0) ? str : false;
}

const getHashPassword = (str) => {
    return (typeof str === 'string' && str.length > 0) ? hashString(str) : false;
}

const getValidTokenId = (str) => {
    return (typeof str === 'string' && str.length === 16) ? str : false;
}

const handleError = (e) => {
    switch (e.code) {
        case 'EEXIST':
          return constructInvalidResponse(statusCode.badRequest, 'User already exists');
        case 'ENOENT':
            return constructInvalidResponse(statusCode.notFound, 'User not found');
        case 'EACCES':                  
        case 'EISDIR':
          return constructInvalidResponse(statusCode.internalError, 'Internal server error');
        default:
          return constructInvalidResponse(e.statusCode || statusCode.badRequest, e.message);
    }
}

const postUser = async ({payload}) => {
    const email = getValidEmail(payload.email);
    const address = getValidAddress(payload.address);
    const hashPassword = getHashPassword(payload.password);
    const name = getValidName(payload.name);

    if (email && address && name && hashPassword) {
        try{
            const user = {
                email : email,
                address : address,
                name : name,
                password : hashPassword
            };
            
            await userRepository.create(email, user);

            delete user.password;

            return constructValidResponse(statusCode.ok, user); 
        }
        catch (e){
            return handleError(e);
        }
    }
    else {
        return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
};

const userPut = async ({ payload, queryString, headers }) => {
    const address = getValidAddress(payload.address);
    const hashPassword = getHashPassword(payload.password);
    const name = getValidName(payload.name);
    const email = typeof payload.email === 'undefined' ? getValidEmail(queryString.email) : false;
    const tokenId = getValidTokenId(headers.tokenid);

    if (email && address && name && hashPassword && tokenId) {
        
        try{
            await verify(tokenId, email);

            const user = {
                email : email,
                address : address,
                name : name,
                password : hashPassword
            };

            await userRepository.update(email, user);

            delete user.password;

            return constructValidResponse(statusCode.ok, user);
        }
        catch (e) {
            return handleError(e);
        }
    }
    else if (!email && payload.email){
        return constructInvalidResponse(statusCode.badRequest, 'Email cannot be updated');
    } 
    else if (!email) {
        return constructInvalidResponse(statusCode.badRequest, 'Email in querystring is required');
    }
    else if (!tokenId) {
        return constructInvalidResponse(statusCode.forbidden, 'Unauthorized access');
    } 
    else {
        return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }  
};

const userDelete = async ({ queryString, headers }) => {
    const email = getValidEmail(queryString.email);
    const tokenId = getValidTokenId(headers.tokenid);
  
    if (email && tokenId) {
        try {
          await verify(tokenId, email);

            const tokens = await tokenService.list();
            const tokensData = await Promise.all(tokens.map(token => tokenService.read(token)));
            await Promise.all(tokensData.filter(({userEmail}) => userEmail === email).map(({id}) => tokenService.remove(id)));
            await userService.remove(email);

            return constructValidResponse(statusCode.ok, {});
        }
        catch (e) {
            return handleError(e);
        }
    }
    else if (!tokenId) {
        return constructInvalidResponse(statusCode.forbidden, 'Unauthorized access');
    } 
    else {
        return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
};

const userGet = async ({ queryString, headers }) => {
    const email = getValidEmail(queryString.email);
    const tokenId = getValidTokenId(headers.tokenid);
  
    if (email && tokenId) {
      try {
            await verify(tokenId, email);

            const user = await userRepository.read(email);
            delete user.password;

            return constructValidResponse(statusCode.ok, user);
        }
        catch (e) {
            return handleError(e);
        }
    } 
    else if (!tokenId) {
        return constructInvalidResponse(statusCode.forbidden, 'Unauthorized access');
    } 
    else {
        return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }   
};

module.exports = {
    get: userGet,
    post: postUser,
    put: userPut,
    delete: userDelete
  };