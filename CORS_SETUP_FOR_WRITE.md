# CORS Configuration for ADLS Write Operations

## Issue
When writing to Azure Storage from the browser, you're getting a CORS error because CORS is not configured for **PUT** requests.

## Solution: Configure CORS in Azure Portal

### Step 1: Navigate to CORS Settings
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account (`rsidatadiscovery`)
3. Go to **Settings** → **Resource sharing (CORS)**
4. Select **Blob service** (or **File service** if using Azure Files)

### Step 2: Add CORS Rule for Write Operations

Add a new CORS rule with the following settings:

**For Development (localhost):**
```
Allowed origins: http://localhost:5173, http://localhost:3000, http://127.0.0.1:5173
Allowed methods: GET, PUT, POST, DELETE, HEAD, OPTIONS
Allowed headers: *
Exposed headers: *
Max age: 3600
```

**For Production:**
```
Allowed origins: https://yourdomain.com
Allowed methods: GET, PUT, POST, DELETE, HEAD, OPTIONS
Allowed headers: *
Exposed headers: *
Max age: 3600
```

### Important Notes:
- **PUT method is required** for write operations
- **OPTIONS method is required** for CORS preflight requests
- Include all origins where your frontend will run
- Use `*` for headers to allow all (or specify: `Content-Type`, `x-ms-version`, `x-ms-blob-type`)

### Step 3: Verify SAS Token Permissions

Your SAS token must have:
- **Write** permission (`w` in `sp` parameter)
- **Create** permission (`c` in `sp` parameter)

Your current token has: `sp=rwdlacupyx` which includes:
- `r` = Read
- `w` = Write ✅
- `d` = Delete
- `l` = List
- `a` = Add
- `c` = Create ✅
- `u` = Update
- `p` = Process
- `y` = Permanent delete
- `x` = Execute

So your SAS token permissions are correct!

### Step 4: Test the Configuration

After configuring CORS:
1. Restart your development server
2. Try submitting the form again
3. Check the browser console for the constructed URL (it will be logged)
4. Check the Network tab in browser DevTools to see the actual request

## Troubleshooting

### Still Getting CORS Error?

1. **Check the actual URL being used:**
   - Open browser DevTools → Console
   - Look for the log: "Writing to ADLS URL: ..."
   - Verify the URL format is correct

2. **Verify CORS is applied:**
   - In Azure Portal, check that the CORS rule is saved
   - Wait a few minutes for changes to propagate
   - Clear browser cache and try again

3. **Check for preflight OPTIONS request:**
   - In DevTools → Network tab
   - Look for an OPTIONS request before the PUT request
   - If OPTIONS fails, CORS is not configured correctly

4. **Verify the endpoint:**
   - Your URL uses `file.core.windows.net` (Azure Files)
   - Make sure CORS is configured for **File service**, not just Blob service
   - Or consider using `dfs.core.windows.net` (ADLS Gen2) if available

### Alternative: Use a Backend Proxy

If CORS continues to be an issue, you can:
1. Create a backend API endpoint that writes to ADLS
2. Frontend calls your backend API
3. Backend handles the ADLS write (no CORS issues)

## Quick Reference

**CORS Rule Template:**
```
Allowed origins: [YOUR_FRONTEND_URL]
Allowed methods: GET, PUT, OPTIONS
Allowed headers: *
Exposed headers: *
Max age: 3600
```

**SAS Token Permissions:**
```
sp=rwc  (minimum: Read, Write, Create)
```

