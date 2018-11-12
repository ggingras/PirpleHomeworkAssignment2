
/*
 * No orders entity, append as a property to user entity
 * 
 * */

const https = require('https');
const queryString = require('querystring');
const config = require('../config');
const { statusCode } = require('../lib/commons');
const { constructValidResponse, constructInvalidResponse, makeRandomString } = require('../lib/helpers');
const repository = require('../lib/repository');
const orderRepository = repository('order');
const menuRepository = repository('menu');
const userRepository = repository('user');
const tokenRepository = repository('token');
const { verify } = require('./tokensController');

const getValidTokenId = (str) => {
    return (typeof str === 'string' && str.length === 16) ? str : false;
}

const getValidOrderId = (str) => {
  return (typeof str === 'string' && str.length === 16) ? str : false;
}

const handleError = (e) => {
    switch (e.code) {
        case 'EEXIST':
          return constructInvalidResponse(statusCode.badRequest, 'Order already exists');
        case 'ENOENT':
            return constructInvalidResponse(statusCode.notFound, 'Order not found');
        case 'EACCES':                  
        case 'EISDIR':
          return constructInvalidResponse(statusCode.internalError, 'Internal server error');
        default:
          return constructInvalidResponse(e.statusCode || statusCode.badRequest, e.message);
    }
}

const sendRequest = async (options, postData)  => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let response;
        res.setEncoding('utf-8');

        res.on('data', (chunk) => {
          response = chunk;
        });

        res.on('end', () => {
          console.log(typeof response);

          try {
            resolve(JSON.parse(response));
          } 
          catch (e) {
            resolve(response);
          }
        });
      });
  
      req.on('error', (e) => {
        console.log(e);
        reject(constructInvalidResponse(statusCode.badRequest, `problem with request: ${e.message}`));
      });
  
      req.write(postData);
      req.end();
    });
};
  
const processPayment = async (order) => {
    const stripePostData = queryString.stringify({
        currency: 'usd',
        amount: order.price * 100,
        description: `charges for this orderId ${order.id}`,
        source: 'tok_visa'
    });

    const stripeOptions = {
        protocol: config.stripe.apiProtocol,
        hostname: config.stripe.apiHostName,
        port: config.stripe.apiPort,
        path: config.stripe.apiPath,
        method: config.stripe.apiVerb,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stripePostData),
          'Authorization': 'Bearer '+ config.stripe.apiSecret
        }
    };

    return await sendRequest(stripeOptions, stripePostData);
}

const notifyUser = async (email, orderId) => {
    const mailgunPostData = queryString.stringify({
        from: 'Admin <admin@samples.mailgun.org>',
        to: email,
        subject: 'Receipt for orderId ' + orderId,
        text: `Order has been fully paid on ${Date.now}`
    });

    const mailgunOptions = {
        protocol: config.mailgun.apiProtocol,
        hostname: config.mailgun.apiHostName,
        port: config.mailgun.apiPort,
        path: config.mailgun.apiPath,
        method: config.mailgun.apiVerb,
        auth: 'api:'+ config.mailgun.apiKey,
        retry: 1,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(mailgunPostData),
        }
    };

    await sendRequest(mailgunOptions, mailgunPostData);
}

const orderPost = async ({ headers }) => {
    const tokenId = getValidTokenId(headers.tokenid);

    if (tokenId) {
      try {
        const token = await tokenRepository.read(tokenId);
        await verify(tokenId, token.email);

        const user = await userRepository.read(token.email);
        const itemList = user.cartItems instanceof Array && user.cartItems.length > 0 ? [...user.cartItems] : false;
  
        if (itemList) {
          const fullItemsList = await Promise.all(itemList.map(item => menuRepository.read(item.itemId)));
          
          const orderId = makeRandomString(16);
          const orderList = user.orders instanceof Array && user.orders.length > 0 ? [...user.orders] : [];
          
          const order = {
            id: orderId,
            items: fullItemsList,
            price: fullItemsList.reduce((accumulator, item) => accumulator += item.price, 0),
            iat: Date.now()
          };
          
          const {outcome: {type}, paid} = await processPayment(order);
          if (type === 'authorized' && paid === true) {
            // save order data
            order.paymentProcessed = true;
            await orderRepository.create(orderId, order);
  
            await notifyUser(token.email, orderId);
            
            orderList.push(orderId);
            user.orders = orderList;
            user.cartItems = [];
            await userRepository.update(token.email, user);
  
            return constructValidResponse(statusCode.ok, order);
          } 
          else {
            return constructInvalidResponse(statusCode.badRequest, 'payment not processed');
          }
        } 
        else {
          return constructInvalidResponse(statusCode.badRequest, 'no item on cart');
        }
      } 
      catch (e) {
        return handleError(e);
      }
    } 
    else {
      return constructInvalidResponse(statusCode.badRequest, 'Required fields missing or invalid');
    }
};

const orderGet = async ({ queryString, headers }) => {
    const orderId = getValidOrderId(queryString.id);
    const tokenId = getValidTokenId(headers.tokenid);
  
    if (orderId && tokenId) {
      try {
        const token = await tokenRepository.read(tokenId);
        await verify(tokenId, token.email);
  
        const order = await orderRepository.read(orderId);
  
        return constructValidResponse(statusCode.ok, order);
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
    get: orderGet,
    post: orderPost,
};