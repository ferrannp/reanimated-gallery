function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

import { runOnUI, withTiming, withSpring, Easing, interpolate } from 'react-native-reanimated';
import { useRef } from 'react';
import withDecay from './withDecay';
import { useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import * as vec from './vectors'; // eslint-disable-next-line @typescript-eslint/no-unused-vars

const {
  useSharedVector
} = vec,
      usedVectors = _objectWithoutProperties(vec, ["useSharedVector"]);

function useRunOnce(cb) {
  const ref = useRef(null);

  if (ref.current === null) {
    cb();
    ref.current = true;
  }
}

const usedWorklets = _objectSpread({
  withTiming,
  withSpring,
  bezier: Easing.bezier,
  interpolate,
  withDecay,
  useAnimatedGestureHandler
}, usedVectors);

export function useInit() {
  useRunOnce(runOnUI(() => {
    'worklet';

    const x = {};
    Object.keys(usedWorklets).forEach(key => {
      x[key] = usedWorklets[key];
    });
  }));
}
//# sourceMappingURL=useInit.js.map