# Showcase Hub

i want to build a project TicketNest like bookmyshow and built below apis so far, want to create working frontend modern ui ux  based on this api ans screenshot

{

openapi: "3.1.0",

info: {

title: "TicketNest API",

description: "Live-event ticket booking platform API",

version: "v1"

},

servers: [

{

url: "http://localhost:8080",

description: "Generated server url"

}

],

security: [

{

bearerAuth: [ ]

}

],

paths: {

/api/venues/{id}: {

get: {

tags: [

"venue-controller"

],

operationId: "getVenue",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/VenueResponse"

}

}

}

}

}

},

put: {

tags: [

"venue-controller"

],

operationId: "updateVenue",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/VenueRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/VenueResponse"

}

}

}

}

}

},

delete: {

tags: [

"venue-controller"

],

operationId: "deleteVenue",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

responses: {

200: {

description: "OK"

}

}

}

},

/api/shows/{id}: {

get: {

tags: [

"show-controller"

],

operationId: "getShow",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/ShowResponse"

}

}

}

}

}

},

put: {

tags: [

"show-controller"

],

operationId: "updateShow",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/ShowRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/ShowResponse"

}

}

}

}

}

},

delete: {

tags: [

"show-controller"

],

operationId: "deleteShow",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

responses: {

200: {

description: "OK"

}

}

}

},

/api/admin/users/{userId}/roles: {

put: {

tags: [

"admin-role-controller"

],

operationId: "replaceRoles",

parameters: [

{

name: "userId",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/RoleAssignmentRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/AdminUserResponse"

}

}

}

}

}

}

},

/api/admin/roles/{id}: {

get: {

tags: [

"admin-role-controller"

],

operationId: "role",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/RoleResponse"

}

}

}

}

}

},

put: {

tags: [

"admin-role-controller"

],

operationId: "update",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/RoleRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/RoleResponse"

}

}

}

}

}

},

delete: {

tags: [

"admin-role-controller"

],

operationId: "delete",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

responses: {

200: {

description: "OK"

}

}

}

},

/auth/register: {

post: {

tags: [

"auth-controller"

],

operationId: "register",

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/RegisterRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/RegisterResponse"

}

}

}

}

}

}

},

/auth/refresh: {

post: {

tags: [

"auth-controller"

],

operationId: "refresh",

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/RefreshRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/TokenResponse"

}

}

}

}

}

}

},

/auth/logout: {

post: {

tags: [

"auth-controller"

],

operationId: "logout",

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/LogoutRequest"

}

}

}

},

responses: {

200: {

description: "OK"

}

}

}

},

/auth/login: {

post: {

tags: [

"auth-controller"

],

operationId: "login",

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/LoginRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/LoginResponse"

}

}

}

}

}

}

},

/api/venues: {

get: {

tags: [

"venue-controller"

],

operationId: "getVenues",

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

type: "array",

items: {

$ref: "#/components/schemas/VenueResponse"

}

}

}

}

}

}

},

post: {

tags: [

"venue-controller"

],

operationId: "createVenue",

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/VenueRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/VenueResponse"

}

}

}

}

}

}

},

/api/venues/{id}/seats: {

get: {

tags: [

"venue-controller"

],

operationId: "getSeats",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

type: "array",

items: {

$ref: "#/components/schemas/SeatResponse"

}

}

}

}

}

}

},

post: {

tags: [

"venue-controller"

],

operationId: "createSeats",

parameters: [

{

name: "id",

in: "path",

required: true,

schema: {

type: "string",

format: "uuid"

}

}

],

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/SeatBatchCreateRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/SeatBatchCreateResponse"

}

}

}

}

}

}

},

/api/shows: {

get: {

tags: [

"show-controller"

],

operationId: "getShows",

parameters: [

{

name: "filter",

in: "query",

required: true,

schema: {

$ref: "#/components/schemas/ShowFilter"

}

},

{

name: "pageable",

in: "query",

required: true,

schema: {

$ref: "#/components/schemas/Pageable"

}

}

],

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/PageResponseShowResponse"

}

}

}

}

}

},

post: {

tags: [

"show-controller"

],

operationId: "createShow",

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/ShowRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/ShowResponse"

}

}

}

}

}

}

},

/api/admin/roles: {

get: {

tags: [

"admin-role-controller"

],

operationId: "roles",

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

type: "array",

items: {

$ref: "#/components/schemas/RoleResponse"

}

}

}

}

}

}

},

