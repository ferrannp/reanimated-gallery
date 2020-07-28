"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eq = exports.clamp = exports.max = exports.min = exports.set = exports.invert = exports.multiply = exports.divide = exports.sub = exports.add = exports.create = exports.useSharedVector = void 0;

var _reactNativeReanimated = require("react-native-reanimated");

const _isVector = value => {
  'worklet';

  return typeof value.x !== 'undefined' && value.y !== 'undefined';
};

const isSharedValue = value => {
  'worklet';

  return typeof value.value !== 'undefined';
};

const _get = value => {
  'worklet';

  if (isSharedValue(value)) {
    return value.value;
  }

  return value;
};

const _reduce = (operation, prop, vectors) => {
  'worklet';

  const first = vectors[0];
  const rest = vectors.slice(1);

  const initial = _get(_isVector(first) ? first[prop] : first);

  const res = rest.reduce((acc, current) => {
    const value = _get(_isVector(current) ? current[prop] : current);

    const r = (() => {
      switch (operation) {
        case 'divide':
          if (value === 0) {
            return 0;
          }

          return acc / value;

        case 'add':
          return acc + value;

        case 'sub':
          return acc - value;

        case 'multiply':
          return acc * value;

        default:
          return acc;
      }
    })();

    return r;
  }, initial);
  return res;
};

const useSharedVector = (x, y = x) => {
  return {
    x: (0, _reactNativeReanimated.useSharedValue)(x),
    y: (0, _reactNativeReanimated.useSharedValue)(y)
  };
};

exports.useSharedVector = useSharedVector;

const create = (x, y) => {
  'worklet';

  return {
    x,
    y
  };
};

exports.create = create;

const add = vectors => {
  'worklet';

  return {
    x: _reduce('add', 'x', vectors),
    y: _reduce('add', 'y', vectors)
  };
};

exports.add = add;

const sub = vectors => {
  'worklet';

  return {
    x: _reduce('sub', 'x', vectors),
    y: _reduce('sub', 'y', vectors)
  };
};

exports.sub = sub;

const divide = vectors => {
  'worklet';

  return {
    x: _reduce('divide', 'x', vectors),
    y: _reduce('divide', 'y', vectors)
  };
};

exports.divide = divide;

const multiply = vectors => {
  'worklet';

  return {
    x: _reduce('multiply', 'x', vectors),
    y: _reduce('multiply', 'y', vectors)
  };
};

exports.multiply = multiply;

const invert = vector => {
  'worklet';

  return {
    x: _get(vector.x) * -1,
    y: _get(vector.y) * -1
  };
};

exports.invert = invert;

const set = (vector, value) => {
  'worklet';

  const x = _get(_isVector(value) ? value.x : value);

  const y = _get(_isVector(value) ? value.y : value);

  if (typeof vector.x.value !== 'undefined') {
    vector.x.value = x;
    vector.y.value = y;
  } else {
    vector.x = x;
    vector.y = y;
  }
};

exports.set = set;

const min = vectors => {
  'worklet';

  const getMin = prop => {
    return Math.min.apply(void 0, vectors.map(item => _get(_isVector(item) ? item[prop] : item)));
  };

  return {
    x: getMin('x'),
    y: getMin('y')
  };
};

exports.min = min;

const max = vectors => {
  'worklet';

  const getMax = prop => Math.max.apply(void 0, vectors.map(item => _get(_isVector(item) ? item[prop] : item)));

  return {
    x: getMax('x'),
    y: getMax('y')
  };
};

exports.max = max;

const clamp = (value, lowerBound, upperBound) => {
  'worklet';

  return min([max([lowerBound, value]), upperBound]);
};

exports.clamp = clamp;

const eq = (vector, value) => {
  'worklet';

  const x = _get(_isVector(value) ? value.x : value);

  const y = _get(_isVector(value) ? value.y : value);

  return _get(vector.x) === x && _get(vector.y) === y;
};

exports.eq = eq;
//# sourceMappingURL=vectors.js.map