"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Tabs;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _reactRouterDom = require("react-router-dom");
var _componentBreadcrumb = _interopRequireDefault(require("@ivoyant/component-breadcrumb"));
require("./styles.css");
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
var _history = require("history");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const getValidActiveKey = (tabs, activeKey) => {
  let matchingTab = tabs.find(t => t?.name && t.name.toLowerCase().replace(/\s/g, '').replace('/', '-') === activeKey);
  let validActiveKey;
  if (matchingTab && (matchingTab?.disabled === undefined || matchingTab.disabled === false)) {
    validActiveKey = activeKey;
  } else {
    matchingTab = tabs.find(t => t?.disabled === undefined || t.disabled === false);
    validActiveKey = matchingTab && matchingTab?.name && matchingTab.name.toLowerCase().replace(/\s/g, '').replace('/', '-');
  }
  return validActiveKey;
};
function Tabs(props) {
  const {
    title,
    breadcrumbs,
    active = 1,
    tabs,
    tabPosition = 'top',
    tabsType = 'line',
    bypassRouteTransition = false,
    featureFlagKey
  } = props.component.params;
  const history = (0, _history.createBrowserHistory)();
  const location = (0, _reactRouterDom.useLocation)();
  const {
    pathname,
    hash,
    search
  } = location;
  const activeTabKey = hash && getValidActiveKey(tabs, hash.split(/[#?]/)[1]);
  const {
    children
  } = props;
  const {
    childComponents
  } = props.component;
  const [currentTabKey, setCurrentTabKey] = (0, _react.useState)(`${active}`);
  const getChildren = tabIndex => {
    const childrenOfTab = [];
    childComponents.forEach((childComponent, index) => {
      if (Number(childComponent.tabIndex) === tabIndex) {
        childrenOfTab.push( /*#__PURE__*/_react.default.cloneElement(children[index], {
          parentProps: props,
          routeData: location?.state?.routeData
        }));
      }
    });
    return childrenOfTab;
  };
  const getFeatureData = featureKey => {
    const featureFlag = _jsPlugin.default.invoke('features.evaluate', featureKey);
    return featureFlag && featureFlag[0];
  };
  const getTabs = () => {
    return tabs.map((_ref, index) => {
      let {
        name,
        featureFlagKey,
        disabled = false,
        flagForQuickPayment = false
      } = _ref;
      const key = name && name?.toLowerCase().replace(/\s/g, '').replace('/', '-');
      const featureFlag = featureFlagKey && getFeatureData(featureFlagKey);
      const featureDisabled = featureFlag && !featureFlag?.enabled;

      /* Disable adjustment and autopay tabs if in quick payment mode */
      if (location?.state?.routeData?.quickPayment !== undefined && flagForQuickPayment) {
        return {};
      }
      return {
        label: name,
        disabled,
        key,
        children: featureDisabled ? /*#__PURE__*/_react.default.createElement(_antd.Alert, {
          message: `${name} is disabled ${featureFlag?.reasons?.length > 0 ? `due to ${featureFlag?.reasons.toString()}` : ''}`,
          type: "info",
          showIcon: true
        }) : getChildren(index + 1)
      };
    });
  };
  const getKeyByIndex = tabIndex => {
    const name = tabs[tabIndex]?.name;
    return name && name?.toLowerCase().replace(/\s/g, '').replace('/', '-');
  };
  const handleTabChange = key => {
    const urlAfterHash = hash && hash.split('?')[1];
    const url = urlAfterHash ? `${pathname}#${key}?${urlAfterHash}` : search ? `${pathname}#${key}${search}` : `${pathname}#${key}`;
    history.push(url, {
      routeData: location?.state?.routeData
    });
  };
  let tabFeatureFlag = null;
  if (featureFlagKey) {
    tabFeatureFlag = getFeatureData(featureFlagKey);
  }
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, breadcrumbs && title && /*#__PURE__*/_react.default.createElement(_componentBreadcrumb.default, {
    title: title,
    breadcrumbs: breadcrumbs
  }), tabFeatureFlag && !tabFeatureFlag?.enabled ? /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    className: "payments-alert",
    message: `${title.text} is disabled ${tabFeatureFlag?.reasons?.length > 0 ? `due to ${tabFeatureFlag?.reasons.toString()}` : ''}`,
    type: "info",
    showIconx: true
  }) : /*#__PURE__*/_react.default.createElement(_antd.Tabs, {
    defaultActiveKey: bypassRouteTransition ? currentTabKey : activeTabKey || getKeyByIndex(active - 1),
    defaultActiveKey: activeTabKey || getKeyByIndex(active - 1),
    tabPosition: tabPosition,
    type: tabsType,
    onChange: bypassRouteTransition ? k => {
      setCurrentTabKey(`${k}`);
    } : handleTabChange,
    items: getTabs()
  }));
}
module.exports = exports.default;