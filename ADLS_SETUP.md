# ADLS Gen2 JSON Fetch Setup Guide

This guide explains how to configure and use the ADLS Gen2 JSON fetch functionality in the Data Discovery Portal.

## Quick Start

1. **Get your SAS URL from Azure Portal**
   - Navigate to your ADLS Gen2 storage account
   - Generate a Shared Access Signature (SAS) with **Read** and **List** permissions
   - Copy the full SAS URL (including query parameters)

2. **Configure the SAS URL**

   **Option A: Environment Variable (Recommended)**
   
   Create a `.env` file in the project root:
   ```env
   VITE_ADLS_SAS_URL=https://yourstorageaccount.dfs.core.windows.net/container/path/metadata.json?sv=2021-06-08&ss=bfqt&srt=sco&sp=r&se=2025-01-20T10:00:00Z&sig=...
   ```

   **Option B: Direct Configuration**
   
   Edit `src/config/adls.ts` and replace the empty string:
   ```typescript
   export const ADLS_SAS_URL = 'YOUR_SAS_URL_HERE';
   ```

3. **Ensure CORS is configured**
   - In Azure Portal, go to your storage account → Settings → Resource sharing (CORS)
   - Add a rule allowing your frontend origin
   - Allowed methods: `GET, OPTIONS`
   - Allowed headers: `*` (or specific headers)
   - Exposed headers: `*`
   - Max age: `3600`

4. **JSON File Format**

   The JSON file in ADLS should match the `InventorySummary` structure:
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

   Or it can be wrapped in a metadata object:
   ```json
   {
     "inventorySummary": {
       "totalObjects": 128,
       ...
     }
   }
   ```

## Usage in the Portal

1. **Navigate to Review Step**
   - Complete the discovery form steps
   - On the Review & Submit step (Step 5), you'll see a "Data Source" toggle

2. **Toggle to ADLS Gen2**
   - Switch the toggle from "Mock Data" to "ADLS Gen2"
   - Click "Fetch from ADLS Gen2" button (if data isn't auto-loaded)
   - Wait for the fetch to complete

3. **Submit**
   - Once data is loaded (green success message), click "Submit Discovery Request"
   - The report will display data from ADLS instead of mock data

## Troubleshooting

**Error: "Network error: Unable to connect to ADLS"**
- Check CORS settings in Azure Portal
- Verify the SAS URL is correct and not expired
- Check browser console for detailed error messages

**Error: "Failed to fetch from ADLS: 403"**
- SAS token may be expired - generate a new one
- Verify SAS has Read permissions
- Check if the file path in the URL is correct

**Error: "No SAS URL provided"**
- Ensure `VITE_ADLS_SAS_URL` is set in `.env` file
- Or update `ADLS_SAS_URL` in `src/config/adls.ts`
- Restart the dev server after changing `.env` file

**Data not displaying correctly**
- Verify JSON structure matches `InventorySummary` interface
- Check browser console for parsing errors
- The hook will attempt to transform common JSON formats automatically

## Files Created

- `src/config/adls.ts` - Configuration for SAS URL
- `src/utils/adlsFetcher.ts` - Core fetch utility
- `src/hooks/useAdlsMetadata.ts` - React hook for fetching
- `src/vite-env.d.ts` - TypeScript definitions for env vars

## API Reference

### `useAdlsMetadata(sasUrl?, autoFetch?)`

React hook for fetching metadata from ADLS.

**Parameters:**
- `sasUrl` (optional): Override the default SAS URL from config
- `autoFetch` (optional): Automatically fetch on mount (default: `false`)

**Returns:**
```typescript
{
  data: InventorySummary | null;
  loading: boolean;
  error: AdlsFetchError | null;
  refetch: () => Promise<void>;
}
```

**Example:**
```typescript
const { data, loading, error, refetch } = useAdlsMetadata();

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (data) return <div>Found {data.totalObjects} objects</div>;
```

