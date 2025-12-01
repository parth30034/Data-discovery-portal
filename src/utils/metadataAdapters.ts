/**
 * Metadata Adapters - Transform source-specific metadata to normalized format
 * 
 * This allows your UI to work with any data source (Azure, AWS, Postgres, etc.)
 * while backend teams can continue dumping their native formats.
 */

// ============================================================================
// NORMALIZED TYPES (Domain-Agnostic)
// ============================================================================

export interface NormalizedMetadata {
  metadata_version: string;
  source: SourceInfo;
  scan_info: ScanInfo;
  summary: Summary;
  entities: Entity[];
  relationships?: Relationship[];
  raw_metadata?: any; // Keep original for debugging
}

export interface SourceInfo {
  type: SourceType;
  provider: 'azure' | 'aws' | 'gcp' | 'on_premise';
  name: string;
  region?: string;
  connection_id?: string;
  [key: string]: any; // Additional source-specific fields
}

export type SourceType = 
  | 'azure_adls' 
  | 'azure_synapse' 
  | 'azure_sql'
  | 'aws_s3' 
  | 'aws_glue' 
  | 'aws_rds'
  | 'gcp_bigquery' 
  | 'gcp_gcs'
  | 'postgres' 
  | 'oracle' 
  | 'mysql' 
  | 'sqlserver'
  | 'filesystem';

export interface ScanInfo {
  scan_id: string;
  timestamp: string;
  duration_ms: number;
  scanner_version?: string;
  mode?: 'full' | 'incremental';
  status: 'completed' | 'failed' | 'partial';
  items_scanned: number;
  items_failed: number;
}

export interface Summary {
  total_entities: number;
  by_type: Record<string, number>;
  by_category: Record<string, number>;
  total_size_bytes?: number;
  date_range?: {
    earliest: string;
    latest: string;
  };
}

export interface Entity {
  id: string;
  name: string;
  fully_qualified_name: string;
  type: EntityType;
  category: Category;
  format?: string;
  location: EntityLocation;
  properties: EntityProperties;
  schema?: Schema | null;
  lineage?: Lineage;
  tags: string[];
  custom_attributes: Record<string, any>;
}

export type EntityType = 
  | 'table' | 'view' | 'materialized_view'
  | 'file' | 'folder'
  | 'job' | 'pipeline' | 'workflow'
  | 'stored_procedure' | 'function'
  | 'unknown';

export type Category = 'data' | 'code' | 'config' | 'log' | 'metadata';

export interface EntityLocation {
  container?: string;
  schema?: string;
  path: string;
  url?: string;
}

export interface EntityProperties {
  size_bytes?: number | null;
  row_count?: number | null;
  column_count?: number | null;
  created_at?: string | null;
  modified_at?: string | null;
  accessed_at?: string | null;
  owner?: string | null;
  description?: string | null;
  [key: string]: any;
}

export interface Schema {
  columns?: Column[];
  partitions?: any[];
  indexes?: any[];
}

export interface Column {
  name: string;
  type: string;
  native_type: string;
  nullable: boolean;
  description?: string;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
}

export interface Lineage {
  upstream: string[];
  downstream: string[];
}

export interface Relationship {
  from: string;
  to: string;
  type: string;
  properties?: Record<string, any>;
}

// ============================================================================
// ADAPTER INTERFACE
// ============================================================================

export interface MetadataAdapter {
  /**
   * Normalize source-specific metadata to common format
   */
  normalize(raw: any): NormalizedMetadata;
  
  /**
   * Detect if this adapter can handle the given data
   */
  canHandle(raw: any): boolean;
  
  /**
   * Get source type identifier
   */
  getSourceType(): SourceType;
}

// ============================================================================
// AZURE ADLS ADAPTER (Your Current Format)
// ============================================================================

export class AzureADLSAdapter implements MetadataAdapter {
  getSourceType(): SourceType {
    return 'azure_adls';
  }

  canHandle(raw: any): boolean {
    return (
      raw?.files &&
      Array.isArray(raw.files) &&
      raw?.run_info?.mode === 'remote'
    );
  }

