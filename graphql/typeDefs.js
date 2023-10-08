const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    idNumber: String!
    phoneNumber: String!
    faceFileName: String!
    idFileName: String!
    createdAt: String
  }
  input RegisterInput {
    firstName: String!
    lastName: String!
    idNumber: String!
    phoneNumber: String!
    faceFileName: String!
    idFileName: String!
  }

  input UpdateInput {
    firstName: String!
    lastName: String!
    idNumber: String!
    phoneNumber: String!
  }

  type Query {
    getUser(faceWidth: Float!): User
  }
  type Mutation {
    createUser(registerInput: RegisterInput): User
    login(faceImage: String!): User
    updateUser(updateInput: UpdateInput): User
  }
`;
