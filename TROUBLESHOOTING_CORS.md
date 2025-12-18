# Troubleshooting CORS Error for Azure Blob Storage Write

## The Issue
You're getting a CORS error when trying to write from the browser, even though Python SDK works fine.

**Why?** Python SDK runs server-side and doesn't have CORS restrictions. Browser requests DO have CORS restrictions and must be explicitly allowed.

## Step 1: Verify Your Configuration

### Check your `.env` file:
```env
VITE_ADLS_SAS_URL=https://projectname.blob.core.windows.net/?sv=...
VITE_ADLS_CONTAINER_NAME=customcontainer
```

**Important:** Make sure you're using `blob.core.windows.net` (not `file.core.windows.net`)

### Check Browser Console
After submitting the form, check the browser console for:
- The constructed URL (should show `blob.core.windows.net`)
- Any CORS error details
- Network tab to see if the OPTIONS preflight request is failing

## Step 2: Configure CORS in Azure Portal

### For Azure Blob Storage:

1. **Go to Azure Portal**
   - Navigate to your Storage Account: `rsidatadiscovery`
   - Go to **Settings** → **Resource sharing (CORS)**

2. **Select Blob service** (not File service)

3. **Add CORS Rule:**
   ```
   Allowed origins: http://localhost:5173
   (or your actual frontend URL like https://yourdomain.com)
   
   Allowed methods: GET, PUT, POST, DELETE, HEAD, OPTIONS
   
   Allowed headers: *
   
   Exposed headers: *
   
   Max age: 3600
   ```

4. **Click Save**

### Important Notes:
- **PUT method MUST be included** - this is required for write operations
- **OPTIONS method MUST be included** - this is required for CORS preflight
- Add your exact origin (e.g., `http://localhost:5173` for Vite dev server)
- For production, add your production domain

## Step 3: Verify CORS is Applied

1. Wait 1-2 minutes for CORS changes to propagate
2. Clear browser cache
3. Restart your dev server
4. Try again

## Step 4: Check Browser Network Tab

1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Submit the form
4. Look for:
   - An **OPTIONS** request (preflight) - should return 200
   - The **PUT** request - should return 201

If OPTIONS fails (403/404), CORS is not configured correctly.

## Step 5: Alternative - Use a Backend Proxy

If CORS continues to be an issue, you can create a backend API endpoint:

```python
# Backend API endpoint
@app.post("/api/upload-scan-request")
async def upload_scan_request(request_data: dict):
    # Use Python SDK to upload
    # No CORS issues since it's server-side
    blob_service = BlobServiceClient(...)
    # Upload logic here
    return {"status": "success"}
```

Then frontend calls your backend API instead of Azure Storage directly.

## Debugging Checklist

- [ ] `.env` file uses `blob.core.windows.net`
- [ ] CORS configured for **Blob service** (not File service)
- [ ] PUT and OPTIONS methods are allowed
- [ ] Your origin (localhost:5173) is in allowed origins
- [ ] CORS changes saved and propagated (wait 1-2 minutes)
- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] Check browser console for actual error message
- [ ] Check Network tab for OPTIONS/PUT requests

## Expected Console Output

When working correctly, you should see:
```
Writing to Azure Storage URL: https://rsidatadiscovery.blob.core.windows.net...&sig=***
Container name: customcontainer
Is Blob Storage: true
```

## Still Not Working?

1. **Check the exact error in browser console** - share the full error message
2. **Check Network tab** - see what status code OPTIONS request returns
3. **Verify SAS token** - make sure it has Write (`w`) and Create (`c`) permissions
4. **Try from different browser** - rule out browser-specific issues
5. **Check if container exists** - verify `customcontainer` exists in your storage account


