const { GraphQLUpload } = require('graphql-upload');
const usersResolvers = require('./users');

module.exports = {
  Query: {
    ...usersResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
  },
};
