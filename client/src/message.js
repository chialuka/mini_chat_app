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

const CreateMessageMutation = gql`
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

const UserTypingMutation = gql`
  mutation($email: String!) {
    userTyping(email: $email)
  }
`;

const MessageSubscription = gql`
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
      document: MessageSubscription,
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
    const { email, receiverMail } = props;
    await props.userTyping({ email });
    const changeMail = async () => {
      await props.userTyping({
        email: receiverMail
      });
      console.log(receiverMail);
    };
    setTimeout(changeMail, 2000);
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
    setUser("");
  };

  const {
    message: { error, loading, messages },
    email,
    receiverMail,
    receiverName,
    userLeft
  } = props;
  console.log(userTyping);

  if (error || loading) return null;

  return (
    <div className="personal-chat">
      <div className="user-typing">
        {userTyping && userTyping === receiverMail
          ? `${receiverName} is typing`
          : receiverName}
      </div>
      <div className="all-messages">
        {messages.map(item =>
          (item.senderMail === email && item.receiverMail === receiverMail) ||
          (item.senderMail === receiverMail && item.receiverMail === email) ? (
            <div
              key={item.id}
              className={item.users.map(a =>
                a.email === receiverMail ? "receiver" : "sender"
              )}
            >
              <div className="sender-name">{item.users.map(x => x.name)}</div>
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
          className="chat-box"
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
  graphql(CreateMessageMutation, { name: "createMessage" }),
  graphql(UserTypingMutation, { name: "userTyping" })
)(Message);
