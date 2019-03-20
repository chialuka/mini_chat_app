import React, { Component } from "react";
import User from "./user";
import Message from "./message";
import Registration from "./frontPage";

class App extends Component {
  state = {
    email:
      (localStorage.registrationToken &&
        JSON.parse(localStorage.registrationToken).email) ||
      "",
    name:
      (localStorage.registrationToken &&
        JSON.parse(localStorage.registrationToken).name) ||
      "",
    receiverMail: "",
    receiverName: "",
    users: [],
    createUser: "",
  };

  setDisabled = email => {
    this.setState({ disabledEmail: email})
  }

  getUser = (users, createUser) => {
    this.setState({ users, createUser });
  };

  setSelectedMail = (receiverMail, receiverName) => {
    this.setState({ receiverMail, receiverName });
  };

  render() {
    const { email, name, users, createUser } = this.state;
    return (
      <div className="chatPage">
        <User
          email={email}
          name={name}
          selectedMail={this.setSelectedMail}
          getUser={this.getUser}
          setDisabled={this.setDisabled}
        />
        <Message
          email={email}
          receiverMail={this.state.receiverMail}
          receiverName={this.state.receiverName}
          disabledEmail={this.state.disabledEmail}
        />
        <Registration users={users} createUser={createUser} />
      </div>
    );
  }
}

export default App;
