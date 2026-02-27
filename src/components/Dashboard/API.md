**Endpoint:** `POST /auth/register`
```
Content-Type: application/json
```

**Request Body:**
```json

{
  "email": "john@example.com",
  "password": "StrongP@ss123",
  "password_confirm": "StrongP@ss123",
  "first_name": "John",
  "last_name": "Doe",
  "user_name": "john_doe"
}
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_name": "john_doe",
      "is_active": true,
      "date_joined": "2026-02-19T10:30:00Z",
      "last_login": null
    },
    "token": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "field_name": ["Username wrong"],
    "password": ["Password must be at least 8 characters."],
    "password_confirm": ["Passwords do not match."]
  }
}

**409 Conflict - User Already Exists:**
```json
{
  "status": "error",
  "message": "User with this email already exists",
  "errors": {
    "email": ["A user with this email is already registered."]
  }
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "An unexpected error occurred. Please try again later.",
  "error_code": "INTERNAL_SERVER_ERROR"
}
```

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticates user and returns access token

**Authentication:** None (Public endpoint)

**Rate Limiting:** 10 requests per minute per IP

**Request Body:**
```json
{
  "username": "varchar (required)",
  "password": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "phone_number": "string|null",
      "is_active": "boolean"
    },
    "token": {
      "access": "string (JWT token)",
      "refresh": "string (JWT refresh token)",
      "expires_in": "integer (seconds)"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "status": "error",
  "message": "Invalid email or password",
  "error_code": "INVALID_CREDENTIALS"
}
```

**403 Forbidden - Account Inactive:**
```json
{
  "status": "error",
  "message": "Account is inactive. Please contact support.",
  "error_code": "ACCOUNT_INACTIVE"
}
```

### 6. Request Password Reset

**Endpoint:** `POST /auth/forgot-password`

**Description:** Sends password reset email to user

**Authentication:** None (Public endpoint)

**Request Body:**
```json
{
  "email": "string (required, valid email format)"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset instructions sent to your email"
}
```

**Note:** For security, always returns success even if email doesn't exist

---
**Endpoint:** POST /api/companies
**Success**
{
  "status": "success",
  "message": "Company added successfully",
  "data": {
    "company": {
      "id": 12,
      "CompanyName": "ABC Pvt Ltd",
      "domain": "abc.com",
      "website": "https://abc.com",
      "poc": "John Doe",
      "email": "john@abc.com",
      "phone": "+919876543210",
      "status": "Under Progress",
      "meetingAvailability": "Next Week",
      "meetingDate": "2026-02-25T10:30:00Z",
      "quotes": "",
      "proposed": "",
      "replied": "",
      "meet_1": "",
      "meet_2": "",
      "created_at": "2026-02-19T12:10:00Z",
      "updated_at": "2026-02-19T12:10:00Z"
    }
  }
}
----------------------------------------------------

**Validation Error**
{
  "status": "error",
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "errors": {
    "CompanyName": ["This field is required."],
    "email": ["Enter a valid email address."]
  }
}

**Duplicate field**
{
  "status": "error",
  "message": "Company already exists",
  "error_code": "COMPANY_ALREADY_EXISTS",
  "errors": {
    "CompanyName": ["Company with this name already exists."]
  }
}
------------------------------------------------------------------

**Endpoint :GET /companies**
{
  "status": "success",
  "data": {
    "companies": [
      {
        "id": 12,
        "CompanyName": "ABC Pvt Ltd",
        "domain": "abc.com",
        "poc": "John Doe",
        "email": "john@abc.com",
        "phone": "+919876543210",
        "status": "Under Progress",
        "meetingDate": "2026-02-25T10:30:00Z"
      },
      {
        "id": 13,
        "CompanyName": "XYZ Technologies",
        "domain": "xyz.com",
        "poc": "Jane Smith",
        "email": "jane@xyz.com",
        "phone": "+919812345678",
        "status": "Interested",
        "meetingDate": null
      }
    ],
    "total": 2,
    "page": 1,
    "pages": 1
  }
}


**upcoming meetings Endpoint : GET/companies/upcoming-meetings**
# 7. Upcoming Meetings

GET /companies/upcoming-meetings

Optional: ?limit=3

Success Response (200): { "status": "success", 
"data": { "meetings": \[
{ 
    "company_id": 12, 
    "CompanyName": "ABC Pvt Ltd", 
    "meetingDate":"2026-02-19T16:00:00Z", 
    "is_today": true } \], 
    "total": 1 } }

# 3. Update Company
**Endpoint: GET /companies/updates**
PUT /companies/{id}

Request Body Example: { "quotes": "Updated quotation text" }

Success Response (200): { "status": "success", "message": "Company
updated successfully", "data": { "company": { ... } } }

Not Found (404): { "status": "error", "message": "Company not found",
"error_code": "COMPANY_NOT_FOUND" }

--------------------------------------------------------------------

# 5. Update Company Status

PATCH /companies/{id}/status

Request Body: { "status": "Skip" }

Validation: Status must be one of: Under Progress, Interested, Awaiting
for Meeting, Quotation, Skip

Success Response (200): { "status": "success", "message": "Company
status updated", "data": { "id": 12, "status": "Skip" } }

------------------------------------------------------------------------

# 6. Updates (Next Week Meetings)

GET /companies/updates

Success Response (200): { "status": "success", "data": { "updates": \[ {
"company_id": 12, "CompanyName": "ABC Pvt Ltd", "meetingDate":
"2026-02-25T10:30:00Z", "status": "Interested" } \], "total": 1 } }

------------------------------------------------------------------------



------------------------------------------------------------------------

# Standard Error Format

{ "status": "error", "message": "Readable message", "error_code":
"ERROR_CODE", "errors": { "field": \["error message"\] } }

------------------------------------------------------------------------

# HTTP Status Codes

200 OK 201 Created 400 Bad Request 401 Unauthorized 404 Not Found 409
Conflict 500 Internal Server Error

