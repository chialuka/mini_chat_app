import gql from 'graphql-tag';

const MessageQuery = gql`
  query {
    messages {
      id
      message
      senderMail
      receiverMail
      timestamp
      users {
        name
        email
      }
    }
  }
`;

const CreateMessageMutation = gql`
  mutation(
    $message: String!
    $senderMail: String!
    $receiverMail: String!
    $timestamp: Float!
  ) {
    createMessage(
      message: $message
      senderMail: $senderMail
      receiverMail: $receiverMail
      timestamp: $timestamp
    ) {
      message
      senderMail
      receiverMail
      id
      timestamp
      users {
        name
        email
      }
    }
  }
`;

const UserTypingMutation = gql`
  mutation($email: String!, $receiverMail: String!) {
    userTyping(email: $email, receiverMail: $receiverMail)
  }
`;

const MessageSubscription = gql`
  subscription($receiverMail: String!) {
    newMessage(receiverMail: $receiverMail) {
      message
      senderMail
      receiverMail
      id
      timestamp
      users {
        name
        email
      }
    }
  }
`;

const UserTypingSubscription = gql`
  subscription($receiverMail: String!) {
    userTyping(receiverMail: $receiverMail)
  }
`;

export {
  MessageQuery,
  CreateMessageMutation,
  UserTypingMutation,
  MessageSubscription,
  UserTypingSubscription
};