post: {

tags: [

"admin-role-controller"

],

operationId: "create",

requestBody: {

content: {

application/json: {

schema: {

$ref: "#/components/schemas/RoleRequest"

}

}

},

required: true

},

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/RoleResponse"

}

}

}

}

}

}

},

/api/admin/users: {

get: {

tags: [

"admin-role-controller"

],

operationId: "users",

parameters: [

{

name: "pageable",

in: "query",

required: true,

schema: {

$ref: "#/components/schemas/Pageable"

}

}

],

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

$ref: "#/components/schemas/PageResponseAdminUserResponse"

}

}

}

}

}

}

},

/api/admin/permissions: {

get: {

tags: [

"admin-role-controller"

],

operationId: "permissions",

responses: {

200: {

description: "OK",

content: {

*/*: {

schema: {

type: "array",

items: {

type: "string"

}

}

}

}

}

}

}

}

},

components: {

schemas: {

VenueRequest: {

type: "object",

properties: {

name: {

type: "string",

maxLength: 100,

minLength: 2

},

city: {

type: "string",

maxLength: 100,

minLength: 2

},

address: {

type: "string",

maxLength: 255,

minLength: 5

}

},

required: [

"address",

"city",

"name"

]

},

VenueResponse: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

name: {

type: "string"

},

city: {

type: "string"

},

address: {

type: "string"

},

active: {

type: "boolean"

},

seatTiers: {

type: "array",

items: {

type: "string"

}

}

}

},

ShowRequest: {

type: "object",

properties: {

venueId: {

type: "string",

format: "uuid"

},

title: {

type: "string",

maxLength: 150,

minLength: 2

},

genre: {

type: "string",

maxLength: 50,

minLength: 2

},

startTime: {

type: "string",

format: "date-time"

},

status: {

type: "string",

maxLength: 30,

minLength: 2

}

},

required: [

"genre",

"startTime",

"status",

"title",

"venueId"

]

},

ShowResponse: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

title: {

type: "string"

},

genre: {

type: "string"

},

startTime: {

type: "string",

format: "date-time"

},

status: {

type: "string"

},

venue: {

$ref: "#/components/schemas/VenueSummary"

}

}

},

VenueSummary: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

name: {

type: "string"

},

city: {

type: "string"

},

address: {

type: "string"

},

seatTiers: {

type: "array",

items: {

type: "string"

}

}

}

},

RoleAssignmentRequest: {

type: "object",

properties: {

roleIds: {

type: "array",

items: {

type: "string",

format: "uuid"

},

minItems: 1,

uniqueItems: true

}

},

required: [

"roleIds"

]

},

AdminUserResponse: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

email: {

type: "string"

},

firstName: {

type: "string"

},

lastName: {

type: "string"

},

phoneNumber: {

type: "string"

},

active: {

type: "boolean"

},

roles: {

type: "array",

items: {

$ref: "#/components/schemas/RoleSummary"

}

}

}

},

RoleSummary: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

name: {

type: "string"

}

}

},

RoleRequest: {

type: "object",

properties: {

name: {

type: "string",

minLength: 1,

pattern: "^[A-Z][A-Z0-9_]{2,49}$"

},

description: {

type: "string",

maxLength: 255,

minLength: 0

},

permissions: {

type: "array",

items: {

type: "string",

enum: [

"VENUE_MANAGE",

"SHOW_MANAGE"

]

},

uniqueItems: true

}

},

required: [

"name",

"permissions"

]

},

RoleResponse: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

name: {

type: "string"

},

description: {

type: "string"

},

systemRole: {

type: "boolean"

},

permissions: {

type: "array",

items: {

type: "string",

enum: [

"VENUE_MANAGE",

"SHOW_MANAGE"

]

}

},

assignmentCount: {

type: "integer",

format: "int64"

}

}

},

RegisterRequest: {

type: "object",

properties: {

email: {

type: "string",

format: "email",

maxLength: 254,

minLength: 0

},

password: {

type: "string",

maxLength: 100,

minLength: 8

},

firstName: {

type: "string",

maxLength: 50,

minLength: 2

},

lastName: {

type: "string",

maxLength: 50,

minLength: 2

},

phoneNumber: {

type: "string",

maxLength: 16,

minLength: 0,

pattern: "^\+[1-9]\d{7,14}$"

}

},

required: [

"email",

"firstName",

"lastName",

"password",

"phoneNumber"

]

},

RegisterResponse: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

email: {

type: "string"

},

firstName: {

type: "string"

},

lastName: {

type: "string"

},

phoneNumber: {

type: "string"

},

roles: {

type: "array",

items: {

$ref: "#/components/schemas/RoleSummary"

}

}

}

},

RefreshRequest: {

type: "object",

properties: {

refreshToken: {

type: "string",

maxLength: 512,

minLength: 0

}

},

required: [

"refreshToken"

]

},

TokenResponse: {

type: "object",

properties: {

accessToken: {

type: "string"

},

refreshToken: {

type: "string"

}

}

},

LogoutRequest: {

type: "object",

properties: {

refreshToken: {

type: "string",

maxLength: 512,

minLength: 1

}

}

},

LoginRequest: {

type: "object",

properties: {

email: {

type: "string",

format: "email",

maxLength: 254,

minLength: 0

},

password: {

type: "string",

maxLength: 100,

minLength: 8

}

},

required: [

"email",

"password"

]

},

LoginResponse: {

type: "object",

properties: {

token: {

type: "string"

},

refreshToken: {

type: "string"

},

id: {

type: "string",

format: "uuid"

},

email: {

type: "string"

},

firstName: {

type: "string"

},

lastName: {

type: "string"

},

phoneNumber: {

type: "string"

},

roles: {

type: "array",

items: {

$ref: "#/components/schemas/RoleSummary"

}

}

}

},

SeatBatchCreateRequest: {

type: "object",

properties: {

ranges: {

type: "array",

items: {

$ref: "#/components/schemas/SeatRangeRequest"

},

minItems: 1

}

},

required: [

"ranges"

]

},

SeatRangeRequest: {

type: "object",

properties: {

row: {

type: "string",

maxLength: 255,

minLength: 0

},

startNumber: {

type: "integer",

format: "int32"

},

endNumber: {

type: "integer",

format: "int32"

},

tier: {

type: "string",

maxLength: 255,

minLength: 0

}

},

required: [

"endNumber",

"row",

"startNumber",

"tier"

]

},

SeatBatchCreateResponse: {

type: "object",

properties: {

venueId: {

type: "string",

format: "uuid"

},

createdCount: {

type: "integer",

format: "int32"

}

}

},

SeatResponse: {

type: "object",

properties: {

id: {

type: "string",

format: "uuid"

},

row: {

type: "string"

},

number: {

type: "string"

},

tier: {

type: "string"

}

}

},

ShowFilter: {

type: "object",

properties: {

city: {

type: "string",

maxLength: 100,

minLength: 0

},

genre: {

type: "string",

maxLength: 50,

minLength: 0

},

from: {

type: "string",

format: "date-time"

},

to: {

type: "string",

format: "date-time"

}

}

},

Pageable: {

type: "object",

properties: {

page: {

type: "integer",

format: "int32",

minimum: 0

},

size: {

type: "integer",

format: "int32",

minimum: 1

},

sort: {

type: "array",

items: {

type: "string"

}

}

}

},

PageResponseShowResponse: {

type: "object",

properties: {

content: {

type: "array",

items: {

$ref: "#/components/schemas/ShowResponse"

}

},

pageNumber: {

type: "integer",

format: "int32"

},

pageSize: {

type: "integer",

format: "int32"

},

totalElements: {

type: "integer",

format: "int64"

},

totalPages: {

type: "integer",

format: "int32"

},

first: {

type: "boolean"

},

last: {

type: "boolean"

},

empty: {

type: "boolean"

}

}

},

PageResponseAdminUserResponse: {

type: "object",

properties: {

content: {

type: "array",

items: {

$ref: "#/components/schemas/AdminUserResponse"

}

},

pageNumber: {

type: "integer",

format: "int32"

},

pageSize: {

type: "integer",

format: "int32"

},

totalElements: {

type: "integer",

format: "int64"

},

totalPages: {

type: "integer",

format: "int32"

},

first: {

type: "boolean"

},

last: {

type: "boolean"

},

empty: {

type: "boolean"

}

}

}

},

securitySchemes: {

bearerAuth: {

type: "http",

description: "Enter JWT token obtained from /auth/login",

scheme: "bearer",

bearerFormat: "JWT"

}

}

}

}

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4a649ef4-4cbd-4167-9da2-38da0f137fb6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
