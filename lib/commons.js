
// emil regular expression from (https://emailregex.com/)
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const statusCode = {
    'ok' : 200,
    'created' : 201,
    'accepted' : 202,
    'badRequest' : 400,
    'unauthorized' : 401,
    'forbidden'  : 403,
    'notFound' : 404,
    'methodNotAllowed' : 405,
    'internalError' : 500,
    'notImplemented' : 501
};

const error = {

};

module.exports = {
    emailRegex,
    statusCode,
    error,
}