import React, { Component } from "react";
import { ipcRenderer } from "electron";

const UpdateAvailable = ({
  downloaded,
  downloading,
  onDownloadClick,
  onInstallClick,
  update
}) =>
  <div>
    <h2>A new update is available!</h2>
    {downloading && <p>Downloading…</p>}
    {downloaded &&
      !downloading &&
      <button onClick={onInstallClick}>Install Update</button>}
    {!downloaded &&
      !downloading &&
      <button onClick={onDownloadClick}>Download Update</button>}
  </div>;

class UpdateBanner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedOnce: false,
      checkingForUpdate: false,
      updateAvailable: null,
      updateDownloaded: false,
      updateDownloading: false,
      updateError: false
    };

    this.handleDownloadButtonClick = this.handleDownloadButtonClick.bind(this);
    this.handleInstallButtonClick = this.handleInstallButtonClick.bind(this);
    this.handleUpdateAvailable = this.handleUpdateAvailable.bind(this);
    this.handleUpdateDownloaded = this.handleUpdateDownloaded.bind(this);
    this.handleUpdateDownloading = this.handleUpdateDownloading.bind(this);
    this.handleUpdateError = this.handleUpdateError.bind(this);
    this.handleUpdateNotAvailable = this.handleUpdateNotAvailable.bind(this);
  }

  checkForUpdate() {
    this.setState({
      checkingForUpdate: true,
      updateError: false
    });

    ipcRenderer.send("check-for-update");
  }

  componentDidMount() {
    ipcRenderer.on("update-available", this.handleUpdateAvailable);
    ipcRenderer.on("update-downloaded", this.handleUpdateAvailable);
    ipcRenderer.on("update-downloading", this.handleUpdateNotAvailable);
    ipcRenderer.on("update-error", this.handleUpdateError);
    ipcRenderer.on("update-not-available", this.handleUpdateNotAvailable);

    this.checkForUpdate();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.shouldStartPollingCheckForUpdate(nextState)) {
      return this.startPollingCheckForUpdate();
    }

    if (this.shouldStopPollingCheckForUpdate(nextState)) {
      return this.stopPollingCheckForUpdate();
    }
  }

  componentWillUnmount() {
    this.removeUpdateHandlers();
  }

  handleDownloadButtonClick() {
    event.preventDefault();
    ipcRenderer.send("download-update");
  }

  handleInstallButtonClick(event) {
    event.preventDefault();
    ipcRenderer.send("install-update");
  }

  handleUpdateAvailable(event, meta, downloaded) {
    this.setState({
      checkedOnce: true,
      checkingForUpdate: false,
      updateAvailable: meta,
      updateDownloaded: downloaded
    });
  }

  handleUpdateDownloaded() {
    this.setState({
      updateDownloaded: true,
      updateDownloading: false
    });
  }

  handleUpdateDownloading() {
    this.setState({
      updateDownloading: true
    });
  }

  handleUpdateError() {
    this.setState({
      checkedOnce: true,
      checkingForUpdate: false,
      updateDownloading: false,
      updateError: false
    });
  }

  handleUpdateNotAvailable() {
    this.setState({
      checkedOnce: true,
      checkingForUpdate: false
    });
  }

  render() {
    if (this.state.updateError) {
      return <p style={{ color: "red" }}>There was an error!</p>;
    }

    if (this.state.checkingForUpdate) {
      return <p>Checking for update…</p>;
    }

    return this.state.updateAvailable
      ? <UpdateAvailable
          downloaded={this.state.updateDownloaded}
          downloading={this.state.updateDownloading}
          onDownloadClick={this.handleDownloadButtonClick}
          onInstallClick={this.handleInstallButtonClick}
          update={this.state.updateAvailable}
        />
      : <p>There is no update available!</p>;
  }

  shouldStartPollingCheckForUpdate(nextState) {
    return (
      !this.state.checkedOnce &&
      nextState.checkedOnce &&
      !nextState.updateAvailable
    );
  }

  shouldStopPollingCheckForUpdate(nextState) {
    return !this.state.updateAvailable && nextState.updateAvailable;
  }

  startPollingCheckForUpdate() {
    this.stopPollingCheckForUpdate();
    this.interval = window.setInterval(this.checkForUpdate, 60 * 1000 * 30);
  }

  stopPollingCheckForUpdate() {
    window.clearInterval(this.interval);
  }

  removeUpdateHandlers() {
    ipcRenderer.off("update-available", this.handleUpdateAvailable);
    ipcRenderer.off("update-downloaded", this.handleUpdateDownloaded);
    ipcRenderer.off("update-downloading", this.handleUpdateDownloading);
    ipcRenderer.off("update-error", this.handleUpdateError);
    ipcRenderer.off("update-not-available", this.handleUpdateNotAvailable);
  }
}

export default UpdateBanner;
