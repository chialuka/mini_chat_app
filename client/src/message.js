import React, { useState, useEffect, useRef } from "react";
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

const userTypingMutation = gql`
  mutation($email: String!) {
    userTyping(email: $email)
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

const userTypingSubscription = gql`
  subscription {
    userTyping
  }
`;

const Message = props => {
  const chatBox = useRef(null);

  const [message, setMessage] = useState("");

  const [userTyping, setUser] = useState("");

  useEffect(() => {
    props.message.subscribeToMore({
      document: messageSubscription,
      variables: {
        receiverMail: props.email
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const msg = subscriptionData.data.newMessage;
        if (prev.messages.find(x => x.id === msg.id)) {
          return prev;
        }
        return { ...prev, messages: [...prev.messages, msg] };
      }
    });
    props.message.subscribeToMore({
      document: userTypingSubscription,
      variables: {
        email: props.email
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const user = subscriptionData.data.userTyping;
        setUser(user);
      }
    });
    if (chatBox.current) {
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    chatBox.current.scrollIntoView();
  };

  const handleChange = async e => {
    setMessage(e.target.value);
    const { email } = props;
    await props.userTyping({
      email: email
    });
  };

  const handleSubmit = async (e, message, email) => {
    setMessage("");
    e.preventDefault();
    const { receiverMail } = props;
    if (!message.length) return null;
    await props.createMessage({
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

  const {
    message: { error, loading, messages },
    email,
    receiverMail,
    receiverName,
    userLeft
  } = props;

  if (error || loading) return null;

  return (
    <div className="personalChat">
      {userTyping && userTyping === receiverMail ? (
        <div> {receiverName} is typing </div>
      ) : null}
      <div className="allMessages">
        {messages.map(item =>
          (item.senderMail === email && item.receiverMail === receiverMail) ||
          (item.senderMail === receiverMail && item.receiverMail === email) ? (
            <div
              key={item.id}
              className={item.users.map(a =>
                a.email === receiverMail ? "receiver" : "sender"
              )}
            >
              <div className="senderName">{item.users.map(x => x.name)}</div>
              {item.message}{" "}
              <span className="time"> {moment(item.timestamp).fromNow()}</span>
            </div>
          ) : (
            ""
          )
        )}
        {userLeft && userLeft === receiverMail ? (
          <div>{receiverName} has left the chat. </div>
        ) : null}
      </div>
      {receiverMail && receiverName && !userLeft ? (
        <form
          onSubmit={e => handleSubmit(e, message, email)}
          ref={chatBox}
          className="chatBox"
        >
          <TextField
            style={{ margin: 10 }}
            placeholder={"Say something to " + receiverName}
            fullWidth
            name="message"
            value={message}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
        </form>
      ) : (
        <div>Select a logged in user from the left panel to start chatting</div>
      )}
    </div>
  );
};

export default compose(
  graphql(MessageQuery, { name: "message" }),
  graphql(createMessageMutation, { name: "createMessage" }),
  graphql(userTypingMutation, { name: "userTyping" })
)(Message);
