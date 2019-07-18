import gql from 'graphql-tag';

const UserQuery = gql`
  query {
    users {
      id
      name
      email
      messages {
        message
        senderMail
        receiverMail
      }
    }
  }
`;

const CreateUserMutation = gql`
  mutation($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      name
      email
      id
      messages {
        message
        senderMail
        receiverMail
      }
    }
  }
`;

const DeleteUserMutation = gql`
  mutation($email: String!) {
    deleteUser(email: $email)
  }
`;

const AddUserSubscription = gql`
  subscription {
    newUser {
      name
      email
      id
      messages {
        message
        senderMail
        receiverMail
        timestamp
      }
    }
  }
`;

const DeleteUserSubscription = gql`
  subscription {
    oldUser
  }
`;

export {
  UserQuery,
  CreateUserMutation,
  DeleteUserMutation,
  AddUserSubscription,
  DeleteUserSubscription
};
