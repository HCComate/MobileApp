export const MOCK_RAW_LOGS = [
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_003",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 71,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "System Recovery Success",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 37.5,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:45:10.001",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_003",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 70,
      machine_status: "RUN",
      status_info: [
        {
          code: "AN-CN-02",
          msg: "WebSocket Reconnected",
          severity: "MEDIUM",
          direction: "NETWORK",
          part_location: "MODEM_01",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.98,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.2,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:44:05.123",
    },
  },
  {
    header: {
      device_id: "RASP_PI_02",
      batch_id: "BATCH_003",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 69,
      machine_status: "ERROR",
      status_info: [
        {
          code: "HM-PO-01",
          msg: "Emergency Stop Pressed",
          severity: "CRITICAL",
          direction: "PANEL",
          part_location: "STOP_BTN_01",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "STOP",
        confidence: 1.0,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 39.5,
        vibration_x: 0.0,
        vibration_y: 0.0,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:42:12.441",
    },
  },
  {
    header: {
      device_id: "RASP_PI_03",
      batch_id: "BATCH_003",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 68,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-PR-41",
          msg: "Component Missing Error",
          severity: "CRITICAL",
          direction: "TOP",
          part_location: "ZONE_A1",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "MISSING",
        confidence: 0.95,
        inspection_area: "ZONE_A1",
        image_url: "http://192.168.0.15/images/68_ng.jpg",
      },
      sensor_data: {
        temperature: 40.1,
        vibration_x: 0.02,
        vibration_y: 0.02,
        illumination: 1200,
      },
      timestamp: "2026-05-01 17:40:05.005",
    },
  },
  {
    header: {
      device_id: "RASP_PI_06",
      batch_id: "BATCH_003",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 67,
      machine_status: "ERROR",
      status_info: [
        {
          code: "HM-TE-01",
          msg: "Main Motor Overheat",
          severity: "HIGH",
          direction: "INTERNAL",
          part_location: "DRIVE_MOTOR",
          is_capture_required: false,
        },
        {
          code: "SV-PR-44",
          msg: "Crack Detected",
          severity: "HIGH",
          direction: "SIDE",
          part_location: "ZONE_C2",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "CRACK",
        confidence: 0.88,
        inspection_area: "ZONE_C2",
        image_url: "http://192.168.0.15/images/67_ng.jpg",
      },
      sensor_data: {
        temperature: 68.5,
        vibration_x: 0.12,
        vibration_y: 0.1,
        illumination: 1200,
      },
      timestamp: "2026-05-01 17:38:15.882",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_003",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 66,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "Vision Inspection OK",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.5,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:35:05.001",
    },
  },
  {
    header: {
      device_id: "RASP_PI_08",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 65,
      machine_status: "ERROR",
      status_info: [
        {
          code: "HS-NE-01",
          msg: "LAN Cable Loose",
          severity: "HIGH",
          direction: "BACK",
          part_location: "PORT_02",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.97,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 37.8,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:32:10.112",
    },
  },
  {
    header: {
      device_id: "RASP_PI_04",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 64,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-PR-43",
          msg: "Internal Burr Detected",
          severity: "HIGH",
          direction: "INNER",
          part_location: "HOLE_B",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "BURR",
        confidence: 0.91,
        inspection_area: "HOLE_B",
        image_url: "http://192.168.0.15/images/64_ng.jpg",
      },
      sensor_data: {
        temperature: 38.9,
        vibration_x: 0.02,
        vibration_y: 0.02,
        illumination: 1200,
      },
      timestamp: "2026-05-01 17:30:12.771",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 63,
      machine_status: "RUN",
      status_info: [
        {
          code: "AM-NT-02",
          msg: "Log Transmission Delay",
          severity: "MEDIUM",
          direction: "SYSTEM",
          part_location: "BUFFER",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.2,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:28:05.002",
    },
  },
  {
    header: {
      device_id: "RASP_PI_05",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 62,
      machine_status: "ERROR",
      status_info: [
        {
          code: "HV-PR-01",
          msg: "Camera Servo Error",
          severity: "HIGH",
          direction: "CAMERA",
          part_location: "LENS_01",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "BLUR",
        confidence: 0.45,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 39.5,
        vibration_x: 0.05,
        vibration_y: 0.04,
        illumination: 1000,
      },
      timestamp: "2026-05-01 17:25:55.332",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 61,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-PR-45",
          msg: "Surface Scratch Detected",
          severity: "MEDIUM",
          direction: "TOP",
          part_location: "ZONE_B1",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "SCRATCH",
        confidence: 0.82,
        inspection_area: "ZONE_B1",
        image_url: "http://192.168.0.15/images/61_ng.jpg",
      },
      sensor_data: {
        temperature: 38.1,
        vibration_x: 0.02,
        vibration_y: 0.02,
        illumination: 1200,
      },
      timestamp: "2026-05-01 17:22:20.901",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 60,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "Vision Inspection OK",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.4,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:20:10.005",
    },
  },
  {
    header: {
      device_id: "RASP_PI_02",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 59,
      machine_status: "ERROR",
      status_info: [
        {
          code: "AD-PR-01",
          msg: "JSON Parsing Error",
          severity: "MEDIUM",
          direction: "INTERFACE",
          part_location: "API_GATEWAY",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 37.5,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:18:45.662",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 58,
      machine_status: "ERROR",
      status_info: [
        {
          code: "AH-CN-01",
          msg: "Comms Link Failed",
          severity: "HIGH",
          direction: "CONTROLLER",
          part_location: "PLC_UNIT",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "COMM_FAIL",
        confidence: 0.0,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.0,
        vibration_x: 0.0,
        vibration_y: 0.0,
        illumination: 0,
      },
      timestamp: "2026-05-01 17:15:30.111",
    },
  },
  {
    header: {
      device_id: "RASP_PI_03",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 57,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "Vision Inspection OK",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.2,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:12:05.001",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 56,
      machine_status: "ERROR",
      status_info: [
        {
          code: "HV-PR-03",
          msg: "Camera Cable Noise",
          severity: "MEDIUM",
          direction: "CAMERA",
          part_location: "CABLE_V3",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.92,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.5,
        vibration_x: 0.05,
        vibration_y: 0.05,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:10:15.442",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_002",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 55,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-VA-41",
          msg: "AI Confidence Low",
          severity: "MEDIUM",
          direction: "SIDE",
          part_location: "ZONE_D4",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "UNKNOWN",
        confidence: 0.61,
        inspection_area: "ZONE_D4",
        image_url: "http://192.168.0.15/images/55_ng.jpg",
      },
      sensor_data: {
        temperature: 38.8,
        vibration_x: 0.02,
        vibration_y: 0.02,
        illumination: 1100,
      },
      timestamp: "2026-05-01 17:08:50.123",
    },
  },
  {
    header: {
      device_id: "RASP_PI_07",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 54,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "Vision Inspection OK",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.4,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:05:05.001",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 53,
      machine_status: "ERROR",
      status_info: [
        {
          code: "HM-PR-01",
          msg: "Limit Sensor Error",
          severity: "HIGH",
          direction: "ARM",
          part_location: "LIMIT_SW_A",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "POSITION",
        confidence: 0.0,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.9,
        vibration_x: 0.15,
        vibration_y: 0.12,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:02:40.887",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 52,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-PR-46",
          msg: "Misaligned Part",
          severity: "MEDIUM",
          direction: "TOP",
          part_location: "ZONE_A2",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "ALIGN",
        confidence: 0.78,
        inspection_area: "ZONE_A2",
        image_url: "http://192.168.0.15/images/52_ng.jpg",
      },
      sensor_data: {
        temperature: 38.2,
        vibration_x: 0.03,
        vibration_y: 0.03,
        illumination: 1250,
      },
      timestamp: "2026-05-01 17:00:20.331",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 51,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "Cleaning Vision Lens",
          severity: "LOW",
          direction: "CAMERA",
          part_location: "LENS_01",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 37.9,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 16:58:15.005",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 50,
      machine_status: "ERROR",
      status_info: [
        {
          code: "HM-PO-02",
          msg: "Current Trip Detected",
          severity: "CRITICAL",
          direction: "POWER",
          part_location: "PSU_01",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "POWER_LOSS",
        confidence: 0.0,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 45.5,
        vibration_x: 0.0,
        vibration_y: 0.0,
        illumination: 0,
      },
      timestamp: "2026-05-01 16:55:10.992",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 49,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "Vision Inspection OK",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.3,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 16:52:05.001",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 48,
      machine_status: "ERROR",
      status_info: [
        {
          code: "AN-VL-01",
          msg: "Sensor Buffer Overflow",
          severity: "HIGH",
          direction: "SYSTEM",
          part_location: "RAM_STACK",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 39.1,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 16:50:45.123",
    },
  },
  {
    header: {
      device_id: "RASP_PI_09",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 47,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-PR-42",
          msg: "Dent Detected",
          severity: "HIGH",
          direction: "SIDE",
          part_location: "ZONE_C1",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "DENT",
        confidence: 0.89,
        inspection_area: "ZONE_C1",
        image_url: "http://192.168.0.15/images/47_ng.jpg",
      },
      sensor_data: {
        temperature: 38.5,
        vibration_x: 0.02,
        vibration_y: 0.02,
        illumination: 1250,
      },
      timestamp: "2026-05-01 16:48:12.771",
    },
  },
  {
    header: {
      device_id: "RASP_PI_02",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 46,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "Vision Inspection OK",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.4,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-05-01 16:45:05.001",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 45,
      machine_status: "RUN",
      status_info: [
        {
          code: "NORMAL",
          msg: "System Initializing...",
          severity: "LOW",
          direction: "SYSTEM",
          part_location: "CORE",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 1.0,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 36.5,
        vibration_x: 0.0,
        vibration_y: 0.0,
        illumination: 1250,
      },
      timestamp: "2026-05-01 16:42:05.001",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 44,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-VS-PR-53",
          msg: "Component Missing Error",
          severity: "CRITICAL",
          direction: "TOP",
          part_location: "MAIN_PCB_ZONE_A",
          is_capture_required: true,
        },
        {
          code: "HV-MC-TE-52",
          msg: "Main Motor Overheat Critical",
          severity: "HIGH",
          direction: "INTERNAL",
          part_location: "DRIVE_MOTOR_01",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "MISSING",
        confidence: 0.95,
        inspection_area: "ZONE_A1",
        image_url: "http://192.168.0.15/images/44_ng_missing.jpg",
      },
      sensor_data: {
        temperature: 65.8,
        vibration_x: 0.15,
        vibration_y: 0.12,
        illumination: 1200,
      },
      timestamp: "2026-04-10 19:35:20.555",
    },
  },
  {
    header: {
      device_id: "RASP_PI_09",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 43,
      machine_status: "ERROR",
      status_info: [
        {
          code: "SV-VS-PR-51",
          msg: "Surface Scratch Detected",
          severity: "MEDIUM",
          direction: "SIDE_LEFT",
          part_location: "ZONE_B3",
          is_capture_required: true,
        },
      ],
      vision_result: {
        result: "NG",
        defect_type: "SCRATCH",
        confidence: 0.82,
        inspection_area: "ZONE_B3",
        image_url: "http://192.168.0.15/images/43_ng_side.jpg",
      },
      sensor_data: {
        temperature: 40.2,
        vibration_x: 0.02,
        vibration_y: 0.02,
        illumination: 1200,
      },
      timestamp: "2026-04-10 19:31:05.123",
    },
  },
  {
    header: {
      device_id: "RASP_PI_01",
      batch_id: "BATCH_001",
      model_name: "SMT_CHIP_A20",
    },
    body: {
      sequence: 42,
      machine_status: "RUN",
      status_info: [
        {
          code: "SV-VS-PR-00",
          msg: "Vision Inspection OK",
          severity: "LOW",
          direction: "TOP",
          part_location: "ZONE_ALL",
          is_capture_required: false,
        },
      ],
      vision_result: {
        result: "OK",
        defect_type: "NONE",
        confidence: 0.99,
        inspection_area: "ALL",
        image_url: null,
      },
      sensor_data: {
        temperature: 38.5,
        vibration_x: 0.01,
        vibration_y: 0.01,
        illumination: 1250,
      },
      timestamp: "2026-04-10 19:30:00.001",
    },
  },
];
