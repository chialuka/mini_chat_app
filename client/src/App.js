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

const MessageQuery = gql`
  {
    messages {
      id
      message
      senderMail
      receiverMail
      users {
        name
        email
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
  mutation($id: ID!) {
    deleteUser(id: $id)
  }
`;

const createMessageMutation = gql`
  mutation($message: String!, $senderMail: String!, $receiverMail: String!) {
    createMessage(
      mssage: $message
      senderMail: $senderMail
      receiverId: $receiverMail
    ) {
      message
      senderMail
      receiverMail
      id
    }
  }
`;

const deleteMessageMutation = gql`
  mutation($id: ID!) {
    deleteMessage(id: $id)
  }
`;

class App extends Component {
  state = {
    registered:
      (localStorage.registrationToken &&
        JSON.parse(localStorage.registrationToken)) ||
      [],
      receiverMail: '',
  };

  selectUser = (email) => {
    this.setState({ receiverMail: email })
  }

  render() {
    const {
      user: { loading, users }
    } = this.props;
    const {
      message: { messages }
    } = this.props;
    const emailToken = this.state.registered;
    const receiverMail = this.state.receiverMail;
    if (loading) return null;

    if (!emailToken.length) {
      return <Registration />;
    } else {
      return (
        <div className="chatPage">
          {console.log(users, messages, receiverMail, emailToken)}
          <div className="selectUser">
            {users.map(item => (
              <div key={item.id} className="users" onClick={() => this.selectUser(item.email)}>
                {item.name}
              </div>
            ))}
          </div>
          <div className="personalChat">
            {messages.map(item => (item.senderMail === emailToken && item.receiverMail === receiverMail) || (item.senderMail ===  receiverMail && item.receiverMail === emailToken) ? 
              <div key={item.id} className="message"> 
                <div className="sender">{item.users.map(x => x.name)}</div>
                {item.message} 
              </div> : ''
              )}
          </div>
        </div>
      );
    }
  }
}

export default compose(
  graphql(UserQuery, { name: "user" }),
  graphql(MessageQuery, { name: "message" }),
  graphql(CreateUserMutation, { name: "createUser" }),
  graphql(updateUserMutation, { name: "updateUser" }),
  graphql(deleteUserMutation, { name: "deleteUser" }),
  graphql(createMessageMutation, { name: "createMessage" }),
  graphql(deleteMessageMutation, { name: "deleteMessage" })
)(App);
