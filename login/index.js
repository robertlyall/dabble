import React from "react";
import ReactDOM from "react-dom";
import Form from "./components/Form";
import UpdateBanner from "./components/UpdateBanner";
import { ipcRenderer } from "electron";

ReactDOM.render(
  <div>
    <Form />
    <UpdateBanner />
  </div>,
  document.getElementById("root")
);

ipcRenderer.on("before-quit-callback", () => {
  setTimeout(() => {
    ipcRenderer.send("quit", "My async message!");
  }, 1000);
});
