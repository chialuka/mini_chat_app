const { PubSub, withFilter, GraphQLServer } = require("graphql-yoga");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/miniChat", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const User = mongoose.model("User", {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: { unique: true }
  }
});

const Message = mongoose.model("Message", {
  message: String,
  senderMail: String,
  receiverMail: String,
  timestamp: Number
});

const typeDefs = `
  type Query {
    users: [User]
    messages: [Message]
  }

  type User {
    id: ID!
    name: String!
    email: String!
    messages: [Message]
  }

  type Message {
    id: ID!
    message: String!
    senderMail: String!
    receiverMail: String!
    timestamp: Float!
    users: [User]
  }

  type Mutation {
    createUser(name: String! email: String!): User
    updateUser(id: ID! name: String!): User!
    deleteUser(email: String!): Boolean!

    createMessage(senderMail: String! receiverMail: String! message: String! timestamp: Float!): Message!
    updateMessage(id: ID! message: String!): Message!
    deleteMessage(id: String!): Boolean!
  }

  type Subscription {
    newMessage(receiverMail: String!): Message
    newUser: User
  }
`;

const resolvers = {
  Query: {
    users: () => User.find(),
    messages: () => Message.find()
  },

  User: {
    messages: async ({ email }) => {
      return await Message.find({ senderMail: email });
    }
  },

  Message: {
    users: async ({ senderMail }) => {
      return await User.find({ email: senderMail });
    }
  },

  Mutation: {
    createUser: async (_, { name, email }) => {
      const user = new User({ name, email });
      await user.save();
      pubsub.publish("newUser", { newUser: user });
      return user;
    },

    updateUser: async (_, { id, name }) => {
      const user = User.findOne({ _id: id });
      await User.findOneAndUpdate({ _id: id }, { name });
      return user;
    },

    deleteUser: async (_, { email }) => {
      await Message.deleteMany({ senderMail: email })
      await User.findOneAndDelete({ email: email });
      return true;
    },

    createMessage: async (
      _,
      { senderMail, receiverMail, message, timestamp }
    ) => {
      const userText = new Message({
        senderMail,
        receiverMail,
        message,
        timestamp
      });
      await userText.save();
      pubsub.publish("newMessage", {
        newMessage: userText,
        receiverMail: receiverMail
      });
      return userText;
    },

    updateMessage: async (_, { id, message }) => {
      const userText = Message.findOne({ _id: id });
      await Message.findOneAndUpdate({ _id: id }, { message });
      return userText;
    },

    deleteMessage: async (_, { id }) => {
      await Message.deleteMany({ senderMail: id });
      return true;
    }
  },

  Subscription: {
    newMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newMessage"),
        (payload, variables) => {
          return payload.receiverMail === variables.receiverMail;
        }
      )
    },

    newUser: {
      subscribe: (rootValue, args, { pubsub }) => {
        return pubsub.asyncIterator("newUser");
      }
    }
  }
};

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
mongoose.connection.once("open", () =>
  server.start(() => console.log("We make magic over at localhost:4000"))
);
