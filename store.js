const _ = require("lodash");
const electron = require("electron");
const fs = require("fs");
const path = require("path");

class Store {
  constructor() {
    this._filePath = this._getFilePath();
    this._data = this._getData();
  }

  clear() {
    this._data = {};
    this._setData();
  }

  get(key) {
    return _.get(this._data, key, null);
  }

  initialize(data) {
    this._data = data;
    this._setData();
  }

  set(key, value) {
    _.set(this._data, key, value);
    this._setData();
  }

  _getData() {
    try {
      return JSON.parse(fs.readFileSync(this._filePath));
    } catch (e) {
      return {};
    }
  }

  _getFilePath() {
    const app = electron.app || electron.remote.app;
    const dataPath = app.getPath("userData");
    return path.join(dataPath, "data.json");
  }

  _setData() {
    console.log("Before Write");
    fs.writeFileSync(this._filePath, JSON.stringify(this._data));
    console.log("After Write");
  }
}

module.exports = Store;
