import React, { Component } from "react";


class Registration extends Component {
  state = {
    name: '',
    email: ''
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const regToken = this.state.email
    localStorage['registrationToken'] = JSON.stringify(regToken);
  }

  render () {
    const name = this.state.name;
    const email = this.state.email;

    return (
      <form>
        <label>
          Name:
          <input 
            type = "text" 
            placeholder = "...Your Name"
            name = "name"
            value = {name} 
            onChange = {this.handleChange} />
        </label>
        <label>
          Email:
          <input 
            type = "email" 
            placeholder = "...Your email address"
            name = "email"
            value = {email} 
            onChange = {this.handleChange} />
        </label>
        <input type="button" onClick={this.handleSubmit} />
      </form>
    )
  }
}

export default Registration;
