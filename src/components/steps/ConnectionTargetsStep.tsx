import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Database, Server, Warehouse, Trash2, Plus, Info } from 'lucide-react';
import type { DiscoveryFormData, ConnectionTarget } from '../types';

interface ConnectionTargetsStepProps {
  formData: DiscoveryFormData;
  updateFormData: (data: Partial<DiscoveryFormData>) => void;
}

export function ConnectionTargetsStep({ formData, updateFormData }: ConnectionTargetsStepProps) {
  const [newTarget, setNewTarget] = useState<Partial<ConnectionTarget>>({
    type: 'database',
    name: '',
    host: '',
    port: '',
    paths: [],
    authMethod: 'username-password',
    username: '',
    additionalConfig: '',
  });

  const [pathInput, setPathInput] = useState('');

  const addPath = () => {
    if (pathInput.trim()) {
      setNewTarget({
        ...newTarget,
        paths: [...(newTarget.paths || []), pathInput.trim()],
      });
      setPathInput('');
    }
  };

  const removePath = (index: number) => {
    const updatedPaths = [...(newTarget.paths || [])];
    updatedPaths.splice(index, 1);
    setNewTarget({ ...newTarget, paths: updatedPaths });
  };

  const addTarget = () => {
    if (newTarget.name && newTarget.host && newTarget.paths && newTarget.paths.length > 0) {
      const target: ConnectionTarget = {
        id: Date.now().toString(),
        type: newTarget.type as 'database' | 'etl-server' | 'data-warehouse',
        name: newTarget.name,
        host: newTarget.host,
        port: newTarget.port,
        paths: newTarget.paths,
        authMethod: newTarget.authMethod,
        username: newTarget.username,
        additionalConfig: newTarget.additionalConfig,
      };
      updateFormData({ connectionTargets: [...formData.connectionTargets, target] });
      setNewTarget({
        type: 'database',
        name: '',
        host: '',
        port: '',
        paths: [],
        authMethod: 'username-password',
        username: '',
        additionalConfig: '',
      });
      setPathInput('');
    }
  };

  const removeTarget = (id: string) => {
    updateFormData({ connectionTargets: formData.connectionTargets.filter((t) => t.id !== id) });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'etl-server':
        return <Server className="w-4 h-4" />;
      case 'data-warehouse':
        return <Warehouse className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getDefaultPort = (type: string) => {
    switch (type) {
      case 'database':
        return '5432'; // PostgreSQL default
      case 'etl-server':
        return '8080';
      case 'data-warehouse':
        return '443';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-900 mb-2">
              Provide connection details for databases or ETL servers you want to discover. Our automated tool will scan the specified paths and generate a complete inventory of all objects.
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• For databases: specify schemas or database names (e.g., "public", "dbo", "sales_db")</li>
              <li>• For ETL servers: specify project folders or pipeline paths (e.g., "/pipelines/prod", "/jobs/daily")</li>
              <li>• Multiple paths can be added for each connection</li>
            </ul>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Connection Target</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetType">Target Type *</Label>
              <Select
                value={newTarget.type || 'database'}
                onValueChange={(value: any) => {
                  setNewTarget({ 
                    ...newTarget, 
                    type: value,
                    port: getDefaultPort(value)
                  });
                }}
              >
                <SelectTrigger id="targetType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database">Database Server</SelectItem>
                  <SelectItem value="etl-server">ETL/Orchestration Server</SelectItem>
                  <SelectItem value="data-warehouse">Data Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetName">Connection Name *</Label>
              <Input
                id="targetName"
                placeholder="e.g., Production PostgreSQL"
                value={newTarget.name || ''}
                onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="host">Host/Endpoint *</Label>
              <Input
                id="host"
                placeholder="e.g., db.example.com or 10.0.1.50"
                value={newTarget.host || ''}
                onChange={(e) => setNewTarget({ ...newTarget, host: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="e.g., 5432"
                value={newTarget.port || ''}
                onChange={(e) => setNewTarget({ ...newTarget, port: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authMethod">Authentication Method</Label>
              <Select
                value={newTarget.authMethod || 'username-password'}
                onValueChange={(value) => setNewTarget({ ...newTarget, authMethod: value })}
              >
                <SelectTrigger id="authMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="username-password">Username/Password</SelectItem>
                  <SelectItem value="ssh-key">SSH Key</SelectItem>
                  <SelectItem value="service-account">Service Account</SelectItem>
                  <SelectItem value="iam-role">IAM Role</SelectItem>
                  <SelectItem value="token">API Token</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Database/service username"
                value={newTarget.username || ''}
                onChange={(e) => setNewTarget({ ...newTarget, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pathInput">
              Paths to Scan * 
              <span className="text-sm text-gray-500 ml-2">
                (Schemas, databases, or folder paths)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="pathInput"
                placeholder="e.g., public, dbo, /pipelines/prod"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPath();
                  }
                }}
              />
              <Button type="button" onClick={addPath} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {newTarget.paths && newTarget.paths.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newTarget.paths.map((path, index) => (
                  <Badge key={index} variant="secondary" className="gap-2">
                    {path}
                    <button
                      onClick={() => removePath(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalConfig">Additional Configuration</Label>
            <Textarea
              id="additionalConfig"
              placeholder="SSL settings, connection parameters, or other relevant config..."
              rows={2}
              value={newTarget.additionalConfig || ''}
              onChange={(e) => setNewTarget({ ...newTarget, additionalConfig: e.target.value })}
            />
          </div>

          <Button onClick={addTarget} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Connection Target
          </Button>
        </CardContent>
      </Card>

      {formData.connectionTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Added Connection Targets ({formData.connectionTargets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.connectionTargets.map((target) => (
                <div
                  key={target.id}
                  className="flex items-start justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getIconForType(target.type)}
                      <strong>{target.name}</strong>
                      <Badge variant="outline" className="text-xs">
                        {target.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Host:</strong> {target.host}
                        {target.port && `:${target.port}`}
                      </p>
                      {target.username && (
                        <p>
                          <strong>Username:</strong> {target.username}
                        </p>
                      )}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTarget(target.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
