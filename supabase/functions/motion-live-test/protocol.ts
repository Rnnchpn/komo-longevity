// GÉNÉRÉ par scripts/motion-protocol-sync.mjs depuis pulse-v14-src/motion-protocol.mjs.
// Ne pas modifier à la main : éditer la source puis relancer le script.
export const SPEC:any={
 "protocol": {
  "id": "KOMO_MOTION",
  "version": "2.1.0",
  "code": "KOMO_MOTION_V2",
  "mode": "CORE",
  "device_set": [
   "forcedecks_mini",
   "dynamo_plus",
   "iphone_camera",
   "stopwatch",
   "tape"
  ]
 },
 "steps": [
  {
   "id": "anthropometry",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "height_cm",
     "min": 100,
     "max": 230,
     "decimals": 1
    },
    {
     "key": "body_mass_kg",
     "min": 25,
     "max": 250,
     "decimals": 1
    }
   ],
   "choices": [
    {
     "key": "footwear",
     "options": [
      "barefoot",
      "socks",
      "shoes"
     ]
    },
    {
     "key": "walking_aid",
     "options": [
      "none",
      "cane",
      "walker",
      "other"
     ]
    }
   ]
  },
  {
   "id": "fd_quiet_stand",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "fd_qs_excursion_mm",
     "min": 0,
     "max": 10000,
     "decimals": 1
    },
    {
     "key": "fd_qs_ellipse_mm2",
     "min": 0,
     "max": 100000,
     "decimals": 1
    },
    {
     "key": "fd_qs_asym_pct",
     "min": 0,
     "max": 100,
     "decimals": 1
    }
   ],
   "choices": [
    {
     "key": "fd_qs_asym_side",
     "options": [
      "left",
      "right",
      "balanced"
     ]
    }
   ]
  },
  {
   "id": "fd_sts",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "fd_sts_asym_pct",
     "min": 0,
     "max": 100,
     "decimals": 1
    }
   ],
   "choices": [
    {
     "key": "fd_sts_asym_side",
     "options": [
      "left",
      "right",
      "balanced"
     ]
    }
   ]
  },
  {
   "id": "posture",
   "kind": "observation",
   "duration": 0,
   "options": [
    "neutral",
    "apparent_offset",
    "not_interpretable"
   ]
  },
  {
   "id": "gait_4m",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "gait_4m_s_1",
     "min": 1,
     "max": 30,
     "decimals": 2
    },
    {
     "key": "gait_4m_s_2",
     "min": 1,
     "max": 30,
     "decimals": 2
    }
   ],
   "choices": []
  },
  {
   "id": "two_step",
   "kind": "two_step",
   "duration": 0,
   "unit": "cm",
   "max": 650,
   "integer": false
  },
  {
   "id": "unipodal_left",
   "kind": "balance",
   "duration": 30,
   "unit": "seconds",
   "max": 30,
   "integer": false
  },
  {
   "id": "unipodal_right",
   "kind": "balance",
   "duration": 30,
   "unit": "seconds",
   "max": 30,
   "integer": false
  },
  {
   "id": "arms",
   "kind": "count",
   "duration": 30,
   "unit": "movements",
   "max": 100,
   "integer": true
  },
  {
   "id": "dynamo_grip",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "grip_left_n",
     "min": 0,
     "max": 1500,
     "decimals": 1
    },
    {
     "key": "grip_right_n",
     "min": 0,
     "max": 1500,
     "decimals": 1
    }
   ],
   "choices": [],
   "pair": [
    "grip_left_n",
    "grip_right_n"
   ]
  },
  {
   "id": "dynamo_knee_ext",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "knee_ext_left_n",
     "min": 0,
     "max": 2500,
     "decimals": 1
    },
    {
     "key": "knee_ext_right_n",
     "min": 0,
     "max": 2500,
     "decimals": 1
    },
    {
     "key": "knee_pad_distance_cm",
     "min": 0,
     "max": 60,
     "decimals": 1,
     "optional": true
    }
   ],
   "choices": [],
   "pair": [
    "knee_ext_left_n",
    "knee_ext_right_n"
   ]
  },
  {
   "id": "dynamo_hip_abd",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "hip_abd_left_n",
     "min": 0,
     "max": 2000,
     "decimals": 1
    },
    {
     "key": "hip_abd_right_n",
     "min": 0,
     "max": 2000,
     "decimals": 1
    }
   ],
   "choices": [],
   "pair": [
    "hip_abd_left_n",
    "hip_abd_right_n"
   ]
  },
  {
   "id": "sts",
   "kind": "count",
   "duration": 30,
   "unit": "repetitions",
   "max": 100,
   "integer": true
  }
 ],
 "skip_reasons": [
  "safety",
  "pain",
  "refusal",
  "device_unavailable",
  "technical_error",
  "other"
 ]
};
