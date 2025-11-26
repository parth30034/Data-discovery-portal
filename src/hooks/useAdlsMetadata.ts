import { useState, useEffect, useCallback } from 'react';
import { fetchJsonFromAdls, AdlsFetchError } from '../utils/adlsFetcher';
import { getAdlsMetadataUrl } from '../config/adls';
import type { InventorySummary } from '../components/types';

export interface UseAdlsMetadataResult {
  data: InventorySummary | null;
  loading: boolean;
  error: AdlsFetchError | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for fetching metadata JSON from ADLS Gen2
 * 
 * @param sasUrl - Optional SAS URL. If not provided, uses the one from config
 * @param autoFetch - Whether to fetch automatically on mount (default: false)
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAdlsMetadata();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (data) return <div>Found {data.totalObjects} objects</div>;
 * ```
 */
export function useAdlsMetadata(
  sasUrl?: string,
  autoFetch: boolean = false
): UseAdlsMetadataResult {
  const [data, setData] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AdlsFetchError | null>(null);

  const fetchMetadata = useCallback(async (url?: string) => {
    const targetUrl = url || sasUrl || getAdlsMetadataUrl();
    
    if (!targetUrl) {
      setError({
        message: 'No SAS URL provided. Please configure VITE_ADLS_SAS_URL or pass a URL.',
      } as AdlsFetchError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the JSON from ADLS
      const jsonData = await fetchJsonFromAdls<any>(targetUrl);
      
      // Transform the data to match InventorySummary if needed
      // The backend JSON might have a different structure, so we normalize it
      const inventorySummary: InventorySummary = transformToInventorySummary(jsonData);
      
      setData(inventorySummary);
    } catch (err) {
      setError(err as AdlsFetchError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [sasUrl]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchMetadata();
    }
  }, [autoFetch, fetchMetadata]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchMetadata(),
  };
}

/**
 * Transforms the raw JSON from ADLS into the InventorySummary format
 * Handles different possible JSON structures from the backend
 */
function transformToInventorySummary(jsonData: any): InventorySummary {
  // If the JSON already has inventorySummary, use it
  if (jsonData.inventorySummary) {
    return jsonData.inventorySummary as InventorySummary;
  }

  // If the JSON is the inventory summary itself
  if (jsonData.totalObjects !== undefined && jsonData.discoveredObjects) {
    return jsonData as InventorySummary;
  }

  // If the JSON has a different structure, try to extract what we can
  // This is a fallback for various backend formats
  const discoveredObjects = jsonData.discoveredObjects || jsonData.objects || [];
  const byType: { [key: string]: number } = {};
  const byPath: { [key: string]: number } = {};

  discoveredObjects.forEach((obj: any) => {
    const type = obj.type || 'Unknown';
    const path = obj.path || 'Unknown';
    
    byType[type] = (byType[type] || 0) + 1;
    byPath[path] = (byPath[path] || 0) + 1;
  });

  return {
    totalObjects: discoveredObjects.length,
    byType,
    byPath,
    discoveredObjects: discoveredObjects.map((obj: any) => ({
      name: obj.name || 'Unknown',
      type: obj.type || 'Unknown',
      path: obj.path || '',
      size: obj.size || obj.sizeBytes ? formatSize(obj.sizeBytes) : undefined,
      rowCount: obj.rowCount || obj.rows || undefined,
      lastModified: obj.lastModified || obj.last_modified || undefined,
      dependencies: obj.dependencies || undefined,
    })),
  };
}

/**
 * Helper to format bytes to human-readable size
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