  normalize(raw: any): NormalizedMetadata {
    // Extract source info
    const sourceInfo: SourceInfo = {
      type: 'azure_adls',
      provider: 'azure',
      name: this.extractStorageAccountName(raw.run_info?.host) || 'unknown',
      connection_id: raw.run_info?.host,
    };

    // Extract scan info
    const scanInfo: ScanInfo = {
      scan_id: `scan_${raw.run_info?.timestamp?.replace(/[:.]/g, '_') || 'unknown'}`,
      timestamp: raw.run_info?.timestamp || new Date().toISOString(),
      duration_ms: Math.round((raw.run_info?.duration_sec || 0) * 1000),
      mode: raw.run_info?.mode === 'remote' ? 'full' : 'incremental',
      status: 'completed',
      items_scanned: raw.summary?.total_files || 0,
      items_failed: 0,
    };

    // Extract summary
    const summary: Summary = {
      total_entities: raw.summary?.total_files || 0,
      by_type: this.mapByType(raw.files || []),
      by_category: {
        data: raw.summary?.total_data_files || 0,
        code: (raw.summary?.total_python_jobs || 0) + (raw.summary?.total_spark_jobs || 0),
        config: raw.summary?.total_configs || 0,
        log: raw.summary?.total_logs || 0,
      },
      total_size_bytes: this.calculateTotalSize(raw.files || []),
      date_range: this.extractDateRange(raw.files || []),
    };

    // Transform entities
    const entities: Entity[] = (raw.files || []).map((file: any, index: number) =>
      this.normalizeFile(file, index, raw.run_info?.host)
    );

    return {
      metadata_version: '1.0',
      source: sourceInfo,
      scan_info: scanInfo,
      summary,
      entities,
      raw_metadata: {
        original_format: 'adls_scan_result',
        data: raw,
      },
    };
  }

  private normalizeFile(file: any, index: number, host?: string): Entity {
    const extension = file.extension || '';
    const category = this.mapCategory(file.category);
    const type = this.inferEntityType(file);

    return {
      id: `entity_${String(index + 1).padStart(3, '0')}`,
      name: file.name || 'unknown',
      fully_qualified_name: file.path || '',
      type,
      category,
      format: extension.replace('.', ''),
      location: {
        path: file.path || '',
        url: host ? `https://${host}${file.path}` : undefined,
      },
      properties: {
        size_bytes: file.size_bytes,
        row_count: null,
        column_count: null,
        created_at: null,
        modified_at: file.modified || null,
        total_lines: file.total_lines,
        effective_loc: file.effective_loc,
      },
      schema: null,
      lineage: {
        upstream: [],
        downstream: [],
      },
      tags: this.generateTags(file),
      custom_attributes: {
        original_category: file.category,
        extension: file.extension,
      },
    };
  }

  private inferEntityType(file: any): EntityType {
    const category = file.category?.toLowerCase() || '';
    
    if (category.includes('python') || category.includes('spark')) {
      return 'job';
    }
    if (category.includes('sql')) {
      return 'stored_procedure';
    }
    if (category === 'data_file') {
      return 'file';
    }
    return 'file';
  }

  private mapCategory(category: string): Category {
    const lower = (category || '').toLowerCase();
    
    if (lower.includes('data')) return 'data';
    if (lower.includes('python') || lower.includes('spark') || lower.includes('sql') || lower.includes('job')) return 'code';
    if (lower.includes('config')) return 'config';
    if (lower.includes('log')) return 'log';
    
    return 'data';
  }

  private mapByType(files: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const file of files) {
      const type = this.inferEntityType(file);
      counts[type] = (counts[type] || 0) + 1;
    }
    
