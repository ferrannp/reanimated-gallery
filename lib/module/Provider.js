import React, { useContext, useRef, useEffect, useCallback, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';
import { GalleryState } from './GalleryState';
import { ImagePager } from './Pager';
const GalleryOverlayContext = /*#__PURE__*/React.createContext(null);
const GalleryContext = /*#__PURE__*/React.createContext(null);
export function useGalleryItem({
  index,
  item
}) {
  const gallery = useContext(GalleryContext);
  const ref = useRef();
  const opacity = useSharedValue(1);
  useEffect(() => {
    gallery.addImage({
      ref,
      index,
      item,
      opacity
    });
  }, []);
  const onPress = useCallback(() => {
    gallery.onShow(index);
  }, []);
  return {
    opacity,
    ref,
    onPress
  };
}
export function GalleryProvider({
  totalCount,
  children
}) {
  const setActiveGallery = useContext(GalleryOverlayContext);
  const [gallery] = useState(new GalleryState(setActiveGallery, totalCount));
  return /*#__PURE__*/React.createElement(GalleryContext.Provider, {
    value: gallery
  }, children);
}
export function GalleryOverlay({
  children
}) {
  const [activeGallery, setActiveGallery] = useState(null);
  return /*#__PURE__*/React.createElement(GalleryOverlayContext.Provider, {
    value: setActiveGallery
  }, /*#__PURE__*/React.createElement(View, {
    style: StyleSheet.absoluteFill
  }, children, activeGallery && /*#__PURE__*/React.createElement(ImagePager, {
    gallery: activeGallery
  })));
}
//# sourceMappingURL=Provider.js.map