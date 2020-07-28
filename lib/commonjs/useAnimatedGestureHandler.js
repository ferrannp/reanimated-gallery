"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDiff = useDiff;
exports.diff = diff;
exports.useAnimatedGestureHandler = useAnimatedGestureHandler;

var _react = require("react");

var _reactNative = require("react-native");

var _reactNativeReanimated = require("react-native-reanimated");

function useRemoteContext(initialValue) {
  const initRef = (0, _react.useRef)(null);

  if (initRef.current === null) {
    initRef.current = {
      context: (0, _reactNativeReanimated.makeRemote)(initialValue !== null && initialValue !== void 0 ? initialValue : {})
    };
  }

  const {
    context
  } = initRef.current;
  return context;
}

function useDiff(sharedValue) {
  const context = useRemoteContext({
    stash: 0,
    prev: null
  });
  return (0, _reactNativeReanimated.useDerivedValue)(() => {
    context.stash = context.prev !== null ? sharedValue.value - context.prev : 0;
    context.prev = sharedValue.value;
    return context.stash;
  });
}

function diff(context, name, value) {
  'worklet';

  if (!context.___diffs) {
    context.___diffs = {};
  }

  if (!context.___diffs[name]) {
    context.___diffs[name] = {
      stash: 0,
      prev: null
    };
  }

  const d = context.___diffs[name];
  d.stash = d.prev !== null ? value - d.prev : 0;
  d.prev = value;
  return d.stash;
}

function useAnimatedGestureHandler(handlers) {
  const context = useRemoteContext({
    __initialized: false
  });
  const isAndroid = _reactNative.Platform.OS === 'android';
  return (0, _reactNativeReanimated.useEvent)(event => {
    'worklet'; // const UNDETERMINED = 0;

    const FAILED = 1;
    const BEGAN = 2;
    const CANCELLED = 3;
    const ACTIVE = 4;
    const END = 5;

    if (handlers.onInit && !context.__initialized) {
      context.__initialized = true;
      handlers.onInit(event, context);
    }

    if (handlers.onEvent) {
      handlers.onEvent(event, context);
    }

    if (handlers.beforeEach) {
      handlers.beforeEach(event, context);
    }

    const stateDiff = diff(context, 'pinchState', event.state);
    const pinchBeganAndroid = stateDiff === ACTIVE - BEGAN ? event.state === ACTIVE : false;
    const isBegan = isAndroid ? pinchBeganAndroid : event.state === BEGAN;

    if (isBegan && handlers.shouldHandleEvent) {
      context._shouldSkip = !handlers.shouldHandleEvent(event, context);
    }

    if (!context._shouldSkip) {
      if (isBegan && handlers.onStart) {
        handlers.onStart(event, context);
      }

      if (event.state === ACTIVE && handlers.onActive) {
        handlers.onActive(event, context);
      }

      if (event.oldState === ACTIVE && event.state === END && handlers.onEnd) {
        handlers.onEnd(event, context);
      }

      if (event.oldState === ACTIVE && event.state === FAILED && handlers.onFail) {
        handlers.onFail(event, context);
      }

      if (event.oldState === ACTIVE && event.state === CANCELLED && handlers.onCancel) {
        handlers.onCancel(event, context);
      }
    }

    if (event.oldState === ACTIVE) {
      context._shouldSkip = undefined;

      if (handlers.onFinish) {
        handlers.onFinish(event, context, event.state === CANCELLED || event.state === FAILED);
      }
    }

    if (handlers.afterEach) {
      handlers.afterEach(event, context);
    }
  });
}
//# sourceMappingURL=useAnimatedGestureHandler.js.map