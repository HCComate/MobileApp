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
  // 이미지 로드 실패 시 빈칸으로 남지 않도록 fallback으로 전환.
  // (source가 있으면 <Image>를 그리는데, 번들/에셋 로드가 실패하면 onError 없이는
  //  아무것도 안 보였다 — 카메라 아이콘이라도 떠야 "로드 실패"임을 알 수 있다.)
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    setFailed(false);
  }, [source]);

  if (!source || failed) {
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
      onError={(e) => {
        console.warn(
          "[VisionImage] 이미지 로드 실패:",
          e?.nativeEvent?.error ?? e,
        );
        setFailed(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
