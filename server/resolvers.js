const { PubSub, withFilter } = require("graphql-yoga");
const { User, Message } = require('./models');

const resolvers = {
  Query: {
    users: () => User.find(),
    messages: () => Message.find()
  },

  User: {
    messages: async ({ email }) => {
      return Message.find({ senderMail: email });
    }
  },

  Message: {
    users: async ({ senderMail }) => {
      return User.find({ email: senderMail });
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

    userTyping: (_, { email, receiverMail }) => {
      pubsub.publish("userTyping", { userTyping: email, receiverMail });
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
        receiverMail
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
      subscribe: withFilter(
        () => pubsub.asyncIterator("userTyping"),
        (payload, variables) => {
          return payload.receiverMail === variables.receiverMail;
        }
      )
    }
  }
};

const pubsub = new PubSub();

module.exports = resolvers;
