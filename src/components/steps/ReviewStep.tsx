import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { DiscoveryFormData } from '../types';
import { User, Building2, Globe, Database, FileText, Server, Cloud, Cpu, Warehouse, Cog, MapPin, Plug, List, BarChart3, Shield, Calendar, AlertCircle, Table as TableIcon, GitBranch } from 'lucide-react';

interface ReviewStepProps {
  formData: DiscoveryFormData;
}

const formatLabel = (id: string, options: { id: string; label: string }[]): string => {
  return options.find((opt) => opt.id === id)?.label || id;
};

export function ReviewStep({ formData }: ReviewStepProps) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-900">
              Please review all information before submitting. You'll receive a confirmation email with next steps.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Project Name</p>
              <p>{formData.projectName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p>{formData.department || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Requestor</p>
              <p>{formData.requestorName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p>{formData.requestorEmail || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <Badge className={priorityColors[formData.priority]}>
                {formData.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Environment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Target Environments</p>
            <div className="flex flex-wrap gap-2">
              {formData.environments.length > 0 ? (
                formData.environments.map((env) => (
                  <Badge key={env} variant="secondary">{env}</Badge>
                ))
              ) : (
                <span className="text-gray-500">None selected</span>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <Cloud className="w-4 h-4" />
                Cloud Provider
              </p>
              <p>{formData.cloudProvider || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <Cpu className="w-4 h-4" />
                Infrastructure
              </p>
              <p>{formData.infrastructureType || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <Warehouse className="w-4 h-4" />
                Data Warehouse
              </p>
              <p>{formData.dataWarehouse || 'None'}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <Database className="w-4 h-4" />
              Databases
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.databases.length > 0 ? (
                formData.databases.map((db) => (
                  <Badge key={db} variant="outline">{db}</Badge>
                ))
              ) : (
                <span className="text-gray-500">None selected</span>
              )}
            </div>
          </div>

          {formData.orchestrationTool && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <Cog className="w-4 h-4" />
                  Orchestration Tool
                </p>
                <p>{formData.orchestrationTool}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Location & Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Geographic Regions
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.regions.length > 0 ? (
                formData.regions.map((region) => (
                  <Badge key={region} variant="secondary">{region}</Badge>
                ))
              ) : (
                <span className="text-gray-500">None selected</span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <Plug className="w-4 h-4" />
              Data Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.dataSources.length > 0 ? (
                formData.dataSources.map((source) => (
                  <Badge key={source} variant="outline">{source}</Badge>
                ))
              ) : (
                <span className="text-gray-500">None selected</span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <List className="w-4 h-4" />
              Inventory Scope
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.inventoryScope.length > 0 ? (
                formData.inventoryScope.map((scope) => (
                  <Badge key={scope} variant="secondary">{scope}</Badge>
                ))
              ) : (
                <span className="text-gray-500">None selected</span>
              )}
            </div>
          </div>


        </CardContent>
      </Card>

      {formData.connectionTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Connection Targets ({formData.connectionTargets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.connectionTargets.map((target) => (
                <div key={target.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <strong>{target.name}</strong>
                    <Badge variant="outline">{target.type}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Host:</strong> {target.host}{target.port && `:${target.port}`}</p>
                    {target.username && <p><strong>Username:</strong> {target.username}</p>}
                    <div>
                      <strong>Paths to scan:</strong>
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
    </div>
  );
}
