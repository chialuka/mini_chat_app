const { PubSub, GraphQLServer } = require("graphql-yoga");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

dotenv.config();

const { DB_URL } = process.env;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
mongoose.connection.once("open", () =>
  server.start(() => console.log("We make magic over at localhost:4000"))
);
