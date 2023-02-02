"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _tabs = _interopRequireDefault(require("./tabs"));
var _tabs2 = require("./tabs.schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  component: _tabs.default,
  schema: _tabs2.schema,
  ui: _tabs2.ui
};
exports.default = _default;
module.exports = exports.default;