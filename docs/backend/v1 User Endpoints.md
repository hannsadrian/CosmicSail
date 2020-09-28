# v1 User Endpoints

> **Important:** all routes have to be prefixed with `/v1`<br>
> E.g. `https://backend.cosmicsail.online/v1/status`

API routes that are described in this document are used by our frontend,
enabling users to manage their boats, view telemetry data and configure boat hardware.

## General information

To use user endpoints, every request has to have an
Authorization header including a bearer token. (see [Authentication](./Authentication.md))

**Error codes for missing/invalid Authentication**

`400` - Bad Request<br>
Authorization header not present

`403` - Forbidden<br>
Token invalid



# Status

Verify token and get user information.

### Request

POST `/status`

**Authorization:** Bearer Token<br>
**Query Params:** None<br>
**Body:** None<br>

### Response

`200` - Success
```json
{
  "payload": {
    "Username": "cosmicSailor",
    "FullName": "Cosmic Sailor",
    "Email": "vip@cosmicsail.online",
    "IsAdmin": false
  }
}
```

# Boats

Register new and get existing boats.

## Register Boat

Register a new boat.

### Request

POST `/boats`

**Authorization:** Bearer Token<br>
**Query Params:** None<br>
**Body:**
| Name    | Description     | Type       | Required |
| ------- | --------------- | ---------- | -------- |
| Name    | Name of boat    | String     | Yes      |
| Series  | Production line | String     | Yes      |
| Make    | Manufacturer    | String     | Yes      |

### Response

`200` - Success<br>
The token has to be used on boat side and is only displayed **once**.
```json
{
  "Token": ...,
  "Boat": {
    "BoatEmblem": "zUi7o",
    "Name": "Rasselbande",
    "Owner": "cosmicSailor"
  }
}
```

`400` - Bad Request<br>
1. Body could not be parsed
2. Error while creating Database entry

`500` - Internal Server Error<br>
Please contact us.

## Get Boats

Get all boats the token/user has access to.

### Request

GET `/boats`

**Authorization:** Bearer Token<br>
**Query Params:** None<br>
**Body:** None

### Response

`200` - Success<br>
```json
[
  {
    "BoatEmblem": "zUi7o",
    "Name": "Rasselbande",
    "Series": "Model 3000",
    "Make": "Selfmade",
    "Online": false,
    "LastOnline": ...,
    "Motors": [
      {
        "Name": "Rudder",
        "Channel": 1,
        "Min": 2000,
        "Max": 3000,
        "Default": 2500,
        "Cycle": 24
      },
      ...
    ],
    "Sensors": [
      {
        "Name": "Position",
        "Channel": "/dev/ttyAMA0",
        "Type": "gps"
      },
      ...
    ]
  },
  ...
]
```

# Trips

Get all trips a boat has made.

### Request

GET `/boats/:emblem/trips`

**Authorization:** Bearer Token<br>
**Query Params:** None<br>
**Body:** None

### Response

`200` - Success<br>
```json
[
  {
    "ID": 1,
    "BoatID": 1,
    "Name": "16:24 25.9.2020",
    "StartDate": ...,
    "EndDate": ...,
    "Datapoints": [
      {
        "TripID": 1,
        "Timestamp": ...,
        "Data": ...
      }
    ]
  },
  ...
]
```

`403` - Forbidden<br>
User has no access to the requested boat

`404` - Not found<br>
Error while loading trips


TODO: Hardware(Post, Put, Delete)
