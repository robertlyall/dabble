import React, { Component } from "react";
import { ipcRenderer } from "electron";
import authenticate from "../utilities/authenticate";

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = { pending: false };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(this.form);
    this.setState({ pending: true });

    console.log("email", formData.get("email"));
    console.log("password", formData.get("password"));

    authenticate(formData.get("email"), formData.get("password"))
      .then(data => {
        console.log({ data });
        ipcRenderer.send("login", data);
      })
      .catch(error => {
        console.log(error);
        console.log("caught");
        this.setState({ pending: false });
        alert("The email/password combination entered was incorrect!");
      });
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
