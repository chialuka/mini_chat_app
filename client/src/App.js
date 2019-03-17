import React, { Component } from "react";
import User from "./user";
import Message from "./message";

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
    receiverName: ""
  };

  setSelectedMail = (receiverMail, receiverName) => {
    this.setState({ receiverMail, receiverName });
  };

  render() {
    const { email, name } = this.state;

    if (email.length) {
      return (
        <div className="chatPage">
          <User
            email={email}
            name={name}
            selectedMail={this.setSelectedMail}
            setEmailToStorage={this.setEmailToStorage}
          />
          <Message
            email={email}
            receiverMail={this.state.receiverMail}
            receiverName={this.state.receiverName}
          />
        </div>
      );
    } else {
      return (
        <div className="chatPage">
          <User
            email={email}
            name={name}
            selectedMail={this.setSelectedMail}
            setEmailToStorage={this.setEmailToStorage}
          />
        </div>
      );
    }
  }
}

export default App;
