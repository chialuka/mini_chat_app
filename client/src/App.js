import React, { useState, useEffect } from "react";
import User from "./User";
import Message from "./Message";
import Registration from "./FrontPage";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

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

const App = props => {
  const user  = localStorage.getItem('token') && (JSON.parse(localStorage.getItem('token')) || {})

  const [receiverState, setReceiverState] = useState({
    receiverMail: "",
    receiverName: ""
  });

  const [userLeft, setUserLeft] = useState("")

  const setSelectedMail = (mail, user) => {
    setReceiverState(receiverState => {
      return { ...receiverState, receiverMail: mail, receiverName: user };
    });
  };

  useEffect(() => {
    const subscribeToMore = props.data.subscribeToMore;
    subscribeToMore({
      document: AddUserSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const user = subscriptionData.data.newUser;
        if (!prev.users.find(x => x.id === user.id)) {
          return { ...prev, users: [...prev.users, user] };
        }
        return prev;
      }
    });
    subscribeToMore({
      document: DeleteUserSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const oldUser = subscriptionData.data.oldUser;
        if (prev.users.some(x => x.email === oldUser)) {
          const newUsers = prev.users.filter(x => x.email !== oldUser);
          prev.users = newUsers;
          return prev;
        }
        setUserLeft(oldUser)
        return prev;
      }
    });
  }, [props.data]);

  const createUser = async (email, name) => {
    await props.createUser({
      variables: {
        email,
        name
      },
      update: (store, { data: { createUser } }) => {
        const data = store.readQuery({ query: UserQuery });
        if (!data.users.find(x => x.id === createUser.id)) {
          data.users.push(createUser);
        }
        store.writeQuery({ query: UserQuery, data });
      }
    });
  };

  const deleteUser = async email => {
    localStorage.removeItem("token");
    await props.deleteUser({
      variables: { email },
      update: store => {
        const data = store.readQuery({ query: UserQuery });
        data.users = data.users.filter(x => x.email !== email);
        store.writeQuery({ query: UserQuery, data });
      }
    });
  };

  const { receiverMail, receiverName } = receiverState;
  const {
    data: { users, error, loading }
  } = props;

  if (loading || error) return null;
  if (localStorage.getItem('token')) {
    return (
      <div className="chat-page">
        <User
          users={users}
          email={user.email}
          name={user.name}
          selectedMail={setSelectedMail}
          deleteUser={deleteUser}
        />
        <Message
          email={user.email}
          receiverMail={receiverMail}
          receiverName={receiverName}
          userLeft={userLeft}
          name={user.name}
        />
      </div>
    );
  }
  return <Registration users={users} createUser={createUser} />;
};

export default compose(
  graphql(UserQuery),
  graphql(CreateUserMutation, { name: "createUser" }),
  graphql(DeleteUserMutation, { name: "deleteUser" })
)(App);
