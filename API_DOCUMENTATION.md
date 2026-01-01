# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### 1. Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@timesheet.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "System Administrator",
    "email": "admin@timesheet.com",
    "employeeId": "ADMIN001",
    "role": "admin",
    "totpEnabled": false
  }
}
```

---

### 2. Setup TOTP
**POST** `/auth/totp/setup`

Generate TOTP secret and QR code for user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "message": "Scan this QR code with your authenticator app"
}
```

**QR Code Usage:**
1. User scans QR code with Microsoft Authenticator
2. App shows 6-digit code
3. User proceeds to verify endpoint

---

### 3. Verify TOTP
**POST** `/auth/totp/verify`

Verify TOTP token and enable it for user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "TOTP enabled successfully",
  "totpEnabled": true
}
```

**Error (400):**
```json
{
  "message": "Invalid token. Please try again."
}
```

---

### 4. Get Current User
**GET** `/auth/me`

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "employee",
  "reportingManager": {
    "name": "Jane Manager",
    "email": "jane@example.com",
    "employeeId": "MGR001"
  },
  "department": "Engineering",
  "position": "Software Developer",
  "totpEnabled": true,
  "isActive": true
}
```

---

## Attendance Endpoints

### 1. Mark Attendance
**POST** `/attendance/mark`

Mark check-in or check-out. Automatically determines action based on current status.

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "totpToken": "123456",
  "locationId": "TERMINAL-001"
}
```

**Response (200) - Check In:**
```json
{
  "message": "Check-in successful at Main Office",
  "type": "check-in",
  "time": "2024-01-15T09:00:00.000Z",
  "location": "Main Office",
  "employee": {
    "name": "John Doe",
    "employeeId": "EMP001"
  }
}
```

**Response (200) - Check Out:**
```json
{
  "message": "Check-out successful at Main Office",
  "type": "check-out",
  "time": "2024-01-15T18:00:00.000Z",
  "location": "Main Office",
  "totalHours": 9,
  "employee": {
    "name": "John Doe",
    "employeeId": "EMP001"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid TOTP token"
}
```

**Error (400):**
```json
{
  "message": "You have already completed check-in and check-out for today",
  "checkInTime": "2024-01-15T09:00:00.000Z",
  "checkOutTime": "2024-01-15T18:00:00.000Z",
  "totalHours": 9
}
```

---

### 2. Get Attendance Status
**GET** `/attendance/status/:employeeId`

Get today's attendance status for an employee.

**Response (200) - Not Checked In:**
```json
{
  "status": "not-checked-in",
  "message": "Ready for check-in",
  "employee": {
    "name": "John Doe",
    "employeeId": "EMP001"
  }
}
```

**Response (200) - Checked In:**
```json
{
  "status": "checked-in",
  "message": "Ready for check-out",
  "checkInTime": "2024-01-15T09:00:00.000Z",
  "checkInLocation": "Main Office",
  "employee": {
    "name": "John Doe",
    "employeeId": "EMP001"
  }
}
```

**Response (200) - Completed:**
```json
{
  "status": "completed",
  "message": "Attendance completed for today",
  "checkInTime": "2024-01-15T09:00:00.000Z",
  "checkOutTime": "2024-01-15T18:00:00.000Z",
  "totalHours": 9,
  "employee": {
    "name": "John Doe",
    "employeeId": "EMP001"
  }
}
```

---

## Admin Endpoints

### 1. Get All Users
**GET** `/admin/users`

Get list of all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "department": "Engineering",
    "position": "Developer",
    "totpEnabled": true,
    "isActive": true,
    "reportingManager": {
      "name": "Jane Manager",
      "employeeId": "MGR001"
    }
  }
]
```

---

### 2. Create User
**POST** `/admin/users`

Create new user (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "employeeId": "EMP002",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "SecurePass123!",
  "role": "employee",
  "reportingManager": "507f1f77bcf86cd799439011",
  "department": "Sales",
  "position": "Sales Executive"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "employeeId": "EMP002",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "employee",
    "department": "Sales",
    "position": "Sales Executive",
    "totpEnabled": false,
    "isActive": true
  }
}
```

---

### 3. Update User
**PUT** `/admin/users/:id`

Update user details (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "department": "Marketing",
  "position": "Marketing Manager",
  "role": "manager"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "employeeId": "EMP002",
    "name": "Alice Johnson",
    "department": "Marketing",
    "position": "Marketing Manager",
    "role": "manager"
  }
}
```

