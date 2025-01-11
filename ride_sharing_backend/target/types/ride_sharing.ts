export type RideSharing = {
  "version": "0.1.0",
  "name": "ride_sharing",
  "instructions": [
    {
      "name": "createRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rider",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fare",
          "type": "u64"
        }
      ]
    },
    {
      "name": "acceptRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driver",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "completeRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "byRider",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ride",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rider",
            "type": "publicKey"
          },
          {
            "name": "driver",
            "type": "publicKey"
          },
          {
            "name": "fare",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "RideStatus"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RideStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Requested"
          },
          {
            "name": "Accepted"
          },
          {
            "name": "Completed"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "RideAlreadyCompleted"
    },
    {
      "code": 6001,
      "name": "InvalidRideState"
    }
  ]
};

export const IDL: RideSharing = {
  "version": "0.1.0",
  "name": "ride_sharing",
  "instructions": [
    {
      "name": "createRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rider",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fare",
          "type": "u64"
        }
      ]
    },
    {
      "name": "acceptRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driver",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "completeRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelRide",
      "accounts": [
        {
          "name": "ride",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "byRider",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ride",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rider",
            "type": "publicKey"
          },
          {
            "name": "driver",
            "type": "publicKey"
          },
          {
            "name": "fare",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "RideStatus"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RideStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Requested"
          },
          {
            "name": "Accepted"
          },
          {
            "name": "Completed"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "RideAlreadyCompleted"
    },
    {
      "code": 6001,
      "name": "InvalidRideState"
    }
  ]
};
