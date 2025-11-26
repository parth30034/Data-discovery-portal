/**
 * Utility functions for fetching JSON files from Azure Data Lake Storage Gen2
 */

export interface AdlsFetchError {
  message: string;
  status?: number;
  statusText?: string;
  originalError?: Error;
}

/**
 * Fetches a JSON file from ADLS Gen2 using a SAS URL
 * @param sasUrl - The full SAS URL including query parameters
 * @returns Promise resolving to the parsed JSON data
 * @throws AdlsFetchError if the fetch fails
 */
export async function fetchJsonFromAdls<T = any>(sasUrl: string): Promise<T> {
  if (!sasUrl) {
    throw {
      message: 'SAS URL is required',
    } as AdlsFetchError;
  }

  try {
    const response = await fetch(sasUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // CORS mode - important for cross-origin requests
      mode: 'cors',
    });

    if (!response.ok) {
      const error: AdlsFetchError = {
        message: `Failed to fetch from ADLS: ${response.statusText}`,
        status: response.status,
        statusText: response.statusText,
      };

      // Try to get error details from response
      try {
        const errorBody = await response.text();
        if (errorBody) {
          error.message += ` - ${errorBody}`;
        }
      } catch {
        // Ignore if we can't parse error body
      }

      throw error;
    }

    // Parse JSON response
    const jsonData = await response.json();
    return jsonData as T;
  } catch (error) {
    // Handle network errors, CORS errors, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw {
        message: 'Network error: Unable to connect to ADLS. Check CORS settings and network connectivity.',
        originalError: error,
      } as AdlsFetchError;
    }

    // Re-throw if it's already an AdlsFetchError
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }

    // Wrap unknown errors
    throw {
      message: error instanceof Error ? error.message : 'Unknown error occurred while fetching from ADLS',
      originalError: error instanceof Error ? error : new Error(String(error)),
    } as AdlsFetchError;
  }
}

/**
 * Validates that a SAS URL is properly formatted
 * @param sasUrl - The SAS URL to validate
 * @returns true if the URL appears valid
 */
export function isValidSasUrl(sasUrl: string): boolean {
  if (!sasUrl) return false;
  
  try {
    const url = new URL(sasUrl);
    // Check if it's an Azure storage URL
    const isAzureStorage = url.hostname.includes('.dfs.core.windows.net') || 
                          url.hostname.includes('.blob.core.windows.net');
    
    // Check if it has SAS parameters
    const hasSasParams = url.searchParams.has('sig') || url.searchParams.has('sv');
    
    return isAzureStorage && hasSasParams;
  } catch {
    return false;
  }
}