---

### 4. Get Team Members
**GET** `/admin/team`

Get list of team members reporting to current user (Manager/Admin).

**Headers:**
```
Authorization: Bearer <manager_token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "employeeId": "EMP003",
    "name": "Bob Developer",
    "email": "bob@example.com",
    "department": "Engineering",
    "position": "Junior Developer",
    "isActive": true
  }
]
```

---

### 5. Get Timesheet
**GET** `/admin/timesheet/:userId/:year/:month`

Get monthly timesheet for a user.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `userId`: User ID
- `year`: Year (e.g., 2024)
- `month`: Month (1-12)

**Example:**
```
GET /admin/timesheet/507f1f77bcf86cd799439011/2024/1
```

**Response (200):**
```json
{
  "user": {
    "name": "John Doe",
    "employeeId": "EMP001",
    "email": "john@example.com",
    "department": "Engineering",
    "position": "Developer"
  },
  "period": {
    "year": 2024,
    "month": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  },
  "statistics": {
    "totalDays": 22,
    "presentDays": 20,
    "incompleteDays": 2,
    "totalHours": 180,
    "averageHoursPerDay": 9
  },
  "records": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "date": "2024-01-15T00:00:00.000Z",
      "checkInTime": "2024-01-15T09:00:00.000Z",
      "checkInLocation": "Main Office",
      "checkOutTime": "2024-01-15T18:00:00.000Z",
      "checkOutLocation": "Main Office",
      "totalHours": 9,
      "status": "present"
    }
  ]
}
```

**Permissions:**
- Admin: Can view any user's timesheet
- Manager: Can view team members' timesheets
- Employee: Can view only their own timesheet

---

## Location Endpoints

### 1. Get All Locations
**GET** `/admin/locations`

Get list of all locations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Main Office",
    "terminalId": "TERMINAL-001",
    "address": "123 Business St, City, Country",
    "description": "Main entrance terminal",
    "isActive": true
  }
]
```

---

### 2. Create Location
**POST** `/admin/locations`

Create new location/terminal (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Branch Office",
  "terminalId": "TERMINAL-002",
  "address": "456 Commerce Ave, City, Country",
  "description": "Branch office entrance"
}
```

**Response (201):**
```json
{
  "message": "Location created successfully",
  "location": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "Branch Office",
    "terminalId": "TERMINAL-002",
    "address": "456 Commerce Ave, City, Country",
    "description": "Branch office entrance",
    "isActive": true
  }
}
```

---

### 3. Update Location
**PUT** `/admin/locations/:id`

Update location details (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Branch Office",
  "isActive": false
}
```

**Response (200):**
```json
{
  "message": "Location updated successfully",
  "location": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "Updated Branch Office",
    "terminalId": "TERMINAL-002",
    "isActive": false
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "message": "No authentication token, access denied"
}
```

**403 Forbidden:**
```json
{
  "message": "Access denied. Admin privileges required."
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error",
  "error": "Detailed error message (development only)"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, implement rate limiting on:
- Login endpoint: 5 requests per minute
- TOTP verification: 3 requests per minute
- Attendance marking: 10 requests per minute

## CORS

Configure CORS in production to allow only trusted domains:

```javascript
app.use(cors({
  origin: ['https://your-admin-portal.com', 'https://your-kiosk.com'],
  credentials: true
}));
```
