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
      users {
        name
        email
      }
    }
  }
`;

const deleteMessageMutation = gql`
  mutation($id: ID!) {
    deleteMessage(id: $id)
  }
`;

const userSubscription = gql`
  {
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

const messageSubscription = gql`
  subscription($receiverMail: String!) {
    newMessage(receiverMail: $receiverMail) {
      message
      senderMail
      receiverMail
      id
      users {
        name
        email
      }
    }
  }
`;

class App extends Component {
  state = {
    email:
      (localStorage.registrationToken &&
        JSON.parse(localStorage.registrationToken).email) ||
      [],
    receiverMail: "",
    message: "",
    newPage: false
  };

  // componentDidMount() {
  //   const { receiverMail } = this.state;
  //   this.props.message
  // }

  subscribeToNewMessages = subscribeToMore => {
    const { receiverMail } = this.state;
    subscribeToMore({
      document: messageSubscription,
      variables: {
        receiverMail: receiverMail
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const msg = subscriptionData.data.newMessage;
        if (prev.messages.find(x => x.id === msg.id)) {
          return prev;
        } else {
          console.log((Object.assign({}, prev, {
            messages: [...prev.messages, msg]
          })));
          return Object.assign({}, prev, {
            messages: [...prev.messages, msg]
          });
        }
      }
    });
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };

  handleCreateUser = async (email, name) => {
    await this.props.createUser({
      variables: {
        email: email,
        name: name
      },
      update: (store, { data: { createUser } }) => {
        const data = store.readQuery({ query: UserQuery });
        data.users.push(createUser);
        store.writeQuery({ query: UserQuery, data });
        this.setState({ newPage: true });
      }
    });
  };

  handleSubmit = async (e, message, subscribeToMore) => {
    e.preventDefault();
    this.subscribeToNewMessages(subscribeToMore);
    const { receiverMail, email } = this.state;
    if (!receiverMail.length || !email.length || !message.length) return null;
    await this.props.createMessage({
      variables: {
        receiverMail: receiverMail,
        senderMail: email,
        message: message
      },
      update: (store, { data: { createMessage } }) => {
        const data = store.readQuery({ query: MessageQuery });
        data.messages.push(createMessage);
        store.writeQuery({ query: MessageQuery, data });
        this.setState({ message: "" });
      }
    });
  };

  selectUser = email => {
    this.setState({ receiverMail: email });
  };

  render() {
    const {
      message: { error, messages, subscribeToMore }
    } = this.props;
    const {
      user: { users, loading }
    } = this.props;
    const emailToken = this.state.email;
    const receiverMail = this.state.receiverMail;
    const message = this.state.message;
    const newPage = this.state.newPage;
    if (loading) return null;
    if (error) return `Error!: ${error}`;

    if (!emailToken.length && !newPage) {
      return <Registration createUser={this.handleCreateUser} />;
    } else {
      return (
        <div className="chatPage">
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
                  <div className="sender">
                    {item.users.map((x, y, arr) =>
                      x.name === arr[y].name ? x.name : ""
                    )}
                  </div>
                  {item.message}
                </div>
              ) : (
                ""
              )
            )}
            <form
              onSubmit={e => this.handleSubmit(e, message, subscribeToMore)}
            >
              <TextField
                style={{ margin: 10 }}
                placeholder="Placeholder"
                fullWidth
                name="message"
                value={message}
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
  graphql(deleteMessageMutation, { name: "deleteMessage" }),
  graphql(userSubscription)
)(App);
