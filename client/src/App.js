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
    createUser: ""
  };

  getUser = (users, createUser) => {
    this.setState({ users, createUser });
  };

  setSelectedMail = (receiverMail, receiverName) => {
    this.setState({ receiverMail, receiverName });
  };

  render() {
    const { email, name, users, createUser } = this.state;

    if (users.length && !localStorage.registrationToken) {
      return <Registration users={users} createUser={createUser} />;
    } else {
      return (
        <div className="chatPage">
          <User
            email={email}
            name={name}
            selectedMail={this.setSelectedMail}
            getUser={this.getUser}
          />
          <Message
            email={email}
            receiverMail={this.state.receiverMail}
            receiverName={this.state.receiverName}
          />
        </div>
      );
    }
  }
}

export default App;
