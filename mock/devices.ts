export interface Device {
  id: string;
  name: string;
  type: "RASPBERRY_PI" | "CONTROLLER";
}

export const MOCK_DEVICES: Device[] = Array.from({ length: 25 }, (_, i) => {
  const idNum = i + 1;
  const idStr = String(idNum).padStart(2, "0");
  return {
    id: `RASP_PI_${idStr}`,
    name: `장비 ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ""}`,
    type: "RASPBERRY_PI",
  };
});
