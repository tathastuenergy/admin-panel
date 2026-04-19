// "use client";
// const consoleError = console.error;
// console.error = (...args) => {
//   if (
//     typeof args[0] === "string" &&
//     (args[0].includes("AG Grid Enterprise License") ||
//       args[0].includes("License Key Not Found") ||
//       args[0].includes("unlocked for trial"))
//   ) {
//     return;
//   }
//   consoleError(...args);
// };

// import React, { useMemo, useRef, memo, useCallback, useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// import { AgGridReact } from "ag-grid-react";
// import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions } from "ag-grid-community";
// import { MdDelete, MdModeEdit } from "react-icons/md";
// import { ColumnMenuModule, ContextMenuModule } from "ag-grid-enterprise";

// ModuleRegistry.registerModules([AllCommunityModule, ColumnMenuModule, ContextMenuModule]);

// interface AgGridTableProps {
//   tableName?: string;
//   buttonName?: string;
//   addButtonLink?: string;
//   rowData: any[];
//   onDelete?: (id: number) => void;
//   onEdit?: (id: number) => void;
//   columns?: ColDef[];
//   filter?: boolean;
// }

// const AgGridTable: React.FC<AgGridTableProps> = ({
//   tableName = "Table",
//   buttonName = "",
//   addButtonLink = "",
//   rowData,
//   onDelete,
//   onEdit,
//   columns,
// }) => {
//   // const router = useRouter();
//   const gridRef = useRef<any>(null);
//   const [isDark, setIsDark] = useState(false);

//   useEffect(() => {
//     const checkDarkMode = () => {
//       setIsDark(document.documentElement.classList.contains('dark'));
//     };

//     checkDarkMode();

//     const observer = new MutationObserver(checkDarkMode);
//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ['class'],
//     });

//     return () => observer.disconnect();
//   }, []);

//   // IMPORTANT: No flex property for Quotes table
//   const defaultColDef = useMemo(
//     () => ({
//       sortable: true,
//       resizable: true,
//       cellStyle: { display: 'flex', alignItems: 'center', paddingLeft: '16px' },
//       headerClass: "ag-left-aligned-header",
//       cellClass: "ag-cell-with-border",
//       // REMOVED flex: 1 - This was causing the issue
//     }),
//     []
//   );

//   const defaultColumns: ColDef[] = useMemo(
//     () => [
//       {
//         field: "planName",
//         headerName: "Plan Name",
//         checkboxSelection: true,
//         headerCheckboxSelection: true,
//         width: 200,
//       },
//       { field: "price", headerName: "Price", width: 100 },
//       { field: "duration", headerName: "Duration", width: 120 },
//       { field: "day", headerName: "Day", width: 80 },
//       { field: "month", headerName: "Month", width: 100 },
//       { field: "rocket", headerName: "Rocket", width: 200 },
//       {
//         headerName: "Action",
//         width: 140,
//         suppressSizeToFit: true,
//         cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
//         cellRenderer: (params: any) => {
//           const id = params.data.id;
//           return (
//             <div className="flex items-center justify-center gap-3">
//               <button
//                 // onClick={() => onEdit ? onEdit(id) : router.push(`/plan/edit/${id}`)}
//                 className="text-lg text-slate-500 hover:text-brand-600 transition"
//                 aria-label="Edit"
//               >
//                 <MdModeEdit />
//               </button>
//               <button
//                 onClick={() => onDelete ? onDelete(id) : alert(`Delete clicked for ID: ${id}`)}
//                 className="text-lg text-slate-400 hover:text-red-500 transition"
//                 aria-label="Delete"
//               >
//                 <MdDelete />
//               </button>
//             </div>
//           );
//         },
//       },
//     ],
//     [onEdit, onDelete]
//     // [onEdit, onDelete, router]
//   );

//   const rowSelection = useMemo<RowSelectionOptions>(
//     () => ({ mode: "multiRow" }),
//     []
//   );

//   // const onGridReady = useCallback((params: any) => {
//   //   // DON'T call sizeColumnsToFit for any table - let columns keep their defined widths
//   //   // This ensures horizontal scroll works when total width > container width
//   //   console.log("Grid ready - horizontal scroll enabled");
//   // }, []);

//   const handleAddClick = useCallback(() => {
//     // router.push(addButtonLink);
//   }, [addButtonLink]);
//   // }, [router, addButtonLink]);

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4 dark:text-gray-200">
//         {/* <h2 className="text-xl font-bold">{tableName}</h2> */}
//         {buttonName && (
//           <button onClick={handleAddClick} className="btn-primary" aria-label={`Add ${buttonName}`}>
//             + Add {buttonName}
//           </button>
//         )}
//       </div>

//           <div className={`${isDark ? 'ag-theme-alpine-dark cute-ag-grid' : 'ag-theme-alpine'}`}
//         style={{ width: "100%", height: "80vh" }}>
//         <AgGridReact
//           rowHeight={tableName === "Quotes" ? 60 : 35}
//           ref={gridRef}
//           rowData={rowData}
//           columnDefs={columns || defaultColumns}
//           defaultColDef={defaultColDef}
//           pagination
//           paginationPageSize={20}
//           rowSelection={rowSelection}
//           // onGridReady={onGridReady}
//           paginationPageSizeSelector={[10, 20, 50, 100]}
//           columnMenu="new"
//           suppressRowClickSelection
//           animateRows
//           // suppressHorizontalScroll={false} - REMOVED completely (default is false)
//           alwaysShowHorizontalScroll={true} // ADD THIS to always show horizontal scroll
//         // columnBorders={true} 
//         />
//       </div>
//     </div>
//   );
// };

// export default memo(AgGridTable);

"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { cn } from "../../utils/helper";
import { Search } from "lucide-react";

// Register all community modules once
if (typeof window !== "undefined") {
  ModuleRegistry.registerModules([AllCommunityModule]);
}

interface DataTableProps<TData> {
  rowData: TData[];
  columnDefs: ColDef<TData>[];
  className?: string;
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[];
  height?: string | number;
  rowSelection?: "single" | "multiple";
  title?: string;
  showSearch?: boolean;
  addButton?: React.ReactNode;
  onGridReady?: (params: any) => void;
}

export function AgGridTable<TData>({
  rowData,
  columnDefs,
  className,
  pagination = true,
  paginationPageSize = 10,
  paginationPageSizeSelector = [10, 20, 50, 100],
  height = "600px",
  rowSelection = "multiple",
  title,
  showSearch = true,
  addButton,
  onGridReady
}: DataTableProps<TData>) {
  const [quickFilterText, setQuickFilterText] = useState("");

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      headerClass: "font-semibold text-gray-700",
    }),
    []
  );


  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {(title || showSearch || addButton) && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
          {title && (
            <h2 className="text-xl font-bold dark:text-gray-400">{title}</h2>
          )}
          
          <div className="flex items-center gap-3 flex-1 justify-end">
            {showSearch && (
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  onChange={(e) => setQuickFilterText(e.target.value)}
                />
              </div>
            )}
            {addButton}
          </div>
        </div>
      )}

      <div 
        className="ag-theme-quartz w-full shadow-sm rounded-xl overflow-hidden"
        style={{ height }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection === "multiple" ? { mode: 'multiRow' } : { mode: 'singleRow' }}
          animateRows={true}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          quickFilterText={quickFilterText}
          enableCellTextSelection={true}
          suppressCellFocus={true}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
}
