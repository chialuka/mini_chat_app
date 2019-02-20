import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";


class Registration extends Component {
  state = {
    registration: {
      name: "",
      email: ""
    },
  };

  handleChange = ({ target }) => {
    this.setState({ registration: {...this.state.registration, [target.name]: target.value} });
  };

  handleSubmit = e => {
    e.preventDefault();
    const {registration: { email, name }} = this.state;
    const regToken = this.state.registration;
    localStorage["registrationToken"] = JSON.stringify(regToken);
    this.props.setEmailToStorage(email);
    console.log(this.props.setEmailToStorage)
    this.props.createUser(email, name);
  };

  render() {
    const name = this.state.registration["name"];
    const email = this.state.registration["email"];
    return (
      <Paper elevation={8} className="paper">
        <TextField
          required
          id="outlined-name"
          label="Name"
          name="name"
          value={name}
          onChange={this.handleChange}
          variant="outlined"
          style={{ margin: 10 }}
        />
        <TextField
          required
          id="outlined-email-input"
          type="email"
          label="Email"
          name="email"
          value={email}
          onChange={this.handleChange}
          variant="outlined"
          className="textArea"
          style={{ margin: 10 }}
        />
        <Button
          variant="contained"
          onClick={this.handleSubmit}
          style={{ margin: 15 }}
        >
          Register
        </Button>
      </Paper>
    );
  }
}

export default Registration;
