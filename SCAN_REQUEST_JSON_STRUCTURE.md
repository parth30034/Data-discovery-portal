# Scan Request JSON Structure - Design Proposal

## Overview

This document defines the proposed modular JSON structure for `scan_request.json` that will be used by the orchestrator to trigger backend scanners. The structure is designed to be clear, precise, scalable, and easy to work with from both the UI and orchestrator perspectives.

## Design Goals

1. **Clear Orchestrator Execution** - Unambiguous routing to specific scanners
2. **UI-Friendly** - Easy to collect via form fields
3. **Scalable** - Easy to add new connector types
4. **Type-Safe** - Validatable structure
5. **Secure** - No credentials stored in JSON

## Proposed JSON Structure

```json
{
  "metadata": {
    "project_id": "project_1736942400000",
    "project_name": "Data Migration Project",
    "timestamp": "2025-01-15T10:30:00Z",
    "requestor": {
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Engineering"
    },
    "priority": "high"
  },
  
  "scan_settings": {
    "timeout_seconds": 3600,
    "max_retries": 2,
    "parallel_execution": true
  },
  
  "connectors": [
    {
      "id": "conn_001",
      "connector_name": "postgresql",
      "display_name": "PostgreSQL Production",
      "enabled": true,
      "priority": 1,
      
      "connection": {
        "host": "db-prod.example.com",
        "port": 5432,
        "database": "production_db"
      },
      
      "authentication": {
        "method": "credential_store",
        "credential_key": "postgres-prod-creds"
      },
      
      "scan_config": {
        "targets": {
          "schemas": ["public", "sales", "inventory"]
        },
        "options": {
          "include_tables": true,
          "include_views": true,
          "include_functions": true,
          "include_stored_procedures": true,
          "include_row_counts": true,
          "analyze_complexity": true
        }
      }
    },
    
    {
      "id": "conn_002",
      "connector_name": "adls_gen2",
      "display_name": "ADLS Production Storage",
      "enabled": true,
      "priority": 2,
      
      "connection": {
        "storage_account": "prodstorageaccount",
        "container": "data-lake",
        "path_prefix": "/raw-data"
      },
      
      "authentication": {
        "method": "managed_identity"
      },
      
      "scan_config": {
        "targets": {
          "paths": [
            "/raw-data/customers",
            "/raw-data/orders"
          ],
          "recursive": true,
          "max_depth": 10
        },
        "options": {
          "file_types": [".parquet", ".csv", ".json"],
          "extract_schema": true,
          "calculate_statistics": true
        }
      }
    },
    
    {
      "id": "conn_003",
      "connector_name": "airflow",
      "display_name": "Airflow Production",
      "enabled": true,
      "priority": 3,
      
      "connection": {
        "base_url": "https://airflow-prod.example.com",
        "api_version": "v1"
      },
      
      "authentication": {
        "method": "api_key",
        "credential_key": "airflow-api-key"
      },
      
      "scan_config": {
        "targets": {
          "dags": ["*"],
          "include_dag_code": true
        },
        "options": {
          "extract_dependencies": true,
          "analyze_complexity": true
        }
      }
    }
  ]
}
```

## Key Design Decisions

### 1. Explicit `connector_name` Field

**Why:** The orchestrator needs to know exactly which scanner to call.

- `connector_name: "postgresql"` → calls `postgresql_scanner`
- `connector_name: "adls_gen2"` → calls `adls_scanner`
- No ambiguity about which scanner to use

**UI Impact:** Dropdown showing available connector types

### 2. Separated Structure

- **`metadata`** - Project-level information (who, what, when)
- **`scan_settings`** - Global scan settings (timeout, retries, parallel execution)
- **`connectors[]`** - Per-connector configuration

**Benefit:** Clear separation of concerns, easier to validate

### 3. Connector-Specific `connection` Object

Each connector type has its own connection schema:

- **Database connectors:** `host`, `port`, `database`
- **Storage connectors:** `storage_account`, `container`, `path_prefix`
- **API connectors:** `base_url`, `api_version`

**UI Impact:** Dynamic form fields based on selected connector type

### 4. Unified `scan_config` Pattern

All connectors follow the same pattern:
- **`targets`** - What to scan (connector-specific)
- **`options`** - How to scan (connector-specific)

**Benefit:** Consistent structure, easier to process

### 5. Simple Authentication Model

```json
"authentication": {
  "method": "credential_store" | "managed_identity" | "api_key" | "oauth",
  "credential_key": "reference-to-secure-store"
}
```

**Why:** 
- No passwords in JSON (security)
- References secure credential store
- Supports multiple auth methods

## Connector Type Definitions

### Database Connectors

