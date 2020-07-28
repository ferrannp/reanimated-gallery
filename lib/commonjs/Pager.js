"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImagePager = ImagePager;

var _react = _interopRequireWildcard(require("react"));

var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));

var _reactNative = require("react-native");

var _reactNativeGestureHandler = require("react-native-gesture-handler");

var _useAnimatedGestureHandler = require("./useAnimatedGestureHandler");

var _ImageTransformer = require("./ImageTransformer");

var _utils = require("./utils");

var vec = _interopRequireWildcard(require("./vectors"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const dimensions = _reactNative.Dimensions.get('window');

const GUTTER_WIDTH = dimensions.width / 14;
const FAR_FAR_AWAY = 9999;

const getPageTranslate = i => {
  const t = i * dimensions.width;
  const g = GUTTER_WIDTH * i;
  return -(t + g);
};

const styles = _reactNative.StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'black'
  },
  pager: {
    flex: 1,
    flexDirection: 'row'
  }
});

const AnimatedImage = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.Image);

function Gutter({
  width
}) {
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: {
      width
    }
  });
}

const Page = /*#__PURE__*/_react.default.memo(({
  shouldRender,
  pagerRefs,
  page,
  onPageStateChange,
  gutterWidth,
  index,
  length
}) => {
  if (!shouldRender) {
    return null;
  }

  const targetWidth = dimensions.width;
  const scaleFactor = page.item.width / targetWidth;
  const targetHeight = page.item.height / scaleFactor;
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: {
      flex: 1,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: -getPageTranslate(index)
    }
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [{
      flex: 1,
      width: dimensions.width,
      justifyContent: 'center',
      alignItems: 'center'
    }]
  }, /*#__PURE__*/_react.default.createElement(_ImageTransformer.ImageTransformer, {
    pagerRefs,
    onPageStateChange,
    uri: page.item.uri,
    width: targetWidth,
    height: targetHeight
  })), index !== length - 1 && /*#__PURE__*/_react.default.createElement(Gutter, {
    width: gutterWidth
  }));
});

const timingConfig = {
  duration: 250,
  easing: _reactNativeReanimated.Easing.bezier(0.33, 0.01, 0, 1)
};

