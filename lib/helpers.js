const crypto = require('crypto');
const config = require('../config');

const makeRandomString = (length) => {
  length = typeof length === 'number' && length > 0 ? length : false;
  if (length) {
    const possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let randomString = '';

    for (let i = 0; i < length; i++) {
      randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
    }

    return randomString;
  } 
  else {
    return false;
  }
};

const isValidInputString = (str) =>
{
  return (typeof str === 'string' && str.length > 0) ? str : false;
}

const hashString = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    return crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
  } 
  else {
    return false;
  }
};

const parseJsonToObject = function(str){
  try{
    return str ? JSON.parse(str) : {};
  } catch(e){
    return {};
  }
};

const constructValidResponse = (statusCode, payload = {}) => {
  return {statusCode : statusCode, message : '', payload : payload, contentType : 'json'};
}

const constructInvalidResponse = (statusCode, message) => {
  return {statusCode : statusCode, payload : {'Error' : message}, contentType : 'json'};
}

module.exports = {
  makeRandomString,
  hashString,
  isValidInputString,
  constructValidResponse,
  constructInvalidResponse,
  parseJsonToObject
};
