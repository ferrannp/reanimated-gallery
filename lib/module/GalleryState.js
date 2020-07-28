function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { normalizeDimensions } from './utils';
export class GalleryState {
  constructor(fn, totalCount) {
    _defineProperty(this, "_showFunction", void 0);

    _defineProperty(this, "currentIndex", void 0);

    _defineProperty(this, "_onChangeListeners", void 0);

    _defineProperty(this, "images", void 0);

    _defineProperty(this, "totalCount", void 0);

    this._showFunction = fn;
    this.images = [];
    this.currentIndex = null;
    this._onChangeListeners = [];
    this.totalCount = totalCount;
  }

  get activeItem() {
    if (this.currentIndex === null) {
      return null;
    }

    return this.images[this.currentIndex];
  }

  addImage(item) {
    if (this.images[item.index]) {
      return;
    }

    this.images[item.index] = item;
  }

  async setActiveIndex(index) {
    this.currentIndex = index;
    await this._measure(this.activeItem);

    this._triggerListeners(this.activeItem);
  }

  addOnChangeListener(cb) {
    this._onChangeListeners.push(cb);

    return () => {
      this._onChangeListeners.filter(i => i === cb);
    };
  }

  async onShow(index) {
    await this.setActiveIndex(index);

    this._showFunction(this);
  }

  onClose() {
    this._showFunction(null);

    this._clearListener();

    this.currentIndex = null;
  }

  _clearListener() {
    this._onChangeListeners = [];
  }

  _measure(item) {
    return new Promise((resolve, reject) => item.ref.current.getNode().measure((x, y, width, height, pageX, pageY) => {
      if (width === 0 && height === 0) {
        reject();
        return;
      }

      const {
        targetWidth,
        targetHeight
      } = normalizeDimensions(item.item);
      item.measurements = {
        width,
        height,
        x: pageX,
        y: pageY,
        targetHeight,
        targetWidth
      };
      resolve();
    }));
  }

  _triggerListeners(item) {
    this._onChangeListeners.forEach(cb => cb(item));
  }

}
//# sourceMappingURL=GalleryState.js.map