**Supported Types:**
- `postgresql`
- `mysql`
- `oracle`
- `sql_server`
- `snowflake`
- `databricks`

**Connection Schema:**
```json
{
  "host": "string (required)",
  "port": "number (optional, connector-specific default)",
  "database": "string (required for most)",
  "ssl_mode": "string (optional)"
}
```

**Scan Targets:**
```json
{
  "schemas": ["array of schema names"],
  "databases": ["array of database names"] // for multi-db connectors
}
```

**Scan Options:**
```json
{
  "include_tables": "boolean",
  "include_views": "boolean",
  "include_functions": "boolean",
  "include_stored_procedures": "boolean",
  "include_triggers": "boolean",
  "include_indexes": "boolean",
  "include_constraints": "boolean",
  "include_row_counts": "boolean",
  "analyze_complexity": "boolean",
  "extract_ddl": "boolean"
}
```

### Storage Connectors

**Supported Types:**
- `adls_gen2` (Azure Data Lake Storage Gen2)
- `s3` (AWS S3)
- `gcs` (Google Cloud Storage)
- `nfs` (Network File System)

**Connection Schema:**
```json
{
  "storage_account": "string (for ADLS)",
  "container": "string (for ADLS/S3/GCS)",
  "bucket": "string (for S3)",
  "path_prefix": "string (optional)"
}
```

**Scan Targets:**
```json
{
  "paths": ["array of paths to scan"],
  "recursive": "boolean",
  "max_depth": "number"
}
```

**Scan Options:**
```json
{
  "file_types": ["array of extensions", ".parquet", ".csv"],
  "exclude_patterns": ["array of glob patterns"],
  "extract_schema": "boolean",
  "calculate_statistics": "boolean",
  "sample_rows": "number"
}
```

### ETL/Orchestration Connectors

**Supported Types:**
- `airflow`
- `prefect`
- `dagster`
- `luigi`

**Connection Schema:**
```json
{
  "base_url": "string (required)",
  "api_version": "string (optional)"
}
```

**Scan Targets:**
```json
{
  "dags": ["array of DAG names or ['*'] for all"],
  "include_dag_code": "boolean"
}
```

**Scan Options:**
```json
{
  "extract_dependencies": "boolean",
  "analyze_complexity": "boolean",
  "include_execution_history": "boolean"
}
```

## Orchestrator Routing Logic

```python
def route_to_scanner(connector):
    """Route connector to appropriate scanner"""
    connector_name = connector["connector_name"]
    
    # Direct mapping: connector_name -> scanner module
    scanner_mapping = {
        "postgresql": "postgresql_scanner",
        "mysql": "mysql_scanner",
        "oracle": "oracle_scanner",
        "sql_server": "sql_server_scanner",
        "adls_gen2": "adls_scanner",
        "s3": "s3_scanner",
        "gcs": "gcs_scanner",
        "airflow": "airflow_scanner",
        "databricks": "databricks_scanner",
        "snowflake": "snowflake_scanner"
    }
    
    scanner_module_name = scanner_mapping.get(connector_name)
    if not scanner_module_name:
        raise Exception(f"Unknown connector: {connector_name}")
    
    # Import and call scanner
    scanner_module = importlib.import_module(f"scanners.{scanner_module_name}")
    return scanner_module.scan(connector)
```

## UI Form Structure Proposal

### Step 1: Project Information (Keep Existing)
- Project Name
- Requestor Name, Email, Department
- Priority

### Step 2: Global Scan Settings (New Section)
```
┌─────────────────────────────────────┐
│ Global Scan Settings                │
├─────────────────────────────────────┤
│ Timeout (seconds): [3600]          │
│ Max Retries: [2]                    │
│ Parallel Execution: [✓] Yes [ ] No │
└─────────────────────────────────────┘
```

### Step 3: Add Connectors (Enhanced)
```
┌─────────────────────────────────────────────────────────┐
│ Add Data Source Connector                               │
├─────────────────────────────────────────────────────────┤
│ Connector Type *: [Dropdown]                            │
│   - PostgreSQL                                          │
│   - MySQL                                               │
│   - Oracle                                              │
│   - SQL Server                                          │
│   - ADLS Gen2                                           │
│   - S3                                                  │
│   - GCS                                                 │
│   - Airflow                                             │
│   - Databricks                                          │
│   - Snowflake                                           │
│                                                         │
│ Display Name *: [PostgreSQL Production]                │
│                                                         │
│ ┌─ Connection Details ─────────────────────────────┐  │
│ │ (Fields change based on connector type)           │  │
│ │ Host: [db.example.com]                           │  │
│ │ Port: [5432]                                      │  │
│ │ Database: [production_db]                        │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Authentication ─────────────────────────────────┐  │
│ │ Method: [Credential Store ▼]                     │  │
│ │ Credential Key: [postgres-prod-creds]            │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Scan Targets ───────────────────────────────────┐  │
│ │ (Fields change based on connector type)           │  │
│ │ Schemas: [public] [sales] [inventory]            │  │
│ │ [+ Add Schema]                                    │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Scan Options ───────────────────────────────────┐  │
│ │ [✓] Include Tables                                │  │
│ │ [✓] Include Views                                  │  │
│ │ [✓] Include Functions                             │  │
│ │ [✓] Include Row Counts                            │  │
│ │ [✓] Analyze Complexity                            │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ [Add Connector]                                        │
└─────────────────────────────────────────────────────────┘
```

