import React, { useState, useEffect } from "react";
import User from "./user";
import Message from "./message";
import Registration from "./frontPage";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

const UserQuery = gql`
  {
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

const deleteUserMutation = gql`
  mutation($email: String!) {
    deleteUser(email: $email)
  }
`;

const addUserSubscription = gql`
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

const deleteUserSubscription = gql`
  subscription {
    oldUser
  }
`;

const App = props => {
  const email =
    (localStorage.token && JSON.parse(localStorage.token).email) || "";
  const name =
    (localStorage.token && JSON.parse(localStorage.token).name) || "";

  const [receiverState, setReceiverState] = useState({
    receiverMail: "",
    receiverName: ""
  });

  const [userLeft, setLeft] = useState("")

  const setSelectedMail = (mail, user) => {
    setReceiverState(receiverState => {
      return { ...receiverState, receiverMail: mail, receiverName: user };
    });
  };

  useEffect(() => {
    const subscribeToMore = props.data.subscribeToMore;
    subscribeToMore({
      document: addUserSubscription,
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
      document: deleteUserSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const oldUser = subscriptionData.data.oldUser;
        if (prev.users.some(x => x.email === oldUser)) {
          const newUsers = prev.users.filter(x => x.email !== oldUser);
          prev.users = newUsers;
          return prev;
        }
        setLeft(oldUser)
        return prev;
      }
    });
  });

  const createUser = async (email, name) => {
    await props.createUser({
      variables: {
        email: email,
        name: name
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
      variables: {
        email: email
      },
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
  if (localStorage.token) {
    return (
      <div className="chatPage">
        <User
          users={users}
          email={email}
          name={name}
          selectedMail={setSelectedMail}
          deleteUser={deleteUser}
        />
        <Message
          email={email}
          receiverMail={receiverMail}
          receiverName={receiverName}
          userLeft={userLeft}
        />
      </div>
    );
  }
  return <Registration users={users} createUser={createUser} />;
};

export default compose(
  graphql(UserQuery),
  graphql(CreateUserMutation, { name: "createUser" }),
  graphql(deleteUserMutation, { name: "deleteUser" })
)(App);
