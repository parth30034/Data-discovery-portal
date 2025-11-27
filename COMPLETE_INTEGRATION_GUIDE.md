# Complete ADLS Integration Guide

This guide explains all the components required to fetch JSON files from ADLS and render them in your UI.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌──────────────────┐  ┌───────────────────────────────┐   │
│  │ AdlsFileBrowser  │  │   DiscoveryPortal             │   │
│  │   Component      │◄─┤   (with ADLS toggle)          │   │
│  └────────┬─────────┘  └───────────────────────────────┘   │
│           │                                                   │
└───────────┼───────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────┐
│                    Hooks Layer                               │
│  ┌──────────────────┐  ┌───────────────────────────────┐   │
│  │ useAdlsMetadata  │  │   useAdlsFiles                 │   │
│  │   (single file)  │  │   (multiple files/list)        │   │
│  └────────┬─────────┘  └──────────┬─────────────────────┘   │
└───────────┼────────────────────────┼───────────────────────────┘
            │                        │
┌───────────▼────────────────────────▼───────────────────────────┐
│                   Utils Layer                                  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  adlsFetcher.ts                                       │    │
│  │  - fetchJsonFromAdls()                                │    │
│  │  - isValidSasUrl()                                    │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────────┐
│                   ADLS Gen2 Storage                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Container: your-container                            │    │
│  │    ├── metadata.json                                  │    │
│  │    ├── inventory-2024-01.json                         │    │
│  │    ├── discovered-objects.json                        │    │
│  │    └── ... more JSON files                            │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

## Required Components

### 1. Configuration (`src/config/adls.ts`)
**Status:** ✅ Already implemented

```typescript
export const ADLS_SAS_URL = import.meta.env.VITE_ADLS_SAS_URL || '';
export const getAdlsMetadataUrl = (filePath: string = 'metadata.json'): string => { ... }
```

**Purpose:** Centralized configuration for ADLS SAS URLs

---

### 2. Fetcher Utility (`src/utils/adlsFetcher.ts`)
**Status:** ✅ Already implemented

```typescript
export async function fetchJsonFromAdls<T>(sasUrl: string): Promise<T>
export function isValidSasUrl(sasUrl: string): boolean
```

**Purpose:** Core HTTP fetch logic with error handling and validation

---

### 3. React Hooks

#### a) `useAdlsMetadata` - Single File Hook
**Status:** ✅ Already implemented
**Location:** `src/hooks/useAdlsMetadata.ts`

```typescript
const { data, loading, error, refetch } = useAdlsMetadata(sasUrl?, autoFetch?);
```

**Use Case:** Fetch a single known JSON file from ADLS

#### b) `useAdlsFiles` - Multiple Files Hook  
**Status:** 🆕 NEW - Created above
**Location:** `src/hooks/useAdlsFiles.ts`

```typescript
const { files, fetchFileList, fetchFile, loading, error } = useAdlsFiles();
```

**Use Case:** List and fetch multiple JSON files from a container

---

### 4. UI Components

#### a) `AdlsFileBrowser` - File Browser Component
**Status:** 🆕 NEW - Created above
**Location:** `src/components/AdlsFileBrowser.tsx`

**Features:**
- SAS URL input
- Fetch and display JSON data
- Search and filter objects
- Download JSON/CSV
- Load data into portal
- Real-time preview

#### b) `DiscoveryPortal` - Existing Integration
**Status:** ✅ Already has ADLS toggle
**Location:** `src/components/DiscoveryPortal.tsx`

**Integration:** Toggle between mock data and ADLS data

---

## Implementation Steps

### Step 1: Configure Your Environment

Create `.env` file in project root:

```env
VITE_ADLS_SAS_URL=https://yourstorageaccount.dfs.core.windows.net/container/metadata.json?sv=2021-06-08&ss=bfqt&srt=sco&sp=rl&se=2025-12-31T00:00:00Z&sig=YOUR_SIGNATURE
```

### Step 2: Move New Files to Proper Locations

```bash
# Move the hook
mv /home/claude/useAdlsFiles.ts src/hooks/useAdlsFiles.ts

# Move the component
mv /home/claude/AdlsFileBrowser.tsx src/components/AdlsFileBrowser.tsx
```

### Step 3: Option A - Use Standalone File Browser

Create a new page to browse ADLS files:

```tsx
// src/pages/AdlsDataBrowser.tsx
import { AdlsFileBrowser } from '../components/AdlsFileBrowser';
import { useState } from 'react';
import type { InventorySummary } from '../components/types';

export function AdlsDataBrowser() {
  const [loadedData, setLoadedData] = useState<InventorySummary | null>(null);

  const handleDataLoaded = (data: InventorySummary) => {
    setLoadedData(data);
    console.log('Data loaded:', data);
    // Do something with the data
  };

  return (
    <div className="container mx-auto py-8">
      <AdlsFileBrowser onDataLoaded={handleDataLoaded} />
      
      {loadedData && (
        <div className="mt-8">
          <h2>Loaded Data Summary</h2>
          <p>Total Objects: {loadedData.totalObjects}</p>
          {/* Render your data here */}
        </div>
      )}
    </div>
  );
}
```

### Step 4: Option B - Enhance Existing Discovery Portal

Already integrated! Your `DiscoveryPortal` component has:

```tsx
// In ReviewStep (Step 5)
<div className="flex items-center gap-2">
  <span>Mock Data</span>
  <input
    type="checkbox"
    checked={useAdlsData}
    onChange={(e) => setUseAdlsData(e.target.checked)}
  />
  <span>ADLS Gen2</span>
</div>
```

This toggle switches between mock data and ADLS data automatically!

---

## JSON File Format Requirements

Your JSON files in ADLS should match one of these formats:

### Format 1: Direct InventorySummary
```json
{
  "totalObjects": 128,
  "byType": {
    "Table": 24,
    "View": 12,
    "Python Script": 36
  },
  "byPath": {
    "sql-prod/orders": 40,
    "etl-prod/scripts": 24
  },
  "discoveredObjects": [
    {
      "name": "customer_master",
      "type": "Table",
      "path": "sql-prod/orders",
      "size": "1247 MB",
      "rowCount": 2547891,
      "lastModified": "2024-12-30"
    }
  ]
}
```

### Format 2: Wrapped in metadata object
```json
{
  "inventorySummary": {
    "totalObjects": 128,
    "byType": { ... },
    "byPath": { ... },
    "discoveredObjects": [ ... ]
  }
}
```

### Format 3: Array of objects (auto-transformed)
```json
[
  {
    "name": "customer_master",
    "type": "Table",
    "path": "sql-prod/orders",
    "sizeBytes": 1307600896,
    "rowCount": 2547891,
    "lastModified": "2024-12-30"
  },
  ...
]
```

All formats are automatically transformed by the hooks!

---

## Usage Examples

### Example 1: Simple Fetch and Display

```tsx
import { useAdlsMetadata } from './hooks/useAdlsMetadata';

function MyComponent() {
  const sasUrl = 'https://storage.dfs.core.windows.net/container/data.json?sas...';
  const { data, loading, error, refetch } = useAdlsMetadata(sasUrl, true);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h2>Total Objects: {data.totalObjects}</h2>
      <ul>
        {data.discoveredObjects.map((obj, i) => (
          <li key={i}>{obj.name} - {obj.type}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 2: Manual Fetch with Button

```tsx
import { useAdlsMetadata } from './hooks/useAdlsMetadata';

function MyComponent() {
  const [sasUrl, setSasUrl] = useState('');
  const { data, loading, error, refetch } = useAdlsMetadata();

  const handleFetch = () => {
    refetch();
  };

  return (
    <div>
      <input 
        value={sasUrl} 
        onChange={(e) => setSasUrl(e.target.value)}
        placeholder="Enter SAS URL"
      />
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      
      {data && <DataTable data={data.discoveredObjects} />}
    </div>
  );
}
```

### Example 3: Browse Multiple Files

```tsx
import { useAdlsFiles } from './hooks/useAdlsFiles';