    return counts;
  }

  private calculateTotalSize(files: any[]): number {
    return files.reduce((sum, file) => sum + (file.size_bytes || 0), 0);
  }

  private extractDateRange(files: any[]): { earliest: string; latest: string } | undefined {
    const dates = files
      .map(f => f.modified)
      .filter(d => d != null)
      .map(d => new Date(d).getTime());
    
    if (dates.length === 0) return undefined;
    
    const earliest = new Date(Math.min(...dates)).toISOString();
    const latest = new Date(Math.max(...dates)).toISOString();
    
    return { earliest, latest };
  }

  private extractStorageAccountName(host?: string): string | null {
    if (!host) return null;
    // Extract from IP or hostname
    return host.split('.')[0];
  }

  private generateTags(file: any): string[] {
    const tags: string[] = [];
    
    if (file.category) tags.push(file.category);
    if (file.extension) tags.push(file.extension.replace('.', ''));
    
    return tags;
  }
}

// ============================================================================
// POSTGRES ADAPTER (Example for Database Scanner)
// ============================================================================

export class PostgresAdapter implements MetadataAdapter {
  getSourceType(): SourceType {
    return 'postgres';
  }

  canHandle(raw: any): boolean {
    return (
      raw?.source?.type === 'postgres' ||
      raw?.database_type === 'postgresql'
    );
  }

  normalize(raw: any): NormalizedMetadata {
    // Implement normalization for Postgres metadata
    // This would transform Postgres-specific schema dumps to normalized format
    
    return {
      metadata_version: '1.0',
      source: {
        type: 'postgres',
        provider: 'on_premise',
        name: raw.database_name || 'unknown',
        connection_id: raw.connection_id,
      },
      scan_info: {
        scan_id: raw.scan_id || `scan_${Date.now()}`,
        timestamp: raw.scan_timestamp || new Date().toISOString(),
        duration_ms: raw.scan_duration_ms || 0,
        status: 'completed',
        items_scanned: raw.tables?.length || 0,
        items_failed: 0,
      },
      summary: {
        total_entities: raw.tables?.length || 0,
        by_type: {
          table: raw.tables?.filter((t: any) => t.type === 'TABLE').length || 0,
          view: raw.tables?.filter((t: any) => t.type === 'VIEW').length || 0,
        },
        by_category: {
          data: raw.tables?.length || 0,
        },
      },
      entities: (raw.tables || []).map((table: any, index: number) =>
        this.normalizeTable(table, index, raw.database_name)
      ),
      raw_metadata: {
        original_format: 'postgres_schema_dump',
        data: raw,
      },
    };
  }

  private normalizeTable(table: any, index: number, database: string): Entity {
    return {
      id: `pg_table_${String(index + 1).padStart(3, '0')}`,
      name: table.table_name,
      fully_qualified_name: `${database}.${table.schema}.${table.table_name}`,
      type: table.type === 'VIEW' ? 'view' : 'table',
      category: 'data',
      format: 'table',
      location: {
        container: database,
        schema: table.schema,
        path: `${table.schema}.${table.table_name}`,
      },
      properties: {
        row_count: table.row_count,
        column_count: table.columns?.length,
        size_bytes: table.size_bytes,
        created_at: table.created_at,
        modified_at: table.modified_at,
        owner: table.owner,
      },
      schema: {
        columns: (table.columns || []).map((col: any) => ({
          name: col.column_name,
          type: this.normalizeType(col.data_type),
          native_type: col.data_type,
          nullable: col.is_nullable === 'YES',
          is_primary_key: col.is_primary_key || false,
          is_foreign_key: col.is_foreign_key || false,
        })),
      },
      lineage: {
        upstream: [],
        downstream: [],
      },
      tags: [table.schema, table.type?.toLowerCase() || 'table'],
      custom_attributes: {
        tablespace: table.tablespace,
        has_indexes: table.indexes?.length > 0,
      },
    };
  }

