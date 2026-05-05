export interface Device {
  id: string;
  name: string;
  status: "RUN" | "ERROR" | "OFF";
  type: "RASPBERRY_PI" | "CONTROLLER";
}

export const MOCK_DEVICES: Device[] = [
  { id: "RASP_PI_01", name: "장비 A", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_02", name: "장비 B", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_03", name: "장비 C", status: "ERROR", type: "RASPBERRY_PI" },
  { id: "RASP_PI_04", name: "장비 D", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_05", name: "장비 E", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_06", name: "장비 F", status: "OFF", type: "RASPBERRY_PI" },
  { id: "RASP_PI_07", name: "장비 G", status: "ERROR", type: "RASPBERRY_PI" },
  { id: "RASP_PI_08", name: "장비 H", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_09", name: "장비 I", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_10", name: "장비 J", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_11", name: "장비 K", status: "RUN", type: "RASPBERRY_PI" },
  { id: "RASP_PI_12", name: "장비 L", status: "RUN", type: "RASPBERRY_PI" },
];