function ImagePager({
  gallery
}) {
  (0, _utils.fixGestureHandler)();
  const pagerRef = (0, _react.useRef)(null);
  const tapRef = (0, _react.useRef)(null);
  const isActive = (0, _reactNativeReanimated.useSharedValue)(true);

  function onPageStateChange(value) {
    'worklet';

    isActive.value = value;
  }

  const imageWrapperPosition = (0, _reactNativeReanimated.useSharedValue)(0);
  const pagerPosition = (0, _reactNativeReanimated.useSharedValue)(FAR_FAR_AWAY);

  const setPagerVisible = value => {
    'worklet';

    imageWrapperPosition.value = value ? FAR_FAR_AWAY : 0;
    pagerPosition.value = value ? 0 : FAR_FAR_AWAY;
  }; // S1: Image transition stuff


  const {
    measurements,
    item
  } = gallery.activeItem;

  if (!measurements) {
    throw new Error('Gallery Pager: Active item should have measurements');
  }

  const [activeImage, setActiveImage] = (0, _react.useState)(item.uri);
  const animationProgress = (0, _reactNativeReanimated.useSharedValue)(0);
  const scale = (0, _reactNativeReanimated.useSharedValue)(1);
  const backdropOpacity = (0, _reactNativeReanimated.useSharedValue)(0);
  const statusBarFix = _reactNative.Platform.OS === 'android' ? 12 : 0;
  const velocity = (0, _reactNativeReanimated.useSharedValue)(0);
  const x = (0, _reactNativeReanimated.useSharedValue)(measurements.x);
  const width = (0, _reactNativeReanimated.useSharedValue)(measurements.width);
  const height = (0, _reactNativeReanimated.useSharedValue)(measurements.height);
  const targetWidth = (0, _reactNativeReanimated.useSharedValue)(measurements.targetWidth);
  const targetHeight = (0, _reactNativeReanimated.useSharedValue)(measurements.targetHeight);
  const y = (0, _reactNativeReanimated.useSharedValue)(measurements.y);
  const target = vec.useSharedVector(0, (dimensions.height - measurements.targetHeight) / 2 - statusBarFix);
  const translate = vec.useSharedVector(0, 0);
  const [diffValue, setDiffValue] = (0, _react.useState)(0);
  (0, _react.useEffect)(() => {
    const disposer = gallery.addOnChangeListener(nextItem => {
      if (!nextItem.measurements) {
        throw new Error('Item should have measurements');
      }

      x.value = nextItem.measurements.x;
      width.value = nextItem.measurements.width;
      height.value = nextItem.measurements.height;
      targetWidth.value = nextItem.measurements.targetWidth;
      targetHeight.value = nextItem.measurements.targetHeight;
      y.value = nextItem.measurements.y;
      target.y.value = (dimensions.height - nextItem.measurements.targetHeight) / 2 - statusBarFix;
      setActiveImage(nextItem.item.uri);
      setCurrentImageOpacity(0);
    });
    return disposer;
  }, []);

  function setCurrentImageOpacity(value) {
    try {
      gallery.activeItem.opacity.value = value;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error changing opacity');
    }
  } // S1: Callbacks


  function afterOpen() {
    setCurrentImageOpacity(0);
    setDiffValue(2);
  }

  function onClose() {
    setCurrentImageOpacity(1);
    gallery.onClose();
  } // S1: Animations


  const openAnimation = () => {
    'worklet';

    animationProgress.value = (0, _reactNativeReanimated.withTiming)(1, timingConfig, () => {
      setPagerVisible(true);
      afterOpen();
    });
    backdropOpacity.value = (0, _reactNativeReanimated.withTiming)(1, timingConfig);
  };

  (0, _react.useEffect)(() => {
    (0, _reactNativeReanimated.runOnUI)(openAnimation)();
  }, []); // S1: Styles

  const imageStyles = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const i = range => (0, _reactNativeReanimated.interpolate)(animationProgress.value, [0, 1], range, _reactNativeReanimated.Extrapolate.CLAMP);

    const translateY = translate.y.value + i([y.value, target.y.value]);
    const translateX = translate.x.value + i([x.value, target.x.value]);
    return {
      top: translateY,
      left: translateX,
      width: i([width.value, targetWidth.value]),
      height: i([height.value, targetHeight.value]),
      transform: [{
        scale: scale.value
      }]
    };
  });
  const backdropStyles = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      opacity: backdropOpacity.value
    };
  }); // S2: Pager related stuff

  const [activeIndex, setActiveIndex] = (0, _react.useState)(gallery.activeItem.index);
  const index = (0, _reactNativeReanimated.useSharedValue)(gallery.activeItem.index);
  const length = (0, _reactNativeReanimated.useSharedValue)(gallery.totalCount);
  const pagerX = (0, _reactNativeReanimated.useSharedValue)(0);
  const toValueAnimation = (0, _reactNativeReanimated.useSharedValue)(getPageTranslate(gallery.activeItem.index));
  const gestureTranslationX = (0, _reactNativeReanimated.useSharedValue)(0);
  const offsetX = (0, _reactNativeReanimated.useSharedValue)(getPageTranslate(gallery.activeItem.index));
  const totalWidth = (0, _reactNativeReanimated.useDerivedValue)(() => {
    return length.value * dimensions.width + GUTTER_WIDTH * length.value - 2;
  });

  const getTranslate = i => {
    'worklet';

    const t = i * dimensions.width;
    const g = GUTTER_WIDTH * i;
    return t + g;
  };

  async function onIndexChange() {
    const nextIndex = index.value;
    setCurrentImageOpacity(1);
    await gallery.setActiveIndex(nextIndex);
    setActiveIndex(nextIndex);
  }

  const onChangePageAnimation = () => {
    'worklet';

    offsetX.value = (0, _reactNativeReanimated.withSpring)(toValueAnimation.value, {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      velocity: velocity.value
    });
  }; // S3 Pager


  const canSwipe = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const nextTranslate = offsetX.value + gestureTranslationX.value;

    if (nextTranslate > 0) {
      return false;
    }

    const totalTranslate = dimensions.width * (length.value - 1) + GUTTER_WIDTH * (length.value - 1);

    if (nextTranslate <= -totalTranslate) {
      return false;
    }

    return true;
  });

  const getNextIndex = v => {
    'worklet';

    const currentTranslate = Math.abs(getTranslate(index.value));
    const currentIndex = index.value;
    const currentOffset = Math.abs(offsetX.value);
    const nextIndex = v < 0 ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < currentIndex && currentOffset > currentTranslate) {
      return currentIndex;
    }

    if (nextIndex > currentIndex && currentOffset < currentTranslate) {
      return currentIndex;
    }

    if (nextIndex > length.value - 1 || nextIndex < 0) {
      return currentIndex;
    }

    return nextIndex;
  };

  const isPagerInProgress = (0, _reactNativeReanimated.useDerivedValue)(() => {
    return Math.floor(getTranslate(index.value)) !== Math.floor(Math.abs(offsetX.value + pagerX.value));
  });
  const onPan = (0, _useAnimatedGestureHandler.useAnimatedGestureHandler)({
    shouldHandleEvent: evt => {
      return evt.numberOfPointers === 1 && isActive.value && animationProgress.value === 1;
    },
    onEvent: evt => {
      gestureTranslationX.value = evt.translationX;
      velocity.value = evt.velocityX;
    },
    onStart: (evt, ctx) => {
      const isHorizontalSwipe = Math.abs(evt.velocityX) > Math.abs(evt.velocityY);

      if (isHorizontalSwipe || isPagerInProgress.value) {
        setPagerVisible(true);
        ctx.pagerActive = true;
      } else {
        setPagerVisible(false);
      }
    },
    onActive: (evt, ctx) => {
      if (ctx.pagerActive) {
        pagerX.value = canSwipe.value ? evt.translationX : (0, _utils.friction)(evt.translationX);
      } else {
        translate.y.value = evt.translationY;
        translate.x.value = evt.translationX;
        scale.value = (0, _reactNativeReanimated.interpolate)(translate.y.value, [-200, 0, 200], [0.65, 1, 0.65], _reactNativeReanimated.Extrapolate.CLAMP);
        backdropOpacity.value = (0, _reactNativeReanimated.interpolate)(translate.y.value, [-100, 0, 100], [0, 1, 0], _reactNativeReanimated.Extrapolate.CLAMP);
      }
    },
    onEnd: (evt, ctx) => {
      if (ctx.pagerActive) {
        offsetX.value += pagerX.value;
        pagerX.value = 0;
        const nextIndex = getNextIndex(evt.velocityX);
        const v = Math.abs(evt.velocityX);
        const shouldMoveToNextPage = v > 10 && canSwipe.value; // we invert the value since the tranlationY is left to right

        toValueAnimation.value = -(shouldMoveToNextPage ? getTranslate(nextIndex) : getTranslate(index.value));
        onChangePageAnimation();

        if (shouldMoveToNextPage) {
          index.value = nextIndex;
          onIndexChange();
        }
      } else {
        const easing = _reactNativeReanimated.Easing.bezier(0.33, 0.01, 0, 1);

        const config = {
          duration: 200,
          easing
        };

        if (Math.abs(translate.y.value) > 40) {
          target.x.value = translate.x.value - target.x.value * -1;
          target.y.value = translate.y.value - target.y.value * -1;
          translate.x.value = 0;
          translate.y.value = 0;
          animationProgress.value = (0, _reactNativeReanimated.withTiming)(0, {
            duration: 400,
            easing
          }, () => {
            onClose();
          });
          scale.value = (0, _reactNativeReanimated.withTiming)(1, {
            duration: 400,
            easing
          });
          backdropOpacity.value = (0, _reactNativeReanimated.withTiming)(0, config);
        } else {
          translate.x.value = (0, _reactNativeReanimated.withTiming)(0, config);
          translate.y.value = (0, _reactNativeReanimated.withTiming)(0, config);
          backdropOpacity.value = (0, _reactNativeReanimated.withTiming)(1, config);
          scale.value = (0, _reactNativeReanimated.withTiming)(1, config, () => {
            setPagerVisible(true);
          });
        }
      }
    },
    onFinish: (_, ctx) => {
      ctx.pagerActive = false;
    }
  });
  const onTap = (0, _useAnimatedGestureHandler.useAnimatedGestureHandler)({
    shouldHandleEvent: evt => {
      return evt.numberOfPointers === 1 && isActive.value && animationProgress.value === 1;
    },
    onStart: () => {
      if (scale.value !== 1) {
        return;
      }

      (0, _reactNativeReanimated.cancelAnimation)(offsetX);
    },
    onEnd: () => {
      if (scale.value !== 1) {
        return;
      }

      onChangePageAnimation();
    }
  });
  const pagerWrapperStyles = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      transform: [{
        translateY: pagerPosition.value
      }]
    };
  });
  const pagerStyles = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      width: totalWidth.value,
      transform: [{
        translateX: pagerX.value + offsetX.value
      }]
    };
  });
  const imageWrapperStyles = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      transform: [{
        translateX: imageWrapperPosition.value
      }]
    };
  });
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: _reactNative.StyleSheet.absoluteFillObject
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [styles.backdrop, backdropStyles]
  }), /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [_reactNative.StyleSheet.absoluteFill]
  }, /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.PanGestureHandler, {
    ref: pagerRef,
    simultaneousHandlers: [tapRef],
    onGestureEvent: onPan,
    onHandlerStateChange: onPan
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: _reactNative.StyleSheet.absoluteFill
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [_reactNative.StyleSheet.absoluteFill, imageWrapperStyles]
  }, /*#__PURE__*/_react.default.createElement(AnimatedImage, {
    source: {
      uri: activeImage
    },
    style: imageStyles
  })), /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [_reactNative.StyleSheet.absoluteFill, pagerWrapperStyles]
  }, /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.TapGestureHandler, {
    ref: tapRef // TODO: Fix tap gesture handler
    ,
    enabled: false,
    simultaneousHandlers: [pagerRef],
    onGestureEvent: onTap,
    onHandlerStateChange: onTap
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: _reactNative.StyleSheet.absoluteFill
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [styles.pager, pagerStyles]
  }, gallery.images.map((page, i) => /*#__PURE__*/_react.default.createElement(Page, {
    key: i.toString(),
    page: page,
    pagerRefs: [pagerRef, tapRef],
    onPageStateChange: onPageStateChange,
    index: i,
    length: gallery.totalCount,
    shouldRender: (0, _utils.getShouldRender)(i, activeIndex, diffValue),
    gutterWidth: GUTTER_WIDTH
  }))))))))));
}
//# sourceMappingURL=Pager.js.map