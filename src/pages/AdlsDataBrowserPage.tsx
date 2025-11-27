import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeft, Database } from 'lucide-react';
import { AdlsFileBrowser } from '../components/AdlsFileBrowser';
import type { InventorySummary } from '../components/types';

interface AdlsDataBrowserPageProps {
  onBack?: () => void;
  currentUser?: string;
}

export function AdlsDataBrowserPage({ onBack, currentUser }: AdlsDataBrowserPageProps) {
  const [loadedData, setLoadedData] = useState<InventorySummary | null>(null);

  const handleDataLoaded = (data: InventorySummary) => {
    setLoadedData(data);
    console.log('✅ Data successfully loaded from ADLS:', {
      totalObjects: data.totalObjects,
      types: Object.keys(data.byType).length,
      paths: Object.keys(data.byPath).length,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="outline" size="sm" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">ADLS Data Browser</h1>
                  <p className="text-sm text-gray-600">
                    Fetch and explore JSON metadata from Azure Data Lake Storage
                  </p>
                </div>
              </div>
            </div>
            {currentUser && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium">{currentUser}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <AdlsFileBrowser 
          onDataLoaded={handleDataLoaded}
        />

        {/* Optional: Show loaded data summary */}
        {loadedData && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">
              ✅ Data Loaded Successfully
            </h3>
            <p className="text-sm text-green-800">
              You've loaded {loadedData.totalObjects.toLocaleString()} objects from ADLS. 
              You can now download the data or explore the details above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
