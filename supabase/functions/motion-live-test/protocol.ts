// GÉNÉRÉ par scripts/motion-protocol-sync.mjs depuis pulse-v14-src/motion-protocol.mjs.
// Ne pas modifier à la main : éditer la source puis relancer le script.
export const SPEC:any={
 "protocol": {
  "id": "KOMO_MOTION",
  "version": "2.5.0",
  "code": "KOMO_MOTION_V2",
  "mode": "CORE",
  "device_set": [
   "forcedecks_mini",
   "dynamo_plus",
   "stopwatch",
   "tape"
  ]
 },
 "steps": [
  {
   "id": "dynamo_hip_flex",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "hip_flex_left_n",
     "min": 0,
     "max": 2000,
     "decimals": 1
    },
    {
     "key": "hip_flex_right_n",
     "min": 0,
     "max": 2000,
     "decimals": 1
    }
   ],
   "choices": [],
   "pair": [
    "hip_flex_left_n",
    "hip_flex_right_n"
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
   "id": "dynamo_knee_flex",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "knee_flex_left_n",
     "min": 0,
     "max": 2000,
     "decimals": 1
    },
    {
     "key": "knee_flex_right_n",
     "min": 0,
     "max": 2000,
     "decimals": 1
    }
   ],
   "choices": [],
   "pair": [
    "knee_flex_left_n",
    "knee_flex_right_n"
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
   ],
   "method": "HIP_ABD_SEATED_90"
  },
  {
   "id": "dynamo_elbow_flex",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "elbow_flex_left_n",
     "min": 0,
     "max": 1500,
     "decimals": 1
    },
    {
     "key": "elbow_flex_right_n",
     "min": 0,
     "max": 1500,
     "decimals": 1
    }
   ],
   "choices": [],
   "pair": [
    "elbow_flex_left_n",
    "elbow_flex_right_n"
   ]
  },
  {
   "id": "anthropometry",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "body_mass_kg",
     "min": 25,
     "max": 250,
     "decimals": 1
    },
    {
     "key": "height_cm",
     "min": 100,
     "max": 230,
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
     "key": "fd_qs_cop_ml_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1
    },
    {
     "key": "fd_qs_cop_ap_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1
    },
    {
     "key": "fd_qs_velocity_mms",
     "min": 0,
     "max": 1000,
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
   "id": "fd_quiet_stand_ec",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "fd_qsec_cop_ml_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1
    },
    {
     "key": "fd_qsec_cop_ap_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1
    },
    {
     "key": "fd_qsec_velocity_mms",
     "min": 0,
     "max": 1000,
     "decimals": 1
    }
   ],
   "choices": []
  },
  {
   "id": "fd_sts",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "fd_sts_time_to_stand_s",
     "min": 0,
     "max": 20,
     "decimals": 2
    },
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
   "id": "unipodal_left",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "sls_left_hold_s",
     "min": 0,
     "max": 30,
     "decimals": 1
    },
    {
     "key": "sls_left_velocity_mms",
     "min": 0,
     "max": 1000,
     "decimals": 1,
     "optional": true
    },
    {
     "key": "sls_left_cop_ml_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1,
     "optional": true
    },
    {
     "key": "sls_left_cop_ap_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1,
     "optional": true
    }
   ],
   "choices": [],
   "method": "SLS_FORCEDECKS_EO_30S_BEST_OF_2",
   "value_field": "sls_left_hold_s"
  },
  {
   "id": "unipodal_right",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "sls_right_hold_s",
     "min": 0,
     "max": 30,
     "decimals": 1
    },
    {
     "key": "sls_right_velocity_mms",
     "min": 0,
     "max": 1000,
     "decimals": 1,
     "optional": true
    },
    {
     "key": "sls_right_cop_ml_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1,
     "optional": true
    },
    {
     "key": "sls_right_cop_ap_mm",
     "min": 0,
     "max": 1000,
     "decimals": 1,
     "optional": true
    }
   ],
   "choices": [],
   "method": "SLS_FORCEDECKS_EO_30S_BEST_OF_2",
   "value_field": "sls_right_hold_s"
  },
  {
   "id": "fd_cmj",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "cmj_height_cm",
     "min": 0,
     "max": 80,
     "decimals": 1
    },
    {
     "key": "cmj_peak_power_wkg",
     "min": 0,
     "max": 100,
     "decimals": 1
    },
    {
     "key": "cmj_asym_pct",
     "min": 0,
     "max": 100,
     "decimals": 1,
     "optional": true
    }
   ],
   "choices": []
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
   "choices": [],
   "method": "GAIT_4M_STANDING_START_BEST_OF_2"
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
 "complements": [
  {
   "id": "posture_photo",
   "kind": "fields",
   "duration": 0,
   "fields": [
    {
     "key": "pp_head_forward_deg",
     "min": -45,
     "max": 80,
     "decimals": 1
    },
    {
     "key": "pp_trunk_lean_deg",
     "min": -45,
     "max": 45,
     "decimals": 1
    },
    {
     "key": "pp_hip_shift_deg",
     "min": -45,
     "max": 45,
     "decimals": 1
    },
    {
     "key": "pp_knee_flex_deg",
     "min": -30,
     "max": 60,
     "decimals": 1
    },
    {
     "key": "pp_global_lean_deg",
     "min": -30,
     "max": 30,
     "decimals": 1
    }
   ],
   "choices": [
    {
     "key": "pp_observation",
     "options": [
      "neutral",
      "apparent_offset",
      "not_interpretable"
     ]
    },
    {
     "key": "pp_side",
     "options": [
      "right",
      "left"
     ]
    }
   ]
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