## TypeScript Schema Definition (For Future Implementation)

```typescript
interface ScanRequest {
  metadata: {
    project_id: string;
    project_name: string;
    timestamp: string;
    requestor: {
      name: string;
      email: string;
      department: string;
    };
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  
  scan_settings: {
    timeout_seconds?: number;
    max_retries?: number;
    parallel_execution?: boolean;
  };
  
  connectors: Connector[];
}

interface Connector {
  id: string;
  connector_name: string;
  display_name: string;
  enabled: boolean;
  priority?: number;
  connection: ConnectionConfig;
  authentication: AuthenticationConfig;
  scan_config: ScanConfig;
}

interface ConnectionConfig {
  // Database connectors
  host?: string;
  port?: number;
  database?: string;
  ssl_mode?: string;
  
  // Storage connectors
  storage_account?: string;
  container?: string;
  bucket?: string;
  path_prefix?: string;
  
  // API connectors
  base_url?: string;
  api_version?: string;
}

interface AuthenticationConfig {
  method: 'credential_store' | 'managed_identity' | 'api_key' | 'oauth';
  credential_key?: string;
}

interface ScanConfig {
  targets: {
    schemas?: string[];
    databases?: string[];
    paths?: string[];
    dags?: string[];
    recursive?: boolean;
    max_depth?: number;
  };
  options: {
    // Database options
    include_tables?: boolean;
    include_views?: boolean;
    include_functions?: boolean;
    include_stored_procedures?: boolean;
    include_row_counts?: boolean;
    analyze_complexity?: boolean;
    
    // Storage options
    file_types?: string[];
    exclude_patterns?: string[];
    extract_schema?: boolean;
    calculate_statistics?: boolean;
    
    // ETL options
    include_dag_code?: boolean;
    extract_dependencies?: boolean;
  };
}
```

## Benefits of This Structure

1. **Clear Orchestrator Execution**
   - `connector_name` directly maps to scanner module
   - No ambiguity about which scanner to call
   - Easy to add new connectors

2. **Type-Safe & Validatable**
   - Each connector type has defined schema
   - Can validate before submission
   - Clear error messages

3. **UI-Friendly**
   - Dynamic forms based on connector type
   - Clear field requirements
   - Good user experience

4. **Scalable**
   - Add new connectors by extending schema
   - No breaking changes to existing structure
   - Backward compatible approach

5. **Secure**
   - No credentials in JSON
   - References to secure credential store
   - Supports multiple auth methods

6. **Flexible**
   - Connector-specific options
   - Global and per-connector settings
   - Priority and dependency support

## Current vs Proposed Comparison

### Current Structure Issues:
- ❌ Generic `type: "database"` - doesn't specify which database
- ❌ String-based `additional_config` - not type-safe
- ❌ Limited authentication options
- ❌ No scan parameters/options
- ❌ Mixed concerns (project metadata + scan config)

### Proposed Structure Benefits:
- ✅ Explicit `connector_name: "postgresql"` - clear routing
- ✅ Structured, type-safe configuration
- ✅ Flexible authentication model
- ✅ Rich scan options per connector
- ✅ Clear separation of concerns

## Migration Strategy

1. **Phase 1:** Define new structure (this document)
2. **Phase 2:** Update TypeScript types
3. **Phase 3:** Update UI to collect new fields
4. **Phase 4:** Update `transformToScanRequest()` function
5. **Phase 5:** Update orchestrator to read new format
6. **Phase 6:** Add backward compatibility layer (temporary)

## Next Steps

1. Review and approve this structure
2. Create TypeScript interfaces
3. Design UI components for connector configuration
4. Implement transformation logic
5. Update orchestrator routing
6. Test end-to-end flow

## Notes

- This structure is designed to be forward-compatible
- New connector types can be added without breaking existing ones
- Authentication methods can be extended
- Scan options are connector-specific but follow consistent patterns
- Priority and dependencies support future orchestration features

