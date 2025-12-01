# Admin User Setup Guide

## ⚠️ Security Best Practices

**NEVER expose admin creation through public signup endpoints!**

Admin users should only be created through secure, controlled methods.

---

## Method 1: CLI Script (Recommended) ✅

### Interactive Mode (Development)
```bash
cd backend
python scripts/create_admin.py
```

Follow the prompts:
- Enter admin email
- Enter password (hidden)
- Confirm password
- Enter admin name

### Environment Variables (Production)
```bash
export ADMIN_EMAIL="admin@panelverse.com"
export ADMIN_PASSWORD="your-secure-password"
python scripts/create_admin.py
```

---

## Method 2: Direct Database Insert

Using MongoDB shell or Compass:

```javascript
db.users.insertOne({
  "id": 999,  // Use unique ID
  "name": "Admin",
  "email": "admin@panelverse.com",
  "password": "$2b$12$...",  // Use bcrypt hash
  "role": "admin"
})
```

Generate bcrypt hash in Python:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.hash("YourPassword123!"))
```

---

## Method 3: Promote Existing User

Update an existing user to admin:

```bash
# Using the script (will prompt for email)
python scripts/create_admin.py

# Or directly in MongoDB
db.users.updateOne(
  {"email": "existing@user.com"},
  {"$set": {"role": "admin"}}
)
```

---

## Security Checklist

✅ **DO:**
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Use environment variables in production
- Limit admin accounts to trusted personnel only
- Log admin actions for audit trails
- Use 2FA for admin accounts (future enhancement)

❌ **DON'T:**
- Never hardcode admin credentials in code
- Never expose `/api/signup` with role="admin" option
- Never share admin credentials via insecure channels
- Never use default/weak passwords

---

## Current Implementation

### Role Hierarchy:
- **admin**: Full access (upload, edit any comic, delete any comic, manage users)
- **artist**: Can upload and manage own comics
- **reader**: Can browse, like, and save comics

### Protected Endpoints:
- Upload: Only `artist` and `admin` roles
- Edit/Delete: Only comic owner or `admin`
- User Management: Only `admin` (future)

---

## Future Enhancements

Consider implementing:
1. **Admin Dashboard** - Manage users, moderate content
2. **Role Permissions Table** - Fine-grained access control
3. **Audit Logging** - Track admin actions
4. **2FA/MFA** - Additional security layer
5. **Super Admin** - Higher tier for critical operations
6. **IP Whitelisting** - Restrict admin access by IP

---

## Troubleshooting

**Problem**: Script fails with connection error
- **Solution**: Check MongoDB is running, verify `MONGO_URI` in config

**Problem**: Password validation fails
- **Solution**: Ensure password is at least 8 characters

**Problem**: Email already exists
- **Solution**: Script will update existing user's role to admin

---

## Example Usage

```bash
# Development - Interactive
python scripts/create_admin.py

# Production - Environment variables
ADMIN_EMAIL=admin@domain.com ADMIN_PASSWORD=SecurePass123! python scripts/create_admin.py
```
