import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import type { DiscoveryFormData } from '../types';

interface EnvironmentStepProps {
  formData: DiscoveryFormData;
  updateFormData: (data: Partial<DiscoveryFormData>) => void;
}

const ENVIRONMENT_OPTIONS = [
  { id: 'development', label: 'Development' },
  { id: 'testing', label: 'Testing/QA' },
  { id: 'staging', label: 'Staging' },
  { id: 'production', label: 'Production' },
  { id: 'dr', label: 'Disaster Recovery' },
];

const DATABASE_OPTIONS = [
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'oracle', label: 'Oracle' },
  { id: 'sqlserver', label: 'SQL Server' },
  { id: 'mongodb', label: 'MongoDB' },
  { id: 'dynamodb', label: 'DynamoDB' },
  { id: 'cassandra', label: 'Cassandra' },
  { id: 'redis', label: 'Redis' },
];

export function EnvironmentStep({ formData, updateFormData }: EnvironmentStepProps) {
  const toggleEnvironment = (envId: string) => {
    const updated = formData.environments.includes(envId)
      ? formData.environments.filter((e) => e !== envId)
      : [...formData.environments, envId];
    updateFormData({ environments: updated });
  };

  const toggleDatabase = (dbId: string) => {
    const updated = formData.databases.includes(dbId)
      ? formData.databases.filter((d) => d !== dbId)
      : [...formData.databases, dbId];
    updateFormData({ databases: updated });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Target Environments *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ENVIRONMENT_OPTIONS.map((env) => (
            <div key={env.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={env.id}
                checked={formData.environments.includes(env.id)}
                onCheckedChange={() => toggleEnvironment(env.id)}
              />
              <label htmlFor={env.id} className="flex-1 cursor-pointer">
                {env.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cloudProvider">Cloud Provider *</Label>
          <Select
            value={formData.cloudProvider}
            onValueChange={(value) => updateFormData({ cloudProvider: value })}
          >
            <SelectTrigger id="cloudProvider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
              <SelectItem value="azure">Microsoft Azure</SelectItem>
              <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
              <SelectItem value="multi">Multi-Cloud</SelectItem>
              <SelectItem value="onprem">On-Premise</SelectItem>
              <SelectItem value="hybrid">Hybrid Cloud</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="infrastructureType">Infrastructure Type *</Label>
          <Select
            value={formData.infrastructureType}
            onValueChange={(value) => updateFormData({ infrastructureType: value })}
          >
            <SelectTrigger id="infrastructureType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="serverless">Serverless</SelectItem>
              <SelectItem value="containers">Containers (Docker/K8s)</SelectItem>
              <SelectItem value="vms">Virtual Machines</SelectItem>
              <SelectItem value="bare-metal">Bare Metal</SelectItem>
              <SelectItem value="mixed">Mixed Infrastructure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Database Technologies *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DATABASE_OPTIONS.map((db) => (
            <div key={db.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={db.id}
                checked={formData.databases.includes(db.id)}
                onCheckedChange={() => toggleDatabase(db.id)}
              />
              <label htmlFor={db.id} className="flex-1 cursor-pointer text-sm">
                {db.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dataWarehouse">Data Warehouse</Label>
          <Select
            value={formData.dataWarehouse}
            onValueChange={(value) => updateFormData({ dataWarehouse: value })}
          >
            <SelectTrigger id="dataWarehouse">
              <SelectValue placeholder="Select if applicable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="snowflake">Snowflake</SelectItem>
              <SelectItem value="redshift">Amazon Redshift</SelectItem>
              <SelectItem value="bigquery">Google BigQuery</SelectItem>
              <SelectItem value="synapse">Azure Synapse</SelectItem>
              <SelectItem value="databricks">Databricks</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="orchestrationTool">Orchestration Tool</Label>
          <Select
            value={formData.orchestrationTool}
            onValueChange={(value) => updateFormData({ orchestrationTool: value })}
          >
            <SelectTrigger id="orchestrationTool">
              <SelectValue placeholder="Select if applicable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="airflow">Apache Airflow</SelectItem>
              <SelectItem value="prefect">Prefect</SelectItem>
              <SelectItem value="dagster">Dagster</SelectItem>
              <SelectItem value="Luigi">Luigi</SelectItem>
              <SelectItem value="stepfunctions">AWS Step Functions</SelectItem>
              <SelectItem value="adf">Azure Data Factory</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
