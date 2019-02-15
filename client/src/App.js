import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import Registration from "./frontPage";
import TextField from "@material-ui/core/TextField";

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
      message: $message
      senderMail: $senderMail
      receiverMail: $receiverMail
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
    receiverMail: "",
    chatText: ""
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e, chatText) => {
    e.preventDefault();
    const {receiverMail, registered } = this.state
    await this.props.createMessage({
      variables: {
        receiverMail: receiverMail,
        senderMail: registered,
        message: chatText
      },
      update: (store, { data: { createMessage } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: MessageQuery });
        // Add our comment from the mutation to the end.
        data.messages.push(createMessage);
        this.setState({ chatText: "" })
        // Write our data back to the cache.
        store.writeQuery({ query: MessageQuery, data });
    }
  })
  }

  selectUser = email => {
    this.setState({ receiverMail: email });
  };

  render() {
    const {
      user: { loading, users, error }
    } = this.props;
    const {
      message: { messages }
    } = this.props;
    const emailToken = this.state.registered;
    const receiverMail = this.state.receiverMail;
    const chatText = this.state.chatText;

    if (loading || error) return null;

    if (!emailToken.length) {
      return <Registration />;
    } else {
      return (
        <div className="chatPage">
          {console.log(this.props)}
          <div className="selectUser">
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
          <div className="personalChat">
            {messages.map(item =>
              (item.senderMail === emailToken &&
                item.receiverMail === receiverMail) ||
              (item.senderMail === receiverMail &&
                item.receiverMail === emailToken) ? (
                <div key={item.id} className="message">
                  <div className="sender">{messages.map(y => Array.isArray(y) ? y.map(x => x.name) : '')}</div>
                  {item.message}
                </div>
              ) : (
                ""
              )
            )}
            <form onSubmit={(e) => this.handleSubmit(e, chatText)}>
              <TextField
                style={{ margin: 10 }}
                placeholder="Placeholder"
                fullWidth
                name="chatText"
                value={chatText}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
              />
            </form>
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
