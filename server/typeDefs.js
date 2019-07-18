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
    userTyping(email: String! receiverMail: String!): Boolean!

    createMessage(senderMail: String! receiverMail: String! message: String! timestamp: Float!): Message!
    updateMessage(id: ID! message: String!): Message!
    deleteMessage(id: String!): Boolean!
  }

  type Subscription {
    newMessage(receiverMail: String!): Message
    newUser: User
    oldUser: String
    userTyping (receiverMail: String!): String
  }
`;

module.exports = typeDefs;
