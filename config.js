const config = {};

if (process.env.NODE_ENV === 'prod') {
    config.httpPort = 5000;
    config.httpsPort = 5001;
    config.environment = 'prod';
    config.hashSecret = 'aSecret';  
} 
else {
    config.httpPort = 3000;
    config.httpsPort = 3001;
    config.environment = 'dev';
    config.hashSecret = 'aSecret';
}

config.stripe = {
    apiHostName: 'api.stripe.com',
    apiProtocol: 'https:',
    apiPort: 443,
    apiPath: '/v1/charges',
    apiVerb: 'POST',
    apiPublishable: 'pk_test_e6HMioelSGpxb09E5Lzt75UO',
    apiSecret: 'sk_test_BDPxKkeiXEoj4ywHnS1fHtwY'
  };

config.mailgun = {
    apiHostName: 'api.mailgun.net',
    apiProtocol: 'https:',
    apiPort: 443,
    apiPath: '/v3/sandbox6a847b3023e84756a79b18a083739115.mailgun.org/messages',
    apiVerb: 'POST',
    apiKey: 'key-a8f288e1ba890fbe6cbde4b8c17efd6f',
    apiDefaultPassword: '00828637d3fd82f4660eef67f5b8e9b3-a4502f89-24ec74aa'
  };
  

module.exports = config;