  private normalizeType(pgType: string): string {
    const typeMap: Record<string, string> = {
      'character varying': 'string',
      'varchar': 'string',
      'text': 'string',
      'integer': 'integer',
      'bigint': 'integer',
      'smallint': 'integer',
      'numeric': 'decimal',
      'decimal': 'decimal',
      'real': 'decimal',
      'double precision': 'decimal',
      'timestamp': 'timestamp',
      'date': 'date',
      'boolean': 'boolean',
      'bytea': 'binary',
      'json': 'json',
      'jsonb': 'json',
    };

    const normalized = pgType.toLowerCase();
    for (const [key, value] of Object.entries(typeMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return 'unknown';
  }
}

// ============================================================================
// AWS S3 ADAPTER (Example for Cloud Storage)
// ============================================================================

export class AWSS3Adapter implements MetadataAdapter {
  getSourceType(): SourceType {
    return 'aws_s3';
  }

  canHandle(raw: any): boolean {
    return (
      raw?.source?.type === 'aws_s3' ||
      raw?.bucket_name != null
    );
  }

  normalize(raw: any): NormalizedMetadata {
    // Similar to Azure ADLS but for S3
    return {
      metadata_version: '1.0',
      source: {
        type: 'aws_s3',
        provider: 'aws',
        name: raw.bucket_name || 'unknown',
        region: raw.region,
      },
      scan_info: {
        scan_id: raw.scan_id || `scan_${Date.now()}`,
        timestamp: raw.timestamp || new Date().toISOString(),
        duration_ms: raw.duration_ms || 0,
        status: 'completed',
        items_scanned: raw.objects?.length || 0,
        items_failed: 0,
      },
      summary: {
        total_entities: raw.objects?.length || 0,
        by_type: { file: raw.objects?.length || 0 },
        by_category: { data: raw.objects?.length || 0 },
        total_size_bytes: raw.total_size || 0,
      },
      entities: (raw.objects || []).map((obj: any, index: number) =>
        this.normalizeS3Object(obj, index, raw.bucket_name)
      ),
      raw_metadata: {
        original_format: 's3_inventory',
        data: raw,
      },
    };
  }

  private normalizeS3Object(obj: any, index: number, bucket: string): Entity {
    return {
      id: `s3_obj_${String(index + 1).padStart(3, '0')}`,
      name: this.getFileName(obj.key),
      fully_qualified_name: `s3://${bucket}/${obj.key}`,
      type: 'file',
      category: 'data',
      format: this.getFileExtension(obj.key),
      location: {
        container: bucket,
        path: obj.key,
        url: `s3://${bucket}/${obj.key}`,
      },
      properties: {
        size_bytes: obj.size,
        created_at: obj.last_modified,
        modified_at: obj.last_modified,
      },
      schema: null,
      lineage: { upstream: [], downstream: [] },
      tags: this.extractTagsFromPath(obj.key),
      custom_attributes: {
        storage_class: obj.storage_class,
        etag: obj.etag,
      },
    };
  }

  private getFileName(key: string): string {
    return key.split('/').pop() || key;
  }

  private getFileExtension(key: string): string {
    const parts = key.split('.');
    return parts.length > 1 ? parts.pop() || '' : '';
  }

  private extractTagsFromPath(key: string): string[] {
    return key.split('/').filter(p => p && p !== '.');
  }
}

// ============================================================================
// ADAPTER REGISTRY & FACTORY
// ============================================================================

export class AdapterRegistry {
  private adapters: MetadataAdapter[] = [];

  constructor() {
    // Register all adapters
    this.register(new AzureADLSAdapter());
    this.register(new PostgresAdapter());
    this.register(new AWSS3Adapter());
    // Add more adapters as needed
  }

  register(adapter: MetadataAdapter): void {
    this.adapters.push(adapter);
  }

  getAdapter(raw: any): MetadataAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.canHandle(raw)) {
        return adapter;
      }
    }
    return null;
  }

  normalize(raw: any): NormalizedMetadata | null {
    const adapter = this.getAdapter(raw);
    if (!adapter) {
      console.error('No adapter found for data:', raw);
      return null;
    }
    return adapter.normalize(raw);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const adapterRegistry = new AdapterRegistry();

// ============================================================================
// CONVENIENCE FUNCTION
// ============================================================================

/**
 * Normalize any source-specific metadata to common format
 */
export function normalizeMetadata(raw: any): NormalizedMetadata | null {
  return adapterRegistry.normalize(raw);
}
