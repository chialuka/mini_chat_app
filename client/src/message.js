import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import TextField from "@material-ui/core/TextField";

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

class Message extends Component {
  state = {
    message: ""
  };

  componentDidMount() {
    this.props.message.subscribeToMore({
      document: messageSubscription,
      variables: {
        receiverMail: this.props.email
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const msg = subscriptionData.data.newMessage;
        if (prev.messages.find(x => x.id === msg.id)) {
          return prev;
        } else {
          return Object.assign({}, prev, {
            messages: [...prev.messages, msg]
          });
        }
      }
    });
  }

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };


  handleSubmit = async (e, message, email) => {
    e.preventDefault();
    const { receiverMail } = this.props;
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

  render() {
    const {
      message: { error, loading, messages },
      email,
      receiverMail
    } = this.props;
    const {message} = this.state;

    if (error || loading) return null;

    return (
      <div className="personalChat">
        {messages.map(item =>
          (item.senderMail === email && item.receiverMail === receiverMail) ||
          (item.senderMail === receiverMail && item.receiverMail === email) ? (
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
        <form onSubmit={e => this.handleSubmit(e, message, email)}>
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
    );
  }
}

export default compose(
  graphql(MessageQuery, { name: "message" }),
  graphql(createMessageMutation, { name: "createMessage" }),
  graphql(deleteMessageMutation, { name: "deleteMessage" })
)(Message);
