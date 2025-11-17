import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { MultiSelect } from '../ui/multi-select';
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
  // Relational Databases
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'mariadb', label: 'MariaDB' },
  { id: 'oracle', label: 'Oracle Database' },
  { id: 'sqlserver', label: 'Microsoft SQL Server' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'db2', label: 'IBM DB2' },
  { id: 'snowflake', label: 'Snowflake' },
  { id: 'teradata', label: 'Teradata' },
  { id: 'sap-hana', label: 'SAP HANA' },
  { id: 'cockroachdb', label: 'CockroachDB' },
  
  // NoSQL Document Databases
  { id: 'mongodb', label: 'MongoDB' },
  { id: 'couchdb', label: 'Apache CouchDB' },
  { id: 'ravendb', label: 'RavenDB' },
  { id: 'couchbase', label: 'Couchbase' },
  { id: 'cosmosdb', label: 'Azure Cosmos DB' },
  { id: 'firestore', label: 'Google Cloud Firestore' },
  { id: 'documentdb', label: 'Amazon DocumentDB' },
  
  // NoSQL Key-Value Stores
  { id: 'redis', label: 'Redis' },
  { id: 'dynamodb', label: 'Amazon DynamoDB' },
  { id: 'riak', label: 'Riak' },
  { id: 'hazelcast', label: 'Hazelcast IMDG' },
  { id: 'memcached', label: 'Memcached' },
  { id: 'etcd', label: 'etcd' },
  
  // NoSQL Column Family / Wide Column
  { id: 'cassandra', label: 'Apache Cassandra' },
  { id: 'hbase', label: 'Apache HBase' },
  { id: 'accumulo', label: 'Apache Accumulo' },
  { id: 'scylladb', label: 'ScyllaDB' },
  
  // Graph Databases
  { id: 'neo4j', label: 'Neo4j' },
  { id: 'arangodb', label: 'ArangoDB' },
  { id: 'amazon-neptune', label: 'Amazon Neptune' },
  { id: 'titan', label: 'Apache TinkerPop / Titan' },
  { id: 'orientdb', label: 'OrientDB' },
  { id: 'janusgraph', label: 'JanusGraph' },
  
  // Time-Series Databases
  { id: 'influxdb', label: 'InfluxDB' },
  { id: 'timescaledb', label: 'TimescaleDB' },
  { id: 'prometheus', label: 'Prometheus' },
  { id: 'opentsdb', label: 'OpenTSDB' },
  { id: 'questdb', label: 'QuestDB' },
  { id: 'aws-timestream', label: 'AWS Timestream' },
  
  // Search & Analytics Engines
  { id: 'elasticsearch', label: 'Elasticsearch' },
  { id: 'opensearch', label: 'OpenSearch' },
  { id: 'solr', label: 'Apache Solr' },
  { id: 'splunk', label: 'Splunk' },
  { id: 'algolia', label: 'Algolia' },
  
  // Data Warehouses
  { id: 'redshift', label: 'Amazon Redshift' },
  { id: 'bigquery', label: 'Google BigQuery' },
  { id: 'synapse', label: 'Azure Synapse Analytics' },
  { id: 'databricks', label: 'Databricks' },
  { id: 'clickhouse', label: 'ClickHouse' },
  { id: 'druid', label: 'Apache Druid' },
  
  // Other Specialized Databases
  { id: 'spark-sql', label: 'Apache Spark SQL' },
  { id: 'presto', label: 'Presto / Trino' },
  { id: 'greenplum', label: 'Greenplum' },
  { id: 'vertica', label: 'Vertica' },
];

export function EnvironmentStep({ formData, updateFormData }: EnvironmentStepProps) {
  const toggleEnvironment = (envId: string) => {
    const updated = formData.environments.includes(envId)
      ? formData.environments.filter((e) => e !== envId)
      : [...formData.environments, envId];
    updateFormData({ environments: updated });
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

      <div className="space-y-2">
        <Label htmlFor="databases">Database Technologies *</Label>
        <MultiSelect
          id="databases"
          options={DATABASE_OPTIONS}
          selected={formData.databases}
          onChange={(selected) => updateFormData({ databases: selected })}
          placeholder="Select database technologies..."
        />
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
