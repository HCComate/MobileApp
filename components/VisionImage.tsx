// components/VisionImage.tsx
// 비전 검사 이미지 표시 컴포넌트.
// 앱 번들 내 로컬 이미지를 사용하므로 네트워크 요청이 없다.
// 매칭되는 이미지가 없으면 기존처럼 카메라 아이콘을 보여준다.

import React from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {
  resolveVisionImageSource,
  VisionLike,
} from "../services/visionImage";

interface Props {
  vision?: VisionLike | null;
  style?: StyleProp<ViewStyle>;
  iconSize?: number; // fallback 카메라 아이콘 크기
}

export default function VisionImage({ vision, style, iconSize = 28 }: Props) {
  const source = resolveVisionImageSource(vision);

  if (!source) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={{ fontSize: iconSize }}>🎥</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style as StyleProp<ImageStyle>}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
