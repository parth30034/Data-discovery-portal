import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  Database, 
  FileText,
  Calendar,
  User,
  Building2,
  Server,
  Globe,
  Shield,
  BarChart3,
  Activity,
  Layers
} from 'lucide-react';
import type { DiscoveryFormData } from './types';

interface DiscoveryReportProps {
  onReset: () => void;
  formData: DiscoveryFormData;
}

export function DiscoveryReport({ onReset, formData }: DiscoveryReportProps) {
  const handleDownloadReport = () => {
    const reportContent = generateReportText();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `discovery-report-${formData.projectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInventory = () => {
    if (!formData.inventorySummary) return;
    
    const csvContent = generateInventoryCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${formData.projectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `discovery-data-${formData.projectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateInventoryCSV = () => {
    if (!formData.inventorySummary) return '';
    
    let csv = 'Object Name,Type,Path,Size,Row Count,Last Modified,Dependencies\n';
    
    formData.inventorySummary.discoveredObjects.forEach((obj) => {
      csv += `"${obj.name}","${obj.type}","${obj.path}","${obj.size || ''}","${obj.rowCount || ''}","${obj.lastModified || ''}","${obj.dependencies || ''}"\n`;
    });
    
    return csv;
  };

  const generateReportText = () => {
    const date = new Date().toLocaleDateString();
    let report = `DATA ENGINEERING DISCOVERY REPORT\n`;
    report += `Generated: ${date}\n`;
    report += `${'='.repeat(80)}\n\n`;

    report += `PROJECT INFORMATION\n`;
    report += `${'-'.repeat(80)}\n`;
    report += `Project Name: ${formData.projectName}\n`;
    report += `Department: ${formData.department}\n`;
    report += `Requestor: ${formData.requestorName} (${formData.requestorEmail})\n`;
    report += `Priority: ${formData.priority.toUpperCase()}\n\n`;

    report += `ENVIRONMENT DETAILS\n`;
    report += `${'-'.repeat(80)}\n`;
    report += `Environments: ${formData.environments.join(', ')}\n`;
    report += `Cloud Provider: ${formData.cloudProvider}\n`;
    report += `Infrastructure: ${formData.infrastructureType}\n`;
    report += `Databases: ${formData.databases.join(', ')}\n`;
    report += `Data Warehouse: ${formData.dataWarehouse || 'None'}\n`;
    report += `Orchestration: ${formData.orchestrationTool || 'None'}\n\n`;

    report += `LOCATION & SCOPE\n`;
    report += `${'-'.repeat(80)}\n`;
    report += `Regions: ${formData.regions.join(', ')}\n`;
    report += `Data Sources: ${formData.dataSources.join(', ')}\n`;
    report += `Inventory Scope: ${formData.inventoryScope.join(', ')}\n\n`;

    if (formData.connectionTargets.length > 0) {
      report += `CONNECTION TARGETS (${formData.connectionTargets.length})\n`;
      report += `${'-'.repeat(80)}\n`;
      formData.connectionTargets.forEach((target, idx) => {
        report += `${idx + 1}. ${target.name} (${target.type})\n`;
        report += `   Host: ${target.host}${target.port ? ':' + target.port : ''}\n`;
        report += `   Paths: ${target.paths.join(', ')}\n\n`;
      });
    }

    if (formData.inventorySummary) {
      const summary = formData.inventorySummary;
      report += `INVENTORY SUMMARY\n`;
      report += `${'-'.repeat(80)}\n`;
      report += `Total Objects Discovered: ${summary.totalObjects}\n\n`;
      
      report += `Objects by Type:\n`;
      Object.entries(summary.byType)
        .sort(([, a], [, b]) => b - a)
        .forEach(([type, count]) => {
          report += `  - ${type}: ${count}\n`;
        });
      report += `\n`;

      report += `Objects by Path:\n`;
      Object.entries(summary.byPath)
        .sort(([, a], [, b]) => b - a)
        .forEach(([path, count]) => {
          report += `  - ${path}: ${count}\n`;
        });
      report += `\n`;

      // Group objects by type for detailed listing
      const objectsByType: { [key: string]: any[] } = {};
      summary.discoveredObjects.forEach((obj) => {
        if (!objectsByType[obj.type]) {
          objectsByType[obj.type] = [];
        }
        objectsByType[obj.type].push(obj);
      });

      report += `DETAILED INVENTORY BY TYPE\n`;
      report += `${'-'.repeat(80)}\n\n`;

      // List Python Scripts
      if (objectsByType['Python Script']) {
        report += `PYTHON SCRIPTS (${objectsByType['Python Script'].length}):\n`;
        objectsByType['Python Script'].forEach((obj, idx) => {
          report += `  ${idx + 1}. ${obj.name}\n`;
          report += `     Path: ${obj.path}\n`;
          report += `     Size: ${obj.size}\n`;
          report += `     Last Modified: ${obj.lastModified}\n\n`;
        });
      }

      // List PySpark Scripts
      if (objectsByType['PySpark Script']) {
        report += `PYSPARK SCRIPTS (${objectsByType['PySpark Script'].length}):\n`;
        objectsByType['PySpark Script'].forEach((obj, idx) => {
          report += `  ${idx + 1}. ${obj.name}\n`;
          report += `     Path: ${obj.path}\n`;
          report += `     Size: ${obj.size}\n`;
          report += `     Dependencies: ${obj.dependencies || 0}\n`;
          report += `     Last Modified: ${obj.lastModified}\n\n`;
        });
      }

      // List Tables
      if (objectsByType['Table']) {
        report += `DATABASE TABLES (${objectsByType['Table'].length}):\n`;
        objectsByType['Table'].forEach((obj, idx) => {
          report += `  ${idx + 1}. ${obj.name}\n`;
          report += `     Path: ${obj.path}\n`;
          report += `     Size: ${obj.size}\n`;
          report += `     Rows: ${obj.rowCount ? obj.rowCount.toLocaleString() : 'N/A'}\n`;
          report += `     Last Modified: ${obj.lastModified}\n\n`;
        });
      }

      // List Fact Tables
      if (objectsByType['Fact Table']) {
        report += `FACT TABLES (${objectsByType['Fact Table'].length}):\n`;
        objectsByType['Fact Table'].forEach((obj, idx) => {
          report += `  ${idx + 1}. ${obj.name}\n`;
          report += `     Path: ${obj.path}\n`;
          report += `     Size: ${obj.size}\n`;
          report += `     Rows: ${obj.rowCount ? obj.rowCount.toLocaleString() : 'N/A'}\n`;
          report += `     Last Modified: ${obj.lastModified}\n\n`;
        });
      }

      // List Dimension Tables
      if (objectsByType['Dimension Table']) {
        report += `DIMENSION TABLES (${objectsByType['Dimension Table'].length}):\n`;
        objectsByType['Dimension Table'].forEach((obj, idx) => {
          report += `  ${idx + 1}. ${obj.name}\n`;
          report += `     Path: ${obj.path}\n`;
          report += `     Size: ${obj.size}\n`;
          report += `     Rows: ${obj.rowCount ? obj.rowCount.toLocaleString() : 'N/A'}\n`;
          report += `     Last Modified: ${obj.lastModified}\n\n`;
        });
      }

      // List Views
      if (objectsByType['View']) {
        report += `VIEWS (${objectsByType['View'].length}):\n`;
        objectsByType['View'].forEach((obj, idx) => {
          report += `  ${idx + 1}. ${obj.name}\n`;
          report += `     Path: ${obj.path}\n`;
          report += `     Last Modified: ${obj.lastModified}\n\n`;
        });
      }

      // List SQL Scripts
      if (objectsByType['SQL Script']) {
        report += `SQL SCRIPTS (${objectsByType['SQL Script'].length}):\n`;
        objectsByType['SQL Script'].forEach((obj, idx) => {
          report += `  ${idx + 1}. ${obj.name}\n`;
          report += `     Path: ${obj.path}\n`;
          report += `     Size: ${obj.size}\n`;
          report += `     Last Modified: ${obj.lastModified}\n\n`;
        });
      }

      // List other types
      Object.keys(objectsByType).forEach((type) => {
        if (!['Python Script', 'PySpark Script', 'Table', 'Fact Table', 'Dimension Table', 'View', 'SQL Script'].includes(type)) {
          report += `${type.toUpperCase()}S (${objectsByType[type].length}):\n`;
          objectsByType[type].forEach((obj, idx) => {
            report += `  ${idx + 1}. ${obj.name}\n`;
            report += `     Path: ${obj.path}\n`;
            if (obj.size) report += `     Size: ${obj.size}\n`;
            if (obj.lastModified) report += `     Last Modified: ${obj.lastModified}\n`;
            report += `\n`;
          });
        }
      });
    }

    if (formData.additionalNotes) {
      report += `ADDITIONAL NOTES\n`;
      report += `${'-'.repeat(80)}\n`;
      report += `${formData.additionalNotes}\n\n`;
    }

    report += `${'='.repeat(80)}\n`;
    report += `End of Report\n`;

    return report;
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const summary = formData.inventorySummary;

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-white mb-1">Discovery Complete</h2>
                  <p className="text-green-50">
                    {summary ? (
                      <>
                        Found <strong>{summary.totalObjects.toLocaleString()}</strong> objects across{' '}
                        <strong>{Object.keys(summary.byPath).length}</strong> locations •{' '}
                        {(() => {
                          const totalRows = summary.discoveredObjects.reduce((acc, obj) => 
                            acc + (obj.rowCount || 0), 0);
                          return totalRows > 1000000000 
                            ? `${(totalRows / 1000000000).toFixed(2)}B`
                            : totalRows > 1000000
                            ? `${(totalRows / 1000000).toFixed(1)}M`
                            : totalRows.toLocaleString();
                        })()} total rows
                      </>
                    ) : 'Report generated successfully'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleDownloadReport} 
                  variant="secondary"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Report (TXT)
                </Button>
                {summary && (
                  <Button 
                    onClick={handleDownloadInventory} 
                    variant="secondary"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Inventory (CSV)
                  </Button>
                )}
                <Button 
                  onClick={handleDownloadJSON} 
                  variant="secondary"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Data (JSON)
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <Building2 className="w-4 h-4" />
                  Project Name
                </p>
                <p>{formData.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <User className="w-4 h-4" />
                  Department
                </p>
                <p>{formData.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Priority</p>
                <Badge className={priorityColors[formData.priority]}>
                  {formData.priority.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <User className="w-4 h-4" />
                  Requestor
                </p>
                <p>{formData.requestorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-sm">{formData.requestorEmail}</p>
              </div>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Connection Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.connectionTargets.map((target) => (
                <div key={target.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    <strong>{target.name}</strong>
                    <Badge variant="outline">{target.type}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Host:</strong> {target.host}{target.port && `:${target.port}`}</p>
                    {target.username && <p><strong>Username:</strong> {target.username}</p>}
                    {target.authMethod && <p><strong>Auth:</strong> {target.authMethod}</p>}
                    <div>
                      <strong>Scanned Paths:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {target.paths.map((path, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {path}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {summary && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Discovery Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-4xl text-blue-600 mb-2">{summary.totalObjects.toLocaleString()}</div>
                    <div className="text-sm text-blue-900">Total Objects</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-4xl text-purple-600 mb-2">{Object.keys(summary.byType).length}</div>
                    <div className="text-sm text-purple-900">Object Types</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-4xl text-green-600 mb-2">{Object.keys(summary.byPath).length}</div>
                    <div className="text-sm text-green-900">Locations</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-4xl text-orange-600 mb-2">
                      {(() => {
                        const totalRows = summary.discoveredObjects.reduce((acc, obj) => 
                          acc + (obj.rowCount || 0), 0);
                        return totalRows > 1000000000 
                          ? `${(totalRows / 1000000000).toFixed(1)}B`
                          : totalRows > 1000000
                          ? `${(totalRows / 1000000).toFixed(1)}M`
                          : totalRows.toLocaleString();
                      })()}
                    </div>
                    <div className="text-sm text-orange-900">Total Rows</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4" />
                      Objects by Type
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(summary.byType)
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => {
                          const percentage = ((count / summary.totalObjects) * 100).toFixed(1);
                          return (
                            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
                              <div className="flex-1">
                                <span className="text-sm block">{type}</span>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="ml-3 text-right">
                                <Badge variant="secondary">{count.toLocaleString()}</Badge>
                                <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4" />
                      Objects by Location
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(summary.byPath)
                        .sort(([, a], [, b]) => b - a)
                        .map(([path, count]) => {
                          const percentage = ((count / summary.totalObjects) * 100).toFixed(1);
                          return (
                            <div key={path} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
                              <div className="flex-1">
                                <span className="text-sm block truncate max-w-xs" title={path}>{path}</span>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-green-600 h-1.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="ml-3 text-right">
                                <Badge variant="secondary">{count.toLocaleString()}</Badge>
                                <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Detailed Inventory ({summary.discoveredObjects.length.toLocaleString()} Objects)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Displaying first 100 objects below. Download CSV for complete inventory with all {summary.discoveredObjects.length.toLocaleString()} discovered objects.
                  </p>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Path</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Row Count</TableHead>
                          <TableHead>Last Modified</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.discoveredObjects.slice(0, 100).map((obj, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-sm">{obj.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{obj.type}</Badge>
                            </TableCell>
                            <TableCell className="text-sm max-w-xs truncate" title={obj.path}>
                              {obj.path}
                            </TableCell>
                            <TableCell className="text-sm">{obj.size || '-'}</TableCell>
                            <TableCell className="text-sm">
                              {obj.rowCount ? obj.rowCount.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-sm">{obj.lastModified || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {summary.discoveredObjects.length > 100 && (
                  <div className="mt-4 p-3 bg-gray-50 border rounded text-center">
                    <p className="text-sm text-gray-700">
                      + <strong>{(summary.discoveredObjects.length - 100).toLocaleString()}</strong> more objects not shown
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Download the complete CSV file to view all discovered objects
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {formData.additionalNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.additionalNotes}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center pt-6">
          <Button onClick={onReset} size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Create New Discovery Request
          </Button>
        </div>
      </div>
    </div>
  );
}
