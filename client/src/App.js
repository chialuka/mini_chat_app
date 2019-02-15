import React, { Component } from 'react';
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";


const UserQuery = gql`{
  users {
    id
    name
    email
    messages {
      message
      firstUserId
      secondUserId
    }
  }
}`;

const MessageQuery = gql`{
  messages {
    id
    message
    firstUserId
    secondUserId
    users {
      name
      email
    }
  }
}`;

const CreateUserMutation = gql`
mutation($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    name
    email
    id
  }
}`;

const updateUserMutation = gql`
mutation($id: ID!, $name: String!){
  updateUser(id: $ID, name: $name) {
    name
    email
    id
  }
}`;

const deleteUserMutation = gql`
mutation($id: ID!){
  deleteUser(id: $id)
}`;

const createMessageMutation = gql`
mutation($message: String!, $firstUserId: String!, $secondUserId: String!){
  createMessage(mssage: $message, firstUserId: $firstUserId, secondUserId: $secondUserId) {
    message
    firstUserId
    secondUserId
    id
  }
}`;

const deleteMessageMutation = gql`
mutation($id: ID!){
  deleteMessage(id: $id)
}`;

class App extends Component {
  render() {
    const {user: {loading, users}} = this.props;
    const {message: {messages}} = this.props;
    if (loading) return null;

    return (
      <div>
        {console.log(users, messages)}
      </div>
    );
  }
}

export default compose(
  graphql(UserQuery, {name: "user"}),
  graphql(MessageQuery, {name: "message"}),
  graphql(CreateUserMutation, {name: "createUser"}),
  graphql(updateUserMutation, {name: "updateUser"}),
  graphql(deleteUserMutation, {name: "deleteUser"}),
  graphql(createMessageMutation, {name: "createMessage"}),
  graphql(deleteMessageMutation, {name: "deleteMessage"}))(App);
