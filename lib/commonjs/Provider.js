"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGalleryItem = useGalleryItem;
exports.GalleryProvider = GalleryProvider;
exports.GalleryOverlay = GalleryOverlay;

var _react = _interopRequireWildcard(require("react"));

var _reactNativeReanimated = require("react-native-reanimated");

var _reactNative = require("react-native");

var _GalleryState = require("./GalleryState");

var _Pager = require("./Pager");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const GalleryOverlayContext = /*#__PURE__*/_react.default.createContext(null);

const GalleryContext = /*#__PURE__*/_react.default.createContext(null);

function useGalleryItem({
  index,
  item
}) {
  const gallery = (0, _react.useContext)(GalleryContext);
  const ref = (0, _react.useRef)();
  const opacity = (0, _reactNativeReanimated.useSharedValue)(1);
  (0, _react.useEffect)(() => {
    gallery.addImage({
      ref,
      index,
      item,
      opacity
    });
  }, []);
  const onPress = (0, _react.useCallback)(() => {
    gallery.onShow(index);
  }, []);
  return {
    opacity,
    ref,
    onPress
  };
}

function GalleryProvider({
  totalCount,
  children
}) {
  const setActiveGallery = (0, _react.useContext)(GalleryOverlayContext);
  const [gallery] = (0, _react.useState)(new _GalleryState.GalleryState(setActiveGallery, totalCount));
  return /*#__PURE__*/_react.default.createElement(GalleryContext.Provider, {
    value: gallery
  }, children);
}

function GalleryOverlay({
  children
}) {
  const [activeGallery, setActiveGallery] = (0, _react.useState)(null);
  return /*#__PURE__*/_react.default.createElement(GalleryOverlayContext.Provider, {
    value: setActiveGallery
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: _reactNative.StyleSheet.absoluteFill
  }, children, activeGallery && /*#__PURE__*/_react.default.createElement(_Pager.ImagePager, {
    gallery: activeGallery
  })));
}
//# sourceMappingURL=Provider.js.map