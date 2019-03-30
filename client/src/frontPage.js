import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import validator from "validator";

const Registration = props => {
  const [token, setToken] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  const handleChange = e => {
    setToken({ ...token, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, email } = token;

    const existingUser = props.users.some(function(user) {
      return user.email === email;
    });

    if (!name.length) {
      setError("Name is required");
    }

    if (!validator.isEmail(email)) {
      setError("Valid email is required");
    }

    if (existingUser) {
      setError("Email already in use");
    }

    if (name.length && validator.isEmail(email) && !existingUser) {
      setError("");
      props.createUser(email, name);
      localStorage["token"] = JSON.stringify(token);
    }
  };

  const { name, email } = token;
  return (
    <Paper elevation={3} className="paper">
      User Details
      <TextField
        required
        id="outlined-name"
        label="Name"
        name="name"
        value={name}
        onChange={handleChange}
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
        onChange={handleChange}
        variant="outlined"
        className="text-area"
        style={{ margin: 10 }}
      />
      <Button variant="contained" onClick={validate} style={{ margin: 15 }}>
        Enter Chat
      </Button>
      <div>{error}</div>
    </Paper>
  );
};

export default Registration;
