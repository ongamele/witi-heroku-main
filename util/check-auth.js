const { AuthenticationError } = require('apollo-server-express');

const jwt = require('jsonwebtoken');
const { SECRETE_KEY } = require('../config');

module.exports = (context) => {
  // context = {...headers }
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    //Bearer ....
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRETE_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError('Invalid token');
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error('Authorisation header must be provided');
};
