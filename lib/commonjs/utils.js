"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeDimensions = normalizeDimensions;
exports.friction = friction;
exports.fixGestureHandler = fixGestureHandler;
exports.getShouldRender = getShouldRender;
exports.clamp = clamp;

var _reactNative = require("react-native");

var _react = require("react");

const dimensions = _reactNative.Dimensions.get('window');

function normalizeDimensions(item, targetWidth = dimensions.width) {
  const scaleFactor = item.width / targetWidth;
  const targetHeight = item.height / scaleFactor;
  return {
    targetWidth,
    targetHeight
  };
}

function friction(value) {
  'worklet';

  const MAX_FRICTION = 30;
  const MAX_VALUE = 200;
  const res = Math.max(1, Math.min(MAX_FRICTION, 1 + Math.abs(value) * (MAX_FRICTION - 1) / MAX_VALUE));

  if (value < 0) {
    return -res;
  }

  return res;
} // in order to simultaneousHandlers to work
// we need to trigger rerender of the screen
// so refs will be valid then


function fixGestureHandler() {
  const [, set] = (0, _react.useState)(0);
  (0, _react.useEffect)(() => {
    set(v => v + 1);
  }, []);
}

function getShouldRender(index, activeIndex, diffValue = 3) {
  const diff = Math.abs(index - activeIndex);

  if (diff > diffValue) {
    return false;
  }

  return true;
}

function clamp(value, lowerBound, upperBound) {
  'worklet';

  return Math.min(Math.max(lowerBound, value), upperBound);
}
//# sourceMappingURL=utils.js.map