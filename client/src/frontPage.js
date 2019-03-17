import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import validator from "validator";

class Registration extends Component {
  state = {
    registration: {
      name: "",
      email: ""
    },
    error: ""
  };

  handleChange = ({ target }) => {
    this.setState({
      registration: { ...this.state.registration, [target.name]: target.value }
    });
  };

  validator = () => {
    const {
      registration: { name, email },
      registration
    } = this.state;

    const existingUser = this.props.users.some(function(user) {
      return user.email === email;
    });

    if (!name.length) {
      this.setState({ error: "Name is required" });
    }

    if (!validator.isEmail(email)) {
      this.setState({ error: "Valid email is required" });
    }

    if (existingUser) {
      this.setState({ error: "Email already in use" });
    }

    if (name.length && validator.isEmail(email) && !existingUser) {
      localStorage["registrationToken"] = JSON.stringify(registration);
      this.handleSubmit(email, name);
    }
  };

  handleSubmit = (email, name) => {
    window.location.reload();
    this.props.createUser(email, name);
  };

  render() {
    const { name, email, error } = this.state;
    return (
      <Paper elevation={3} className="paper">
        User Details
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
          onClick={this.validator}
          style={{ margin: 15 }}
        >
          Enter Chat
        </Button>
        <div>{error}</div>
      </Paper>
    );
  }
}

export default Registration;
