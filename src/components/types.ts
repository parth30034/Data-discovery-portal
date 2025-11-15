export interface ConnectionTarget {
  id: string;
  type: 'database' | 'etl-server' | 'data-warehouse';
  name: string;
  host: string;
  port?: string;
  paths: string[]; // schemas, databases, or folder paths to scan
  authMethod?: string;
  username?: string;
  additionalConfig?: string;
}

export interface DiscoveredObject {
  name: string;
  type: string;
  path: string;
  size?: string;
  rowCount?: number;
  lastModified?: string;
  dependencies?: number;
}

export interface InventorySummary {
  totalObjects: number;
  byType: { [key: string]: number };
  byPath: { [key: string]: number };
  discoveredObjects: DiscoveredObject[];
}

export interface DiscoveryFormData {
  // Basic Info
  projectName: string;
  requestorName: string;
  requestorEmail: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Environment Details
  environments: string[];
  cloudProvider: string;
  infrastructureType: string;
  databases: string[];
  dataWarehouse: string;
  orchestrationTool: string;
  
  // Location & Scope
  regions: string[];
  dataSources: string[];
  inventoryScope: string[];
  
  // Connection Targets
  connectionTargets: ConnectionTarget[];
  
  // Generated Inventory (populated after scan)
  inventorySummary?: InventorySummary;
  
  // Additional
  additionalNotes: string;
}
