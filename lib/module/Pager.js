import React, { useState, useRef, useEffect } from 'react';
import Animated, { runOnUI, useSharedValue, useAnimatedStyle, interpolate, Easing, Extrapolate, withTiming, withSpring, cancelAnimation, useDerivedValue } from 'react-native-reanimated';
import { Dimensions, StyleSheet, View, Image, Platform } from 'react-native';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import { useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import { ImageTransformer } from './ImageTransformer';
import { friction, fixGestureHandler, getShouldRender } from './utils';
import * as vec from './vectors';
const dimensions = Dimensions.get('window');
const GUTTER_WIDTH = dimensions.width / 14;
const FAR_FAR_AWAY = 9999;

const getPageTranslate = i => {
  const t = i * dimensions.width;
  const g = GUTTER_WIDTH * i;
  return -(t + g);
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'black'
  },
  pager: {
    flex: 1,
    flexDirection: 'row'
  }
});
const AnimatedImage = Animated.createAnimatedComponent(Image);

function Gutter({
  width
}) {
  return /*#__PURE__*/React.createElement(View, {
    style: {
      width
    }
  });
}

const Page = /*#__PURE__*/React.memo(({
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
  return /*#__PURE__*/React.createElement(View, {
    style: {
      flex: 1,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: -getPageTranslate(index)
    }
  }, /*#__PURE__*/React.createElement(View, {
    style: [{
      flex: 1,
      width: dimensions.width,
      justifyContent: 'center',
      alignItems: 'center'
    }]
  }, /*#__PURE__*/React.createElement(ImageTransformer, {
    pagerRefs,
    onPageStateChange,
    uri: page.item.uri,
    width: targetWidth,
    height: targetHeight
  })), index !== length - 1 && /*#__PURE__*/React.createElement(Gutter, {
    width: gutterWidth
  }));
});
const timingConfig = {
  duration: 250,
  easing: Easing.bezier(0.33, 0.01, 0, 1)
};
export function ImagePager({
  gallery
}) {
  fixGestureHandler();
  const pagerRef = useRef(null);
  const tapRef = useRef(null);
  const isActive = useSharedValue(true);

  function onPageStateChange(value) {
    'worklet';

    isActive.value = value;
  }

  const imageWrapperPosition = useSharedValue(0);
  const pagerPosition = useSharedValue(FAR_FAR_AWAY);

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

  const [activeImage, setActiveImage] = useState(item.uri);
  const animationProgress = useSharedValue(0);
  const scale = useSharedValue(1);
  const backdropOpacity = useSharedValue(0);
  const statusBarFix = Platform.OS === 'android' ? 12 : 0;
  const velocity = useSharedValue(0);
  const x = useSharedValue(measurements.x);
  const width = useSharedValue(measurements.width);
  const height = useSharedValue(measurements.height);
  const targetWidth = useSharedValue(measurements.targetWidth);
  const targetHeight = useSharedValue(measurements.targetHeight);
  const y = useSharedValue(measurements.y);
  const target = vec.useSharedVector(0, (dimensions.height - measurements.targetHeight) / 2 - statusBarFix);
  const translate = vec.useSharedVector(0, 0);
  const [diffValue, setDiffValue] = useState(0);
  useEffect(() => {
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

    animationProgress.value = withTiming(1, timingConfig, () => {
      setPagerVisible(true);
      afterOpen();
    });
    backdropOpacity.value = withTiming(1, timingConfig);
  };

  useEffect(() => {
    runOnUI(openAnimation)();
  }, []); // S1: Styles

  const imageStyles = useAnimatedStyle(() => {
    const i = range => interpolate(animationProgress.value, [0, 1], range, Extrapolate.CLAMP);

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
  const backdropStyles = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value
    };
  }); // S2: Pager related stuff

  const [activeIndex, setActiveIndex] = useState(gallery.activeItem.index);
  const index = useSharedValue(gallery.activeItem.index);
  const length = useSharedValue(gallery.totalCount);
  const pagerX = useSharedValue(0);
  const toValueAnimation = useSharedValue(getPageTranslate(gallery.activeItem.index));
  const gestureTranslationX = useSharedValue(0);
  const offsetX = useSharedValue(getPageTranslate(gallery.activeItem.index));
  const totalWidth = useDerivedValue(() => {
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

    offsetX.value = withSpring(toValueAnimation.value, {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      velocity: velocity.value
    });
  }; // S3 Pager


  const canSwipe = useDerivedValue(() => {
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

  const isPagerInProgress = useDerivedValue(() => {
    return Math.floor(getTranslate(index.value)) !== Math.floor(Math.abs(offsetX.value + pagerX.value));
  });
  const onPan = useAnimatedGestureHandler({
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
        pagerX.value = canSwipe.value ? evt.translationX : friction(evt.translationX);
      } else {
        translate.y.value = evt.translationY;
        translate.x.value = evt.translationX;
        scale.value = interpolate(translate.y.value, [-200, 0, 200], [0.65, 1, 0.65], Extrapolate.CLAMP);
        backdropOpacity.value = interpolate(translate.y.value, [-100, 0, 100], [0, 1, 0], Extrapolate.CLAMP);
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
        const easing = Easing.bezier(0.33, 0.01, 0, 1);
        const config = {
          duration: 200,
          easing
        };

        if (Math.abs(translate.y.value) > 40) {
          target.x.value = translate.x.value - target.x.value * -1;
          target.y.value = translate.y.value - target.y.value * -1;
          translate.x.value = 0;
          translate.y.value = 0;
          animationProgress.value = withTiming(0, {
            duration: 400,
            easing
          }, () => {
            onClose();
          });
          scale.value = withTiming(1, {
            duration: 400,
            easing
          });
          backdropOpacity.value = withTiming(0, config);
        } else {
          translate.x.value = withTiming(0, config);
          translate.y.value = withTiming(0, config);
          backdropOpacity.value = withTiming(1, config);
          scale.value = withTiming(1, config, () => {
            setPagerVisible(true);
          });
        }
      }
    },
    onFinish: (_, ctx) => {
      ctx.pagerActive = false;
    }
  });
  const onTap = useAnimatedGestureHandler({
    shouldHandleEvent: evt => {
      return evt.numberOfPointers === 1 && isActive.value && animationProgress.value === 1;
    },
    onStart: () => {
      if (scale.value !== 1) {
        return;
      }

      cancelAnimation(offsetX);
    },
    onEnd: () => {
      if (scale.value !== 1) {
        return;
      }

      onChangePageAnimation();
    }
  });
  const pagerWrapperStyles = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: pagerPosition.value
      }]
    };
  });
  const pagerStyles = useAnimatedStyle(() => {
    return {
      width: totalWidth.value,
      transform: [{
        translateX: pagerX.value + offsetX.value
      }]
    };
  });
  const imageWrapperStyles = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: imageWrapperPosition.value
      }]
    };
  });
  return /*#__PURE__*/React.createElement(View, {
    style: StyleSheet.absoluteFillObject
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: [styles.backdrop, backdropStyles]
  }), /*#__PURE__*/React.createElement(Animated.View, {
    style: [StyleSheet.absoluteFill]
  }, /*#__PURE__*/React.createElement(PanGestureHandler, {
    ref: pagerRef,
    simultaneousHandlers: [tapRef],
    onGestureEvent: onPan,
    onHandlerStateChange: onPan
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: StyleSheet.absoluteFill
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: [StyleSheet.absoluteFill, imageWrapperStyles]
  }, /*#__PURE__*/React.createElement(AnimatedImage, {
    source: {
      uri: activeImage
    },
    style: imageStyles
  })), /*#__PURE__*/React.createElement(Animated.View, {
    style: [StyleSheet.absoluteFill, pagerWrapperStyles]
  }, /*#__PURE__*/React.createElement(TapGestureHandler, {
    ref: tapRef // TODO: Fix tap gesture handler
    ,
    enabled: false,
    simultaneousHandlers: [pagerRef],
    onGestureEvent: onTap,
    onHandlerStateChange: onTap
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: StyleSheet.absoluteFill
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: [styles.pager, pagerStyles]
  }, gallery.images.map((page, i) => /*#__PURE__*/React.createElement(Page, {
    key: i.toString(),
    page: page,
    pagerRefs: [pagerRef, tapRef],
    onPageStateChange: onPageStateChange,
    index: i,
    length: gallery.totalCount,
    shouldRender: getShouldRender(i, activeIndex, diffValue),
    gutterWidth: GUTTER_WIDTH
  }))))))))));
}
//# sourceMappingURL=Pager.js.map