import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import TextField from "@material-ui/core/TextField";
import moment from "moment";

const MessageQuery = gql`
  {
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

const createMessageMutation = gql`
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
      timestamp
      users {
        name
        email
      }
    }
  }
`;

class Message extends Component {
  state = {
    message: "",
    oldScrollPoint: window.pageYOffset,
    formIsShown: false
  };

  hideForm = () => {
    const { oldScrollPoint } = this.state;
    const newScrollPoint = window.pageYOffset;

    const formIsShown = oldScrollPoint < newScrollPoint;
    console.log(oldScrollPoint, newScrollPoint, formIsShown);

    this.setState({ oldScrollPoint: newScrollPoint, formIsShown });
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
          return { ...prev, messages: [...prev.messages, msg] };
        }
      }
    });
    if (this.chatBox) {
      this.scrollToBottom();
    }
    //window.addEventListener("scroll", this.hideForm);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.hideForm);
  }

  componentDidUpdate(prevState) {
    if (this.state.message !== prevState.message) {
      if (this.chatBox) {
        this.scrollToBottom();
      }
    }
  }

  scrollToBottom = () => {
    this.chatBox.scrollIntoView();
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };

  handleSubmit = async (e, message, email) => {
    this.setState({ message: "" });
    e.preventDefault();
    const { receiverMail } = this.props;
    if (!message.length) return null;
    await this.props.createMessage({
      variables: {
        receiverMail: receiverMail,
        senderMail: email,
        message: message,
        timestamp: Date.now()
      },
      update: (store, { data: { createMessage } }) => {
        const data = store.readQuery({ query: MessageQuery });
        data.messages.push(createMessage);
        store.writeQuery({ query: MessageQuery, data });
      }
    });
  };

  render() {
    const {
      message: { error, loading, messages },
      email,
      receiverMail,
      receiverName,
      disabledEmail
    } = this.props;
    const { message } = this.state;
    if (error || loading) return null;

    if (localStorage.token) {
      return (
        <div className="personalChat">
          <div className="allMessages">
            {messages.map(item =>
              (item.senderMail === email &&
                item.receiverMail === receiverMail) ||
              (item.senderMail === receiverMail &&
                item.receiverMail === email) ? (
                <div
                  key={item.id}
                  className={item.users.map(a =>
                    a.name === receiverName ? "receiver" : "sender"
                  )}
                >
                  <div className="senderName">
                    {item.users.map(x => x.name)}
                  </div>
                  {item.message}{" "}
                  <span className="time">
                    {" "}
                    {moment(item.timestamp).fromNow()}
                  </span>
                </div>
              ) : (
                ""
              )
            )}
          </div>
          <div>
            {disabledEmail && disabledEmail === receiverMail ? (
              <div>User has left chat and can no longer reply you</div>
            ) : null}
          </div>
          <form
            onSubmit={e => this.handleSubmit(e, message, email)}
            className={`chatBox ${
              this.state.formIsShown ? "chatBox--hidden" : ""
            }`}
          >
            <TextField
              style={{ margin: 10 }}
              placeholder={"Say something to " + receiverName}
              fullWidth
              name="message"
              value={message}
              onChange={this.handleChange}
              margin="normal"
              variant="outlined"
            />
          </form>

          <div
            ref={chatBox => {
              this.chatBox = chatBox;
            }}
          />
        </div>
      );
    }
    return null;
  }
}

export default compose(
  graphql(MessageQuery, { name: "message" }),
  graphql(createMessageMutation, { name: "createMessage" }),
  graphql(deleteMessageMutation, { name: "deleteMessage" })
)(Message);
