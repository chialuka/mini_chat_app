import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import Registration from "./frontPage";

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

const userSubscription = gql`
  subscription {
    newUser {
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

class User extends Component {
  state = {
    newPage: true
  };

  componentDidMount() {
    const subscribeToMore = this.props.data.subscribeToMore;
    subscribeToMore({
      document: userSubscription,
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

  handleCreateUser = async (email, name) => {
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
        //this.setState({ newPage: true });
      }
    });
  };

  deleteUser = async email => {
    //const newPage = this.state.newPage;
    await this.props.deleteUser({
      variables: {
        email: email
      },
      update: store => {
        const data = store.readQuery({ query: UserQuery });
        data.users = data.users.filter(x => x.email !== email);
        store.writeQuery({ query: UserQuery, data });
        this.setState({ newPage: false });
        localStorage.removeItem("registrationToken");
      }
    });
  };

  selectUser = mail => {
    this.props.selectedMail(mail);
  };

  render() {
    const {
      data: { users, loading, error },
      email
    } = this.props;
    if (loading) return null;
    if (error) return `Error!: ${error}`;
    const newPage = this.state.newPage;

    if (this.props.email.length && newPage) {
      return (
        <div className="chatPage">
          <div className="selectUser">
            <div className="leave" onClick={() => this.deleteUser(email)}>
              Leave Chat
            </div>
            {users.map(item => (
              <div
                key={item.id}
                className="users"
                onClick={() => this.selectUser(item.email)}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <Registration
          createUser={this.handleCreateUser}
          setEmailToStorage={this.props.setEmailToStorage}
        />
      );
    }
  }
}

export default compose(
  graphql(UserQuery),
  graphql(CreateUserMutation, { name: "createUser" }),
  graphql(updateUserMutation, { name: "updateUser" }),
  graphql(deleteUserMutation, { name: "deleteUser" })
)(User);
