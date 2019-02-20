import React, { Component } from "react";
import User from "./user";
import Message from "./message";

class App extends Component {
  state = {
    email:
      (localStorage.registrationToken &&
        JSON.parse(localStorage.registrationToken).email) ||
      [],
    receiverMail: ""
  };

  setSelectedMail = receiverMail => {
    this.setState({ receiverMail: receiverMail });
  };

  setEmailToStorage = mail => {
    this.setState({ email: mail });
  };

  render() {
    const email = this.state.email;
    console.log(email)
    return (
      <div>
        <User
          email={email}
          selectedMail={this.setSelectedMail}
          setEmailToStorage={this.setEmailToStorage}
        />
        <Message email={email} receiverMail={this.state.receiverMail} />
      </div>
    );
  }
}

export default App;
