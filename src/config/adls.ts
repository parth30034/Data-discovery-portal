// ADLS Gen2 Configuration
// Replace this with your actual SAS URL from Azure Portal
// You can either:
// 1. Set it as an environment variable: VITE_ADLS_SAS_URL in .env file
// 2. Replace the empty string below with your SAS URL directly

// Type assertion for Vite env - this is safe as Vite provides these at build time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ADLS_SAS_URL = ((import.meta as any).env?.VITE_ADLS_SAS_URL as string) || '';

// Example format:
// https://yourstorageaccount.dfs.core.windows.net/container/path/metadata.json?sv=2021-06-08&ss=bfqt&srt=sco&sp=r&se=2025-01-20T10:00:00Z&sig=...

// If you want to use a specific file path, you can construct it here
export const getAdlsMetadataUrl = (filePath: string = 'metadata.json'): string => {
  if (ADLS_SAS_URL) {
    // If SAS URL already includes the file path, return as-is
    if (ADLS_SAS_URL.includes('.json')) {
      return ADLS_SAS_URL;
    }
    // Otherwise, append the file path
    const baseUrl = ADLS_SAS_URL.split('?')[0];
    const sasParams = ADLS_SAS_URL.split('?')[1];
    return `${baseUrl}/${filePath}?${sasParams}`;
  }
  return '';
};

