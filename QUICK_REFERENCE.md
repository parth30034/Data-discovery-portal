# ADLS Integration - Quick Reference

## 📦 Components Summary

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| **ADLS Config** | `src/config/adls.ts` | SAS URL configuration | ✅ Exists |
| **Fetcher Utility** | `src/utils/adlsFetcher.ts` | HTTP fetch with error handling | ✅ Exists |
| **useAdlsMetadata** | `src/hooks/useAdlsMetadata.ts` | Single file hook | ✅ Exists |
| **useAdlsFiles** | `src/hooks/useAdlsFiles.ts` | Multiple files hook | 🆕 New |
| **AdlsFileBrowser** | `src/components/AdlsFileBrowser.tsx` | File browser UI | 🆕 New |
| **DiscoveryPortal** | `src/components/DiscoveryPortal.tsx` | Portal with ADLS toggle | ✅ Exists |

---

## 🚀 Quick Start (3 Steps)

### 1. Move New Files
```bash
# Copy new files to proper locations
cp /home/claude/useAdlsFiles.ts src/hooks/
cp /home/claude/AdlsFileBrowser.tsx src/components/
```

### 2. Configure Environment
```bash
# Create .env file
echo 'VITE_ADLS_SAS_URL=YOUR_SAS_URL_HERE' > .env
```

### 3. Use in Your App
```tsx
// Option A: Add to existing page
import { AdlsFileBrowser } from './components/AdlsFileBrowser';

function MyPage() {
  return <AdlsFileBrowser onDataLoaded={(data) => console.log(data)} />;
}

// Option B: Already integrated in DiscoveryPortal!
// Just toggle "ADLS Gen2" in step 5
```

---

## 🎯 Three Ways to Use ADLS

### Way 1: Auto-fetch from Config
```tsx
import { useAdlsMetadata } from './hooks/useAdlsMetadata';

const { data, loading, error } = useAdlsMetadata(undefined, true);
// Automatically fetches from VITE_ADLS_SAS_URL
```

### Way 2: Manual Fetch
```tsx
import { useAdlsMetadata } from './hooks/useAdlsMetadata';

const { data, loading, error, refetch } = useAdlsMetadata();

<button onClick={refetch}>Load from ADLS</button>
```

### Way 3: Browse Multiple Files
```tsx
import { useAdlsFiles } from './hooks/useAdlsFiles';

const { files, fetchFileList, fetchFile } = useAdlsFiles();

<button onClick={() => fetchFileList(containerUrl)}>
  List Files
</button>
```

---

## 📋 Data Flow Diagram

```
User Action
    ↓
┌─────────────────────────────────────┐
│   UI Component                      │
│   - AdlsFileBrowser                 │
│   - DiscoveryPortal                 │
└───────────┬─────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   React Hook                        │
│   - useAdlsMetadata                 │
│   - useAdlsFiles                    │
└───────────┬─────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   Utility Function                  │
│   - fetchJsonFromAdls()             │
│   - isValidSasUrl()                 │
└───────────┬─────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   HTTP Request (Fetch API)          │
│   - GET with SAS token              │
│   - CORS headers                    │
└───────────┬─────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   ADLS Gen2 Storage                 │
│   - JSON file with metadata         │
│   - Container with SAS token        │
└─────────────────────────────────────┘
            ↓
    JSON Response
            ↓
┌─────────────────────────────────────┐
│   Transform & Validate              │
│   - Parse JSON                      │
│   - Transform to InventorySummary   │
│   - Handle various formats          │
└───────────┬─────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   Display in UI                     │
│   - Tables                          │
│   - Charts                          │
│   - Summary cards                   │
└─────────────────────────────────────┘
```

---

## 🔧 JSON Format Support

Your hooks automatically handle these formats:

```typescript
// ✅ Format 1: Direct InventorySummary
{ totalObjects: 100, byType: {...}, discoveredObjects: [...] }

// ✅ Format 2: Wrapped in metadata
{ inventorySummary: { totalObjects: 100, ... } }

// ✅ Format 3: Array of objects
[ { name: "table1", type: "Table", ... }, ... ]

// ✅ Format 4: Nested structure
{ 
  data: { items: [...] },
  objects: [...],
  discoveredObjects: [...]
}
```

All are transformed automatically! 🎉

---

## ⚡ Common Code Snippets

### Display Object Count
```tsx
{data && (
  <div>
    Found {data.totalObjects.toLocaleString()} objects
  </div>
)}
```