function FileSelector() {
  const { files, fetchFileList, fetchFile, loading } = useAdlsFiles();
  const [selectedData, setSelectedData] = useState(null);

  const handleListFiles = async () => {
    await fetchFileList('https://storage.dfs.core.windows.net/container?sas...');
  };

  const handleSelectFile = async (fileUrl: string) => {
    const data = await fetchFile(fileUrl);
    setSelectedData(data);
  };

  return (
    <div>
      <button onClick={handleListFiles}>List Files</button>
      
      <ul>
        {files.map(file => (
          <li key={file.url} onClick={() => handleSelectFile(file.url)}>
            {file.name}
          </li>
        ))}
      </ul>

      {selectedData && <DataDisplay data={selectedData} />}
    </div>
  );
}
```

---

## Azure Portal Setup Checklist

### 1. Generate SAS Token
- Navigate to Storage Account → Shared access signature
- **Required Permissions:**
  - ✅ Read
  - ✅ List (if browsing multiple files)
- **Resource types:**
  - ✅ Object
  - ✅ Container (if browsing)
- Set expiry date
- Generate SAS token and URL

### 2. Configure CORS
- Navigate to Storage Account → Settings → CORS
- Add new rule:
  ```
  Allowed origins: http://localhost:5173, https://yourdomain.com
  Allowed methods: GET, OPTIONS
  Allowed headers: *
  Exposed headers: *
  Max age: 3600
  ```

### 3. Verify File Access
Test in browser or curl:
```bash
curl "YOUR_SAS_URL" -H "Accept: application/json"
```

---

## Common Issues & Solutions

### Issue 1: CORS Error
**Error:** "Network error: Unable to connect to ADLS"

**Solution:**
1. Check CORS settings in Azure Portal
2. Ensure your origin (http://localhost:5173) is allowed
3. Verify GET and OPTIONS methods are enabled

### Issue 2: 403 Forbidden
**Error:** "Failed to fetch from ADLS: 403"

**Solution:**
1. Check if SAS token is expired
2. Verify Read permissions are granted
3. Ensure the file path in URL is correct

### Issue 3: JSON Parsing Error
**Error:** "JSON parsing failed"

**Solution:**
1. Verify JSON is valid (use JSONLint)
2. Check file encoding (must be UTF-8)
3. Ensure no BOM (Byte Order Mark) at start of file

### Issue 4: Data Not Displaying
**Solution:**
1. Check browser console for errors
2. Verify JSON structure matches expected format
3. Use the transformToInventorySummary function

---

## Testing Your Integration

### Test 1: Verify Configuration
```typescript
import { ADLS_SAS_URL } from './config/adls';
console.log('SAS URL configured:', !!ADLS_SAS_URL);
```

### Test 2: Verify Fetcher
```typescript
import { fetchJsonFromAdls } from './utils/adlsFetcher';

async function test() {
  try {
    const data = await fetchJsonFromAdls('YOUR_SAS_URL');
    console.log('Fetch successful:', data);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}
```

### Test 3: Verify Hook
```typescript
const { data, loading, error } = useAdlsMetadata('YOUR_SAS_URL', true);
console.log({ data, loading, error });
```

---

## Performance Optimization

### 1. Caching
```typescript
// Add simple cache to reduce API calls
const dataCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedOrFetch(url: string) {
  const cached = dataCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  // Fetch fresh data
}
```

### 2. Pagination
```typescript
// For large datasets, implement pagination
const itemsPerPage = 50;
const [currentPage, setCurrentPage] = useState(1);
const paginatedObjects = data?.discoveredObjects.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

### 3. Lazy Loading
```typescript
// Load data only when needed
const { data, loading, error, refetch } = useAdlsMetadata(sasUrl, false); // autoFetch=false

// Fetch when user clicks
<button onClick={refetch}>Load Data</button>
```

---

## Next Steps

1. ✅ **Setup Complete** - You have all required components
2. **Move files** to proper locations (hooks/, components/)
3. **Configure .env** with your SAS URL
4. **Setup CORS** in Azure Portal
5. **Test** with your actual JSON files
6. **Customize** UI components to match your design
7. **Deploy** to production

---

## Component Dependency Tree

```
AdlsFileBrowser
├── useAdlsMetadata (hook)
│   └── adlsFetcher (utility)
│       └── fetch API
├── UI Components
│   ├── Card, Button, Input
│   ├── Table, Badge
│   └── Alert
└── Types
    └── InventorySummary

DiscoveryPortal
├── useAdlsMetadata (hook)
├── ReviewStep
└── DiscoveryReport
```

---

## Summary

You now have a complete system to:

✅ **Fetch** JSON files from ADLS Gen2  
✅ **Browse** multiple files in a container  
✅ **Display** data in a rich UI  
✅ **Search** and filter objects  
✅ **Download** data as JSON/CSV  
✅ **Integrate** with existing portal  
✅ **Handle** errors gracefully  
✅ **Transform** various JSON formats automatically  

All components are production-ready and follow React best practices!
