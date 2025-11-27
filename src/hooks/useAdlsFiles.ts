import { useState, useCallback } from 'react';
import { fetchJsonFromAdls, AdlsFetchError, isValidSasUrl } from '../utils/adlsFetcher';
import type { InventorySummary } from '../components/types';

export interface AdlsFile {
  name: string;
  url: string;
  size?: number;
  lastModified?: string;
}

export interface UseAdlsFilesResult {
  files: AdlsFile[];
  loading: boolean;
  error: AdlsFetchError | null;
  fetchFileList: (containerSasUrl: string) => Promise<void>;
  fetchFile: (sasUrl: string) => Promise<InventorySummary | null>;
  clearError: () => void;
}

/**
 * Enhanced React hook for working with multiple ADLS files
 * Supports listing files and fetching individual JSON files
 * 
 * @example
 * ```tsx
 * const { files, fetchFileList, fetchFile, loading, error } = useAdlsFiles();
 * 
 * // List files in container
 * await fetchFileList('https://storage.dfs.core.windows.net/container?sas...');
 * 
 * // Fetch specific file
 * const data = await fetchFile('https://storage.dfs.core.windows.net/container/file.json?sas...');
 * ```
 */
export function useAdlsFiles(): UseAdlsFilesResult {
  const [files, setFiles] = useState<AdlsFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AdlsFetchError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetches a list of JSON files from an ADLS container
   * Note: This requires the container-level SAS token with list permissions
   */
  const fetchFileList = useCallback(async (containerSasUrl: string) => {
    if (!isValidSasUrl(containerSasUrl)) {
      setError({
        message: 'Invalid SAS URL provided',
      } as AdlsFetchError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse the URL to get the base container URL
      const url = new URL(containerSasUrl);
      const baseUrl = `${url.protocol}//${url.hostname}${url.pathname}`;
      const sasParams = url.search;

      // For ADLS Gen2, we need to use the filesystem API
      // This requires list permission on the SAS token
      const listUrl = `${baseUrl}?resource=filesystem&recursive=true${sasParams.substring(1) ? '&' + sasParams.substring(1) : ''}`;

      const response = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-ms-version': '2021-06-08',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw {
          message: `Failed to list files: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
        } as AdlsFetchError;
      }

      // Parse the response - ADLS Gen2 returns XML or JSON depending on the request
      const data = await response.json();
      
      // Extract JSON files from the response
      const jsonFiles: AdlsFile[] = [];
      
      // This is a simplified parser - actual ADLS response format may vary
      if (data.paths) {
        data.paths.forEach((path: any) => {
          if (path.name && path.name.endsWith('.json')) {
            jsonFiles.push({
              name: path.name,
              url: `${baseUrl}/${path.name}${sasParams}`,
              size: path.contentLength,
              lastModified: path.lastModified,
            });
          }
        });
      }

      setFiles(jsonFiles);
    } catch (err) {
      const fetchError = err as AdlsFetchError;
      setError({
        message: fetchError.message || 'Failed to list files from ADLS container',
        status: fetchError.status,
        statusText: fetchError.statusText,
        originalError: fetchError.originalError,
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches and parses a specific JSON file from ADLS
   */
  const fetchFile = useCallback(async (sasUrl: string): Promise<InventorySummary | null> => {
    if (!sasUrl) {
      setError({
        message: 'SAS URL is required',
      } as AdlsFetchError);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const jsonData = await fetchJsonFromAdls<any>(sasUrl);
      
      // Transform to InventorySummary format
      const inventorySummary = transformToInventorySummary(jsonData);
      
      return inventorySummary;
    } catch (err) {
      const fetchError = err as AdlsFetchError;
      setError(fetchError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    files,
    loading,
    error,
    fetchFileList,
    fetchFile,
    clearError,
  };
}

/**
 * Transforms various JSON structures into the InventorySummary format
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

  // Handle array of objects directly
  if (Array.isArray(jsonData)) {
    const discoveredObjects = jsonData;
    const byType: { [key: string]: number } = {};
    const byPath: { [key: string]: number } = {};

    discoveredObjects.forEach((obj: any) => {
      const type = obj.type || obj.objectType || 'Unknown';
      const path = obj.path || obj.location || 'Unknown';
      
      byType[type] = (byType[type] || 0) + 1;
      byPath[path] = (byPath[path] || 0) + 1;
    });

    return {
      totalObjects: discoveredObjects.length,
      byType,
      byPath,
      discoveredObjects: discoveredObjects.map((obj: any) => ({
        name: obj.name || obj.objectName || 'Unknown',
        type: obj.type || obj.objectType || 'Unknown',
        path: obj.path || obj.location || '',
        size: obj.size || obj.sizeBytes ? formatSize(obj.sizeBytes || 0) : undefined,
        rowCount: obj.rowCount || obj.rows || obj.recordCount || undefined,
        lastModified: obj.lastModified || obj.modified || obj.modifiedDate || undefined,
        dependencies: obj.dependencies || obj.deps || undefined,
      })),
    };
  }

  // Try to extract from nested structure
  const discoveredObjects = jsonData.discoveredObjects || jsonData.objects || jsonData.items || [];
  const byType: { [key: string]: number } = {};
  const byPath: { [key: string]: number } = {};

  discoveredObjects.forEach((obj: any) => {
    const type = obj.type || obj.objectType || 'Unknown';
    const path = obj.path || obj.location || 'Unknown';
    
    byType[type] = (byType[type] || 0) + 1;
    byPath[path] = (byPath[path] || 0) + 1;
  });

  return {
    totalObjects: discoveredObjects.length,
    byType,
    byPath,
    discoveredObjects: discoveredObjects.map((obj: any) => ({
      name: obj.name || obj.objectName || 'Unknown',
      type: obj.type || obj.objectType || 'Unknown',
      path: obj.path || obj.location || '',
      size: obj.size || (obj.sizeBytes ? formatSize(obj.sizeBytes) : undefined),
      rowCount: obj.rowCount || obj.rows || obj.recordCount || undefined,
      lastModified: obj.lastModified || obj.modified || obj.modifiedDate || undefined,
      dependencies: obj.dependencies || obj.deps || undefined,
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