### Show Object Types
```tsx
{data && Object.entries(data.byType).map(([type, count]) => (
  <Badge key={type}>{type}: {count}</Badge>
))}
```

### Render Table
```tsx
<Table>
  <TableBody>
    {data?.discoveredObjects.map((obj, i) => (
      <TableRow key={i}>
        <TableCell>{obj.name}</TableCell>
        <TableCell>{obj.type}</TableCell>
        <TableCell>{obj.rowCount?.toLocaleString()}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Handle Errors
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="w-4 h-4" />
    <AlertDescription>
      {error.message}
      {error.status && ` (${error.status})`}
    </AlertDescription>
  </Alert>
)}
```

---

## 🛠️ Azure Setup Checklist

- [ ] Create SAS token with Read + List permissions
- [ ] Set expiry date (e.g., 1 year from now)
- [ ] Copy full SAS URL (including ?sv=... parameters)
- [ ] Add CORS rule for your domain
  - Origins: `http://localhost:5173`
  - Methods: `GET, OPTIONS`
  - Headers: `*`
- [ ] Test URL in browser or curl
- [ ] Add to `.env` file as `VITE_ADLS_SAS_URL`

---

## 🎨 UI Components Included

The **AdlsFileBrowser** component provides:

- ✅ SAS URL input field
- ✅ Fetch button with loading state
- ✅ Error display with retry
- ✅ Success confirmation
- ✅ Data summary cards (total objects, types, paths)
- ✅ Object type breakdown with badges
- ✅ Searchable object table
- ✅ Download JSON/CSV buttons
- ✅ "Load into Portal" action
- ✅ Pagination for large datasets

---

## 📊 What Gets Rendered

After fetching from ADLS, you'll see:

1. **Summary Cards**
   - Total Objects count
   - Number of Object Types
   - Number of Unique Paths
   - Total Row Count

2. **Type Breakdown**
   - Visual badges showing object types
   - Count for each type

3. **Detailed Table**
   - Name, Type, Path
   - Size, Row Count
   - Last Modified date
   - Searchable and filterable

4. **Actions**
   - Download as JSON
   - Download as CSV
   - Load into discovery portal
   - Refresh data

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Check Azure CORS settings |
| 403 Forbidden | Verify SAS token not expired |
| No data showing | Check JSON format in file |
| Connection failed | Verify SAS URL is correct |
| Empty result | Ensure Read permission in SAS |

---

## 📱 Mobile Responsive

All components are mobile-friendly:
- Responsive grid layouts
- Stacked cards on small screens
- Horizontal scroll for tables
- Touch-friendly buttons

---

## 🎯 Key Features

✨ **Automatic Format Detection**
   - Handles multiple JSON structures
   - No manual mapping needed

🔄 **Real-time Data**
   - Live fetch from ADLS
   - Refresh on demand

🔍 **Search & Filter**
   - Search by name, type, or path
   - Instant results

💾 **Export Options**
   - Download as JSON
   - Download as CSV
   - Copy to clipboard

🛡️ **Error Handling**
   - Graceful error display
   - Retry functionality
   - Detailed error messages

---

## 🚀 Production Deployment

Before deploying:

1. Replace `localhost` CORS origin with production domain
2. Set production SAS URL in environment variables
3. Set longer SAS expiry (1+ year)
4. Consider implementing caching
5. Add monitoring/logging
6. Test with production data

---

## 📚 Additional Resources

- [Azure ADLS Gen2 Docs](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)
- [SAS Token Best Practices](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [CORS Configuration](https://learn.microsoft.com/en-us/rest/api/storageservices/cross-origin-resource-sharing--cors--support-for-the-azure-storage-services)

---

## 💡 Pro Tips

1. **Use environment-specific SAS URLs**
   ```env
   VITE_ADLS_SAS_URL_DEV=...
   VITE_ADLS_SAS_URL_PROD=...
   ```

2. **Cache fetched data**
   ```tsx
   const [cache, setCache] = useState<Map<string, any>>(new Map());
   ```

3. **Implement pagination early**
   - Don't render 10,000 rows at once
   - Use 50-100 items per page

4. **Add retry logic**
   ```tsx
   const retry = async (fn, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try { return await fn(); }
       catch { if (i === retries - 1) throw; }
     }
   };
   ```

5. **Monitor SAS expiry**
   - Set up alerts before expiry
   - Rotate tokens regularly

---

**You're all set! 🎉**

Your application can now:
- ✅ Fetch JSON from ADLS
- ✅ Display rich UI with data
- ✅ Handle errors gracefully
- ✅ Support multiple file formats
- ✅ Export and download data
