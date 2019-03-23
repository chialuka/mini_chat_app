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
    required: true
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
    createUser(name: String! email: String!): User!
    updateUser(id: ID! name: String!): User!
    deleteUser(email: String!): Boolean!
    userTyping(email: String!): Boolean!

    createMessage(senderMail: String! receiverMail: String! message: String! timestamp: Float!): Message!
    updateMessage(id: ID! message: String!): Message!
    deleteMessage(id: String!): Boolean!
  }

  type Subscription {
    newMessage(receiverMail: String!): Message
    newUser: User
    oldUser: String
    userTyping: String
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
      const user = await User.findOneAndUpdate(
        { _id: id },
        { name },
        { new: true }
      );
      return user;
    },

    deleteUser: async (_, { email }) => {
      await Promise.all([
        User.findOneAndDelete({ email: email }),
        Message.deleteMany({ senderMail: email })
      ]);
      pubsub.publish("oldUser", { oldUser: email });
      return true;
    },

    userTyping: async (_, { email }) => {
      await User.findOne({ email });
      pubsub.publish("userTyping", { userTyping: email });
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
      const userText = await Message.findOneAndUpdate(
        { _id: id },
        { message },
        { new: true }
      );
      return userText;
    },

    deleteMessage: async (_, { id }) => {
      await Message.findOneAndDelete({ _id: id });
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
      subscribe: (_, {}, { pubsub }) => {
        return pubsub.asyncIterator("newUser");
      }
    },

    oldUser: {
      subscribe: (_, {}, { pubsub }) => {
        return pubsub.asyncIterator("oldUser");
      }
    },

    userTyping: {
      subscribe: (_, {}, { pubsub }) => {
        return pubsub.asyncIterator("userTyping");
      }
    }
  }
};

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
mongoose.connection.once("open", () =>
  server.start(() => console.log("We make magic over at localhost:4000"))
);
