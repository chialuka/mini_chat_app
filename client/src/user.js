import React, { Component } from "react";
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

const updateUserMutation = gql`
  mutation($id: ID!, $name: String!) {
    updateUser(id: $ID, name: $name) {
      name
      email
      id
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

// const deleteUserSubscription = gql`
//   subscription {
//     oldUser
//   }
// `;

class User extends Component {
  state = {
    disabledEmail: ""
  };

  componentDidMount() {
    const subscribeToMore = this.props.data.subscribeToMore;
    console.log(subscribeToMore)
    subscribeToMore({
      document: addUserSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const user = subscriptionData.data.newUser;
        if (!prev.users.find(x => x.id === user.id)) {
          return Object.assign({}, prev, {
            users: [...prev.users, user]
          });
        } else {
          return prev;
        }
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.data.users !== this.props.data.users ||
      prevState.disabledEmail !== this.state.disabledEmail
    ) {
      console.log("yesss", prevState.disabledEmail, this.state.disabledEmail)
      this.props.getUser(this.props.data.users, this.createUser);
    }
  }

  createUser = async (email, name) => {
    await this.props.createUser({
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

  deleteUser = async email => {
    await this.props.deleteUser({
      variables: {
        email: email
      },
      update: store => {
        const data = store.readQuery({ query: UserQuery });
        data.users = data.users.filter(x => x.email !== email);
        store.writeQuery({ query: UserQuery, data });
        this.setState({ disabledEmail: email });
        localStorage.removeItem("registrationToken");
        this.props.setDisabled(email);
      }
    });
  };

  selectUser = (mail, name) => {
    this.props.selectedMail(mail, name);
  };

  render() {
    const {
      data: { users, loading, error },
      email,
      name
    } = this.props;
    if (loading) return null;
    if (error) return `Error + ${error}`;

    if (localStorage.registrationToken) {
      return (
        <div className="userWelcome">
          <div className="leave" onClick={() => this.deleteUser(email)}>
            Leave Chat?
          </div>
          <p>Hello, {name}</p>
          <div className="selectUser">
            {users.map(item =>
              item.email !== email ? (
                <div
                  key={item.id}
                  className="users"
                  onClick={() => this.selectUser(item.email, item.name)}
                >
                  {item.name}
                </div>
              ) : (
                ""
              )
            )}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default compose(
  graphql(UserQuery),
  graphql(CreateUserMutation, { name: "createUser" }),
  graphql(updateUserMutation, { name: "updateUser" }),
  graphql(deleteUserMutation, { name: "deleteUser" })
)(User);
