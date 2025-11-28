import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Loader2, 
  FileJson, 
  RefreshCw, 
  Search, 
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Cloud
} from 'lucide-react';
import { useAdlsMetadata } from '../hooks/useAdlsMetadata';
import type { InventorySummary } from './types';

interface AdlsFileBrowserProps {
  onDataLoaded?: (data: InventorySummary) => void;
  defaultSasUrl?: string;
}

export function AdlsFileBrowser({ onDataLoaded, defaultSasUrl }: AdlsFileBrowserProps) {
  const [sasUrl, setSasUrl] = useState(defaultSasUrl || '');
  const [selectedFile, setSelectedFile] = useState<InventorySummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, loading, error, refetch } = useAdlsMetadata(sasUrl, false);

  const handleFetch = async () => {
    if (!sasUrl) {
      alert('Please enter a SAS URL');
      return;
    }
    await refetch();
  };

  const handleLoadData = () => {
    if (data && onDataLoaded) {
      onDataLoaded(data);
      setSelectedFile(data);
    }
  };

  const handleDownloadJson = () => {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adls-metadata-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter discovered objects based on search term
  const filteredObjects = data?.discoveredObjects?.filter(obj => 
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.path.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            ADLS Gen2 File Browser
          </CardTitle>
          <CardDescription>
            Connect to Azure Data Lake Storage Gen2 and browse JSON metadata files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SAS URL Input */}
          <div className="space-y-2">
            <Label htmlFor="sasUrl">SAS URL</Label>
            <div className="flex gap-2">
              <Input
                id="sasUrl"
                type="text"
                placeholder="https://yourstorageaccount.dfs.core.windows.net/container/file.json?sv=..."
                value={sasUrl}
                onChange={(e) => setSasUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleFetch}
                disabled={loading || !sasUrl}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter the full SAS URL including query parameters from Azure Portal
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Error:</strong> {error.message}
                {error.status && <span className="ml-2">(Status: {error.status})</span>}
              </AlertDescription>
            </Alert>
          )}

          {data && !loading && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully loaded metadata with {data.totalObjects.toLocaleString()} objects
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Preview and Actions */}
      {data && !loading && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Summary</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                  <Button size="sm" onClick={handleLoadData}>
                    <Eye className="w-4 h-4 mr-2" />
                    Load into Portal
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.totalObjects.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-900">Total Objects</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(data.byType).length}
                  </div>
                  <div className="text-sm text-purple-900">Object Types</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(data.byPath).length}
                  </div>
                  <div className="text-sm text-green-900">Unique Paths</div>
                </div>
              </div>

              {/* Object Types Breakdown */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Objects by Type</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.byType)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([type, count]) => (
                      <Badge key={type} variant="secondary">
                        {type}: {count}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Object List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Discovered Objects ({filteredObjects.length})</CardTitle>
                <div className="flex items-center gap-2 w-64">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search objects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Rows</TableHead>
                        <TableHead>Modified</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredObjects.slice(0, 100).map((obj, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{obj.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {obj.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate" title={obj.path}>
                            {obj.path}
                          </TableCell>
                          <TableCell className="text-xs">{obj.size || '-'}</TableCell>
                          <TableCell className="text-xs">
                            {obj.rowCount ? obj.rowCount.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-xs">{obj.lastModified || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {filteredObjects.length > 100 && (
                <div className="mt-3 text-center text-sm text-gray-600">
                  Showing first 100 of {filteredObjects.length.toLocaleString()} objects
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
