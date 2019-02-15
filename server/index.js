const { GraphQLServer } = require ("graphql-yoga");
const mongoose = require ("mongoose")

mongoose.connect("mongodb://localhost/anotherTest", { useNewUrlParser: true, useFindAndModify: false })

const User = mongoose.model("User", {
  name: String,
  email: String
})

const Message = mongoose.model("Message", {
  message: String,
  firstUserId: String,
  secondUserId: String
})

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
    firstUserId: String!
    secondUserId: String!
    users: [User]
  }

  type Mutation {
    createUser(name: String! email: String!): User!
    updateUser(id: ID! name: String!): User!
    deleteUser(id: ID!): Boolean!

    createMessage(firstUserId: String! secondUserId: String! message: String!): Message!
    updateMessage(id: ID! message: String!): Message!
    deleteMessage(id: ID!): Boolean!
  }
`

const resolvers = {
  Query: {
    users: () => User.find(),
    messages: () => Message.find()
  },

  User: {
    messages: async ({ id }) => {
      return (await Message.find({firstUserId: id}))
    }
  },

  Message: {
    users: async ({ firstUserId }) => {
      return (await User.find({ _id: firstUserId}))
    }
  },

  Mutation: {
    createUser: async (_, {name, email}) => {
      const user = new User({ name, email })
      await user.save()
      return user;
    },

    updateUser: async (_, {id, name}) => {
      const user = User.findOne({ _id: id })
      await User.findOneAndUpdate({_id: id}, {name})
      return user;
    },

    deleteUser: async (_, {id}) => {
      await User.findOneAndDelete({ _id: id })
      return true;
    },

    createMessage: async (_, {firstUserId, secondUserId, message}) => {
      const userText = new Message({ firstUserId, secondUserId, message });
      await userText.save();
      return userText;
    },

    updateMessage: async (_, {id, message}) => {
      const userText = Message.findOne({ _id: id });
      await Message.findOneAndUpdate({_id: id}, {message});
      return userText;
    },

    deleteMessage: async (_, {id}) => {
      await Message.findOneAndDelete({ _id: id });
      return true;
    }
  }
}

const server = new GraphQLServer({ typeDefs, resolvers });
mongoose.connection.once("open", 
  () => server.start(
    () => console.log("server running on localhost:4000"))
)