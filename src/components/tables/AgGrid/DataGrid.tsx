import { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  SelectionChangedEvent,
  CellValueChangedEvent,
  GridApi,
  GetRowIdParams,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Download, Trash2, Plus } from "lucide-react";
import Button from "../../ui/button/Button";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface DataGridProps<T> {
  /** Row data to display */
  data: T[];
  /** Column definitions */
  columns: ColDef<T>[];
  /** Title displayed in the toolbar */
  title?: string;
  /** Enable row selection with checkboxes */
  enableSelection?: boolean;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Page size options */
  paginationPageSizeOptions?: number[];
  /** Default page size */
  defaultPageSize?: number;
  /** Enable CSV export */
  enableExport?: boolean;
  /** Export file name (without extension) */
  exportFileName?: string;
  /** Enable delete button for selected rows */
  enableDelete?: boolean;
  /** Callback when rows are deleted */
  onDelete?: (selectedRows: T[]) => void;
  /** Callback when cell value changes */
  onCellValueChanged?: (data: T) => void;
  /** Callback when selection changes */
  onSelectionChanged?: (selectedRows: T[]) => void;
  /** Enable add button */
  enableAdd?: boolean;
  /** Callback when add button is clicked */
  onAdd?: () => void;
  /** Add button text */
  addButtonText?: string;
  /** Custom height for the grid */
  height?: string;
  /** Enable floating filters */
  enableFloatingFilter?: boolean;
  /** Custom toolbar actions */
  toolbarActions?: React.ReactNode;
  /** Get row id for selection tracking */
  getRowId?: (data: T) => string;
  /** Context object passed to cell renderers */
  context?: any;
}

function DataGrid<T>({
  data,
  columns,
  title,
  enableSelection = true,
  enablePagination = true,
  paginationPageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  enableExport = true,
  exportFileName = "export",
  enableDelete = true,
  onDelete,
  onCellValueChanged,
  onSelectionChanged,
  enableAdd = false,
  onAdd,
  addButtonText = "Add New",
  height = "400px",
  enableFloatingFilter = true,
  toolbarActions,
  getRowId,
  context,
}: DataGridProps<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // Build column definitions with optional checkbox selection
  const columnDefs = useMemo<ColDef<T>[]>(() => {
    if (!enableSelection) return columns;

    const checkboxColumn: ColDef<T> = {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
      pinned: "left",
      suppressMovable: true,
      lockPosition: true,
    };

    return [checkboxColumn, ...columns];
  }, [columns, enableSelection]);

  // Default column settings
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      floatingFilter: enableFloatingFilter,
      filter: true,
    }),
    [enableFloatingFilter],
  );

  // Grid ready handler
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  // Selection change handler
  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const selected = event.api.getSelectedRows();
      setSelectedRows(selected);
      onSelectionChanged?.(selected);
    },
    [onSelectionChanged],
  );

  // Cell value changed handler
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<T>) => {
      if (event.data) {
        onCellValueChanged?.(event.data);
      }
    },
    [onCellValueChanged],
  );

  // Export to CSV
  const handleExport = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `${exportFileName}.csv`,
      });
    }
  }, [gridApi, exportFileName]);

  // Delete selected rows
  const handleDelete = useCallback(() => {
    if (selectedRows.length > 0 && onDelete) {
      onDelete(selectedRows);
      setSelectedRows([]);
    }
  }, [selectedRows, onDelete]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {title && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          {enableSelection && selectedRows.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({selectedRows.length} selected)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {toolbarActions}
          {enableAdd && onAdd && (
            <Button variant="default" size="sm" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {addButtonText}
            </Button>
          )}
          {enableDelete && selectedRows.length > 0 && onDelete && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedRows.length})
            </Button>
          )}
          {enableExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div
        className="ag-theme-quartz w-full rounded-lg border border-border overflow-hidden"
        style={{ height }}
      >
        <AgGridReact<T>
          ref={gridRef}
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={enableSelection ? "multiple" : undefined}
          suppressRowClickSelection={true}
          pagination={enablePagination}
          paginationPageSize={defaultPageSize}
          paginationPageSizeSelector={paginationPageSizeOptions}
          onGridReady={handleGridReady}
          onSelectionChanged={handleSelectionChanged}
          onCellValueChanged={handleCellValueChanged}
          animateRows={true}
          enableCellTextSelection={true}
          context={context}
          getRowId={
            getRowId
              ? (params: GetRowIdParams<T>) => getRowId(params.data!)
              : undefined
          }
        />
      </div>
    </div>
  );
}

export default DataGrid;