import React, { Component } from "react";
import { ipcRenderer } from "electron";
import authenticate from "../utilities/authenticate";

export default class Form extends Component {
  constructor(props) {
    super(props);

    this.state = { pending: false };

    this.handleError = this.handleError.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getCredentials() {
    const formData = new FormData(this.form);
    return [formData.get("email"), formData.get("password")];
  }

  handleError(error) {
    this.setState({ pending: false });
    alert("The email/password combination entered was incorrect!");
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({ pending: true });

    const [email, password] = this.getCredentials();

    authenticate(email, password)
      .then(this.handleSuccess)
      .catch(this.handleError);
  }

  handleSuccess(data) {
    ipcRenderer.send("login", data);
  }

  render() {
    return (
      <form
        name="login"
        onSubmit={this.handleSubmit}
        ref={form => {
          this.form = form;
        }}
      >
        <h1>Login verson: 1.0.0</h1>
        <div>
          <label htmlFor="email">Email Address:</label>
          <input id="email" name="email" type="email" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" />
        </div>
        <input disabled={this.state.pending} type="submit" value="Login" />
      </form>
    );
  }
}
