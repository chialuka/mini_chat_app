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

  render() {
    const email = this.state.email;
 
      return (
        <div>
          <User email={email} selectedMail={this.setSelectedMail} />
          <Message email={email} receiverMail={this.state.receiverMail}/>
        </div>
      );
  }
}

export default App;
