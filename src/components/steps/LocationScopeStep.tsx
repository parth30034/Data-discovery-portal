import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import type { DiscoveryFormData } from '../types';

interface LocationScopeStepProps {
  formData: DiscoveryFormData;
  updateFormData: (data: Partial<DiscoveryFormData>) => void;
}

const REGION_OPTIONS = [
  { id: 'us-east', label: 'US East' },
  { id: 'us-west', label: 'US West' },
  { id: 'eu-west', label: 'Europe West' },
  { id: 'eu-central', label: 'Europe Central' },
  { id: 'asia-pacific', label: 'Asia Pacific' },
  { id: 'middle-east', label: 'Middle East' },
  { id: 'south-america', label: 'South America' },
  { id: 'africa', label: 'Africa' },
];

const DATA_SOURCE_OPTIONS = [
  { id: 'databases', label: 'Relational Databases' },
  { id: 'nosql', label: 'NoSQL Databases' },
  { id: 'apis', label: 'REST/GraphQL APIs' },
  { id: 'files', label: 'File Systems (CSV, JSON, XML)' },
  { id: 'streaming', label: 'Streaming Data (Kafka, Kinesis)' },
  { id: 'saas', label: 'SaaS Applications' },
  { id: 'logs', label: 'Log Files' },
  { id: 'other', label: 'Other Sources' },
];

const INVENTORY_SCOPE_OPTIONS = [
  { id: 'schemas', label: 'Database Schemas & Tables' },
  { id: 'columns', label: 'Column-level Metadata' },
  { id: 'lineage', label: 'Data Lineage' },
  { id: 'quality', label: 'Data Quality Rules' },
  { id: 'pipelines', label: 'ETL/ELT Pipelines' },
  { id: 'jobs', label: 'Scheduled Jobs' },
  { id: 'access', label: 'Access Patterns & Users' },
  { id: 'dependencies', label: 'System Dependencies' },
];



export function LocationScopeStep({ formData, updateFormData }: LocationScopeStepProps) {
  const toggleRegion = (regionId: string) => {
    const updated = formData.regions.includes(regionId)
      ? formData.regions.filter((r) => r !== regionId)
      : [...formData.regions, regionId];
    updateFormData({ regions: updated });
  };

  const toggleDataSource = (sourceId: string) => {
    const updated = formData.dataSources.includes(sourceId)
      ? formData.dataSources.filter((s) => s !== sourceId)
      : [...formData.dataSources, sourceId];
    updateFormData({ dataSources: updated });
  };

  const toggleInventoryScope = (scopeId: string) => {
    const updated = formData.inventoryScope.includes(scopeId)
      ? formData.inventoryScope.filter((s) => s !== scopeId)
      : [...formData.inventoryScope, scopeId];
    updateFormData({ inventoryScope: updated });
  };



  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Geographic Regions *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REGION_OPTIONS.map((region) => (
            <div key={region.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={region.id}
                checked={formData.regions.includes(region.id)}
                onCheckedChange={() => toggleRegion(region.id)}
              />
              <label htmlFor={region.id} className="flex-1 cursor-pointer text-sm">
                {region.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Data Sources *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DATA_SOURCE_OPTIONS.map((source) => (
            <div key={source.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={source.id}
                checked={formData.dataSources.includes(source.id)}
                onCheckedChange={() => toggleDataSource(source.id)}
              />
              <label htmlFor={source.id} className="flex-1 cursor-pointer">
                {source.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Inventory Scope *</Label>
        <p className="text-sm text-gray-600">Select what should be included in the inventory</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVENTORY_SCOPE_OPTIONS.map((scope) => (
            <div key={scope.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={scope.id}
                checked={formData.inventoryScope.includes(scope.id)}
                onCheckedChange={() => toggleInventoryScope(scope.id)}
              />
              <label htmlFor={scope.id} className="flex-1 cursor-pointer">
                {scope.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          placeholder="Any additional information, special requirements, or constraints..."
          rows={4}
          value={formData.additionalNotes}
          onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
        />
      </div>
    </div>
  );
}
