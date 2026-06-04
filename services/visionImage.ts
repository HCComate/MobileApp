// services/visionImage.ts
// 비전 검사 결과 → 표시할 이미지 결정 (모니터링/상세 공용)
//
// 이미지는 앱 번들에 포함된 로컬 에셋을 사용한다(네트워크 요청 없음).
// 서버는 "/static/images/vision_ok.png" 같은 경로 또는 결함 종류(defect_type)만
// 알려주고, 그 값에 대응하는 로컬 이미지를 띄운다. 느린 통신에서도 즉시 표시된다.

import { ImageSourcePropType } from "react-native";

// 결함 종류(defect_type) → 이미지 키 매핑
const DEFECT_IMAGE_KEY: Record<string, string> = {
  CRACK: "crack",
  DENT: "dent",
  MISALIGN: "misaligned",
  MISALIGNED: "misaligned",
  MISSING: "missing",
  OPEN: "open",
  SCRATCH: "scratch",
  MACHINE_ERROR: "machine_error",
};

// 이미지 키 → 번들 로컬 에셋 (require는 정적이어야 하므로 객체로 나열)
const LOCAL_VISION_IMAGES: Record<string, ImageSourcePropType> = {
  ok: require("../assets/images/vision/vision_ok.png"),
  crack: require("../assets/images/vision/vision_crack.png"),
  dent: require("../assets/images/vision/vision_dent.png"),
  misaligned: require("../assets/images/vision/vision_misaligned.png"),
  missing: require("../assets/images/vision/vision_missing.png"),
  open: require("../assets/images/vision/vision_open.png"),
  scratch: require("../assets/images/vision/vision_scratch.png"),
  machine_error: require("../assets/images/vision/vision_machine_error.png"),
};

export interface VisionLike {
  result?: string | null; // "OK" | "NG"
  defectType?: string | null;
  imageUrl?: string | null; // 예: "/static/images/vision_crack.png"
}

// 서버 경로/파일명에서 이미지 키 추출 (".../vision_crack.png" → "crack")
function keyFromImageUrl(url: string): string | null {
  const file = url.split(/[\\/]/).pop() || "";
  const base = file.replace(/\.[^.]+$/, ""); // 확장자 제거
  const key = base.replace(/^vision_/i, "").toLowerCase();
  return key in LOCAL_VISION_IMAGES ? key : null;
}

/**
 * 비전 결과에 해당하는 로컬 이미지 소스를 반환한다.
 * 표시할 이미지를 특정할 수 없으면 null (호출부에서 카메라 아이콘 fallback).
 */
export function resolveVisionImageSource(
  vision?: VisionLike | null,
): ImageSourcePropType | null {
  if (!vision) return null;

  // 1. 서버가 준 경로의 파일명으로 매칭
  if (vision.imageUrl) {
    const key = keyFromImageUrl(vision.imageUrl);
    if (key) return LOCAL_VISION_IMAGES[key];
  }

  const result = (vision.result || "").toUpperCase();

  // 2. 불량(NG) → 결함 종류별 이미지
  if (result === "NG") {
    const key = DEFECT_IMAGE_KEY[(vision.defectType || "").toUpperCase()];
    return key ? LOCAL_VISION_IMAGES[key] : null;
  }

  // 3. 정상(OK) → vision_ok
  if (result === "OK") return LOCAL_VISION_IMAGES.ok;

  // 4. 비전 정보 없음 → 표시할 이미지 없음
  return null;
}
