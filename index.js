const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");
const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require("graphql-upload");

const PORT = process.env.PORT || 5000;
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { MONGODB } = require("./config");

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
  });

  mongoose
    .connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
      console.log("MongoDB Connected");
      // return server.listen({ port: 5000 });
    })
    .then((res) => {
      // console.log(`Server running at PORT 5000`);
    })
    .catch((err) => {
      console.log(err);
    });

  await server.start();

  const app = express();

  // This middleware should be added before calling `applyMiddleware`.
  app.use(graphqlUploadExpress());

  server.applyMiddleware({ app });
  /*app.use('/file', (req, res) => {
    res.send('This is the');
  });*/

  await new Promise((r) => app.listen({ port: PORT }, r));

  console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`);

  /*app.listen({ port: 5000 }, () =>
    console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`)
  );*/
}
//S
startServer();
