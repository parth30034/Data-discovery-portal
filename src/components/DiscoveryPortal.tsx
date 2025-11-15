import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Database, ArrowRight, ArrowLeft, Check, LogOut } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { EnvironmentStep } from './steps/EnvironmentStep';
import { LocationScopeStep } from './steps/LocationScopeStep';
import { ConnectionTargetsStep } from './steps/ConnectionTargetsStep';
import { ReviewStep } from './steps/ReviewStep';
import { DiscoveryReport } from './DiscoveryReport';
import type { DiscoveryFormData } from './types';

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Project and requestor details' },
  { id: 2, title: 'Environment Details', description: 'Infrastructure and environment' },
  { id: 3, title: 'Location & Scope', description: 'Data sources and inventory scope' },
  { id: 4, title: 'Connection Targets', description: 'Database and ETL server connections' },
  { id: 5, title: 'Review & Submit', description: 'Confirm your information' },
];

interface DiscoveryPortalProps {
  currentUser: string;
  onLogout: () => void;
}

export function DiscoveryPortal({ currentUser, onLogout }: DiscoveryPortalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<DiscoveryFormData>({
    // Basic Info
    projectName: '',
    requestorName: '',
    requestorEmail: '',
    department: '',
    priority: 'medium',
    
    // Environment Details
    environments: [],
    cloudProvider: '',
    infrastructureType: '',
    databases: [],
    dataWarehouse: '',
    orchestrationTool: '',
    
    // Location & Scope
    regions: [],
    dataSources: [],
    inventoryScope: [],
    
    // Connection Targets
    connectionTargets: [],
    
    // Additional
    additionalNotes: '',
  });

  const updateFormData = (data: Partial<DiscoveryFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Simulate discovery scan and generate inventory summary
    const inventorySummary = generateMockInventory(formData);
    const updatedFormData = { ...formData, inventorySummary };
    setFormData(updatedFormData);
    console.log('Form submitted:', updatedFormData);
    setIsSubmitted(true);
  };

  const generateMockInventory = (data: DiscoveryFormData) => {
    // Generate comprehensive real-world inventory based on connection targets
    const discoveredObjects: any[] = [];
    
    const realWorldTables = [
      { name: 'customer_master', rows: 2547891, size: 1247 },
      { name: 'customer_addresses', rows: 3129847, size: 892 },
      { name: 'order_header', rows: 15789234, size: 4523 },
      { name: 'order_line_items', rows: 47893421, size: 8934 },
      { name: 'product_catalog', rows: 125789, size: 234 },
      { name: 'product_inventory', rows: 892347, size: 567 },
      { name: 'transaction_log', rows: 98234567, size: 15678 },
      { name: 'payment_details', rows: 23456789, size: 5432 },
      { name: 'invoice_master', rows: 12345678, size: 3456 },
      { name: 'shipment_tracking', rows: 8765432, size: 2345 },
      { name: 'employee_master', rows: 45678, size: 89 },
      { name: 'department_hierarchy', rows: 1234, size: 12 },
      { name: 'supplier_master', rows: 34567, size: 156 },
      { name: 'purchase_orders', rows: 5678901, size: 2234 },
      { name: 'warehouse_locations', rows: 567, size: 45 },
      { name: 'sales_transactions', rows: 34567890, size: 8901 },
      { name: 'customer_reviews', rows: 4567890, size: 1234 },
      { name: 'product_categories', rows: 2345, size: 34 },
      { name: 'promotion_campaigns', rows: 12345, size: 89 },
      { name: 'vendor_contracts', rows: 5678, size: 123 },
      { name: 'shipping_carriers', rows: 234, size: 23 },
      { name: 'tax_configuration', rows: 1234, size: 56 },
      { name: 'currency_exchange_rates', rows: 45678, size: 234 },
      { name: 'user_activity_log', rows: 234567890, size: 23456 },
      { name: 'session_tracking', rows: 123456789, size: 12345 }
    ];

    const realWorldPythonFiles = [
      { name: 'extract_customer_data.py', size: 45, deps: 3 },
      { name: 'extract_orders_incremental.py', size: 52, deps: 4 },
      { name: 'transform_sales_data.py', size: 67, deps: 5 },
      { name: 'transform_customer_360.py', size: 89, deps: 7 },
      { name: 'load_to_warehouse.py', size: 34, deps: 2 },
      { name: 'data_quality_validator.py', size: 78, deps: 4 },
      { name: 'schema_drift_detector.py', size: 56, deps: 3 },
      { name: 'etl_orchestrator.py', size: 123, deps: 8 },
      { name: 'config_manager.py', size: 23, deps: 1 },
      { name: 'db_connection_pool.py', size: 34, deps: 2 },
      { name: 'logging_utils.py', size: 28, deps: 1 },
      { name: 'error_handler.py', size: 45, deps: 2 },
      { name: 'data_profiler.py', size: 67, deps: 5 },
      { name: 'metadata_extractor.py', size: 54, deps: 4 },
      { name: 'notification_service.py', size: 38, deps: 3 }
    ];

    const realWorldPySparkFiles = [
      { name: 'spark_job_customer_aggregation.py', size: 156, deps: 6 },
      { name: 'spark_job_sales_analytics.py', size: 189, deps: 8 },
      { name: 'spark_etl_fact_sales.py', size: 234, deps: 9 },
      { name: 'spark_etl_fact_orders.py', size: 212, deps: 8 },
      { name: 'spark_dim_customer_scd2.py', size: 178, deps: 7 },
      { name: 'spark_dim_product_load.py', size: 145, deps: 6 },
      { name: 'spark_incremental_load.py', size: 167, deps: 7 },
      { name: 'spark_full_refresh_job.py', size: 134, deps: 5 },
      { name: 'spark_data_deduplication.py', size: 123, deps: 5 },
      { name: 'spark_aggregation_engine.py', size: 198, deps: 8 },
      { name: 'spark_utils_common.py', size: 89, deps: 3 },
      { name: 'spark_schema_validator.py', size: 67, deps: 4 },
      { name: 'spark_partitioning_optimizer.py', size: 112, deps: 5 }
    ];

    const realWorldViews = [
      'vw_customer_360_summary', 'vw_sales_monthly_aggregates', 'vw_inventory_current_status',
      'vw_order_fulfillment_metrics', 'vw_top_selling_products', 'vw_customer_lifetime_value',
      'vw_supplier_performance', 'vw_revenue_by_category', 'vw_shipment_delays',
      'vw_payment_reconciliation', 'vw_active_promotions', 'vw_employee_sales_performance'
    ];

    const realWorldStoredProcs = [
      'sp_daily_sales_aggregation', 'sp_customer_data_cleanup', 'sp_generate_monthly_reports',
      'sp_update_inventory_levels', 'sp_process_returns', 'sp_calculate_commissions',
      'sp_archive_old_transactions', 'sp_sync_product_catalog', 'sp_reconcile_payments',
      'sp_update_customer_segments'
    ];

    const realWorldSQLFiles = [
      { name: 'schema_creation.sql', size: 234 },
      { name: 'migration_v1_to_v2.sql', size: 167 },
      { name: 'migration_v2_to_v3.sql', size: 189 },
      { name: 'indexes_creation.sql', size: 145 },
      { name: 'complex_analytical_queries.sql', size: 312 },
      { name: 'data_cleanup_scripts.sql', size: 89 },
      { name: 'performance_tuning_queries.sql', size: 134 },
      { name: 'rollback_procedures.sql', size: 78 }
    ];

    const realWorldConfigs = [
      { name: 'airflow_dags_config.yaml', size: 23 },
      { name: 'database_connections.yaml', size: 12 },
      { name: 'spark_cluster_config.yaml', size: 34 },
      { name: 'requirements.txt', size: 8 },
      { name: 'Dockerfile', size: 15 },
      { name: 'docker-compose.yml', size: 28 },
      { name: '.env.template', size: 5 },
      { name: 'logging_config.json', size: 9 }
    ];

    const realWorldWarehouseTables = [
      { name: 'fact_sales_daily', rows: 45678901, size: 12345, type: 'Fact Table' },
      { name: 'fact_orders', rows: 34567890, size: 9876, type: 'Fact Table' },
      { name: 'fact_inventory_snapshots', rows: 23456789, size: 7890, type: 'Fact Table' },
      { name: 'fact_customer_interactions', rows: 56789012, size: 15678, type: 'Fact Table' },
      { name: 'fact_financial_transactions', rows: 78901234, size: 23456, type: 'Fact Table' },
      { name: 'dim_customer', rows: 2547891, size: 1567, type: 'Dimension Table' },
      { name: 'dim_product', rows: 125789, size: 456, type: 'Dimension Table' },
      { name: 'dim_date', rows: 3650, size: 89, type: 'Dimension Table' },
      { name: 'dim_location', rows: 12345, size: 234, type: 'Dimension Table' },
      { name: 'dim_employee', rows: 45678, size: 345, type: 'Dimension Table' },
      { name: 'dim_supplier', rows: 34567, size: 289, type: 'Dimension Table' },
      { name: 'dim_promotion', rows: 23456, size: 178, type: 'Dimension Table' }
    ];

    data.connectionTargets.forEach((target) => {
      target.paths.forEach((path) => {
        if (target.type === 'database') {
          // Generate real-world tables
          realWorldTables.forEach((table) => {
            discoveredObjects.push({
              name: table.name,
              type: 'Table',
              path: `${target.name}/${path}`,
              size: `${table.size} MB`,
              rowCount: table.rows,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });
          
          // Add views
          realWorldViews.forEach((viewName) => {
            discoveredObjects.push({
              name: viewName,
              type: 'View',
              path: `${target.name}/${path}`,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });

          // Add stored procedures
          realWorldStoredProcs.forEach((spName) => {
            discoveredObjects.push({
              name: spName,
              type: 'Stored Procedure',
              path: `${target.name}/${path}`,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });

          // Add indexes
          ['idx_customer_email', 'idx_order_date', 'idx_product_sku', 'idx_transaction_timestamp'].forEach((idxName) => {
            discoveredObjects.push({
              name: idxName,
              type: 'Index',
              path: `${target.name}/${path}`,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });
        } else if (target.type === 'etl-server') {
          // Generate Python files
          realWorldPythonFiles.forEach((file) => {
            discoveredObjects.push({
              name: file.name,
              type: 'Python Script',
              path: `${target.name}${path}`,
              size: `${file.size} KB`,
              dependencies: file.deps,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });

          // Generate PySpark files
          realWorldPySparkFiles.forEach((file) => {
            discoveredObjects.push({
              name: file.name,
              type: 'PySpark Script',
              path: `${target.name}${path}`,
              size: `${file.size} KB`,
              dependencies: file.deps,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });

          // Add SQL files
          realWorldSQLFiles.forEach((file) => {
            discoveredObjects.push({
              name: file.name,
              type: 'SQL Script',
              path: `${target.name}${path}`,
              size: `${file.size} KB`,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });

          // Add config files
          realWorldConfigs.forEach((file) => {
            discoveredObjects.push({
              name: file.name,
              type: 'Configuration File',
              path: `${target.name}${path}`,
              size: `${file.size} KB`,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });

          // Add DAG files
          ['dag_daily_etl.py', 'dag_weekly_aggregation.py', 'dag_customer_sync.py'].forEach((dagName) => {
            discoveredObjects.push({
              name: dagName,
              type: 'Airflow DAG',
              path: `${target.name}${path}/dags`,
              size: `${Math.floor(Math.random() * 50) + 20} KB`,
              dependencies: Math.floor(Math.random() * 6) + 3,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });
        } else if (target.type === 'data-warehouse') {
          // Generate warehouse tables
          realWorldWarehouseTables.forEach((table) => {
            discoveredObjects.push({
              name: table.name,
              type: table.type,
              path: `${target.name}/${path}`,
              size: `${table.size} MB`,
              rowCount: table.rows,
              lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });

          // Add materialized views
          ['mv_sales_summary', 'mv_customer_metrics', 'mv_inventory_status'].forEach((mvName) => {
            discoveredObjects.push({
              name: mvName,
              type: 'Materialized View',
              path: `${target.name}/${path}`,
              size: `${Math.floor(Math.random() * 500) + 100} MB`,
              lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });
        }
      });
    });

    // Calculate summary statistics
    const byType: { [key: string]: number } = {};
    const byPath: { [key: string]: number } = {};

    discoveredObjects.forEach((obj) => {
      byType[obj.type] = (byType[obj.type] || 0) + 1;
      byPath[obj.path] = (byPath[obj.path] || 0) + 1;
    });

    return {
      totalObjects: discoveredObjects.length,
      byType,
      byPath,
      discoveredObjects,
    };
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setFormData({
      projectName: '',
      requestorName: '',
      requestorEmail: '',
      department: '',
      priority: 'medium',
      environments: [],
      cloudProvider: '',
      infrastructureType: '',
      databases: [],
      dataWarehouse: '',
      orchestrationTool: '',
      regions: [],
      dataSources: [],
      inventoryScope: [],
      connectionTargets: [],
      additionalNotes: '',
    });
  };

  if (isSubmitted) {
    return <DiscoveryReport onReset={handleReset} formData={formData} />;
  }

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="mb-1">Data Engineering Discovery Portal</h1>
              <p className="text-gray-600">
                Help us understand your data infrastructure needs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p>{currentUser}</p>
            </div>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <div className={`text-sm ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <BasicInfoStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <EnvironmentStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <LocationScopeStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <ConnectionTargetsStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <ReviewStep formData={formData} />
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Submit Discovery Request
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
