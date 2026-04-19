// // @ts-nocheck

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Eye, Download, Edit, Trash2, Loader2, FileText } from "lucide-react";
// import { toast } from "react-toastify";
// import { api } from "../../utils/axiosInstance";
// import endPointApi from "../../utils/endPointApi";
// import EstimateDownload from "./EstimateDownload";
// import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
// import Loader from "../../components/common/Loader";

// const Estimate = () => {
//   const navigate = useNavigate();
//   const [estimates, setEstimates] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [downloadId, setDownloadId] = useState<string | null>(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleteId, setDeleteId] = useState<number | null>(null);
//   const [viewLoading, setViewLoading] = useState(null);

//   // 🔹 Get all estimate
//   const getEstimates = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get(`${endPointApi.getAllEstimate}`);

//       if (res.data) {
//         setEstimates(res.data.data || []);
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getEstimates();
//   }, []);

//   // 🔹 View estimate
//   // const handleView = (id) => {
//   //   navigate(`/estimate/view/${id}`);
//   // };
//   const handleView = async (id) => {
//     try {
//       setViewLoading(id); // Start loading for this specific button
//       const res = await api.get(`${endPointApi.getByIdEstimate}/${id}`);

//       if (res.data?.success) {
//         // Navigate only after data is confirmed
//         navigate(`/estimate/view/${id}`);
//       }
//     } catch {
//       toast.error("Failed to fetch estimate details");
//     } finally {
//       setViewLoading(null);
//     }
//   };

//   const handleDownload = (id) => {
//     setDownloadId(id);
//     // navigate(`/estimate/download/${id}`);
//   };

//   // 🔹 Edit estimate
//   const handleEdit = (id) => {
//     navigate(`/estimate/edit/${id}`);
//   };

//   // 🔹 Delete estimate
//   const handleDelete = async (id: number | null) => {
//     if (!id) return;

//     try {
//       const res = await api.delete(`${endPointApi.deleteEstimate}/${id}`);

//       if (res.data) {
//         toast.success(res.data.message || "Estimate deleted successfully");
//         getEstimates(); // refresh list
//         setShowDeleteModal(false);
//         setDeleteId(null);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error deleting estimate");
//     }
//   };

//   const handleConvertToInvoice = (estimateNumber) => {
//     // so the Add Invoice page can pre-fill itself
//     navigate("/invoice/add", {
//       state: {
//         fromEstimate: true,
//         estimateNumber: estimateNumber,
//       },
//     });
//   };

//   return (
//     <div className="p-4">
//       {loading && <Loader src="/loader.mp4" fullScreen />}

//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Estimate List</h2>
//         <button
//           onClick={() => navigate("/estimate/add")}
//           className="primary-color text-white px-4 py-2 rounded hover:primary-color"
//         >
//           + Add Estimate
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">Sr.</th>
//               <th className="border p-2">Customer Name</th>
//               <th className="border p-2">Estimate Number</th>
//               <th className="border p-2">Date</th>
//               <th className="border p-2">State</th>
//               <th className="border p-2">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="6" className="text-center p-4">
//                   Loading...
//                 </td>
//               </tr>
//             ) : estimates.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="text-center p-4">
//                   No estimate found
//                 </td>
//               </tr>
//             ) : (
//               estimates.map((item, index) => (
//                 <tr key={item.id} className="hover:bg-gray-50">
//                   <td className="border p-2 text-center">{index + 1}</td>
//                   <td className="border p-2">{item.customerId?.name}</td>
//                   <td className="border p-2">{item.estimateNumber}</td>
//                   <td className="border p-2">
//                     {" "}
//                     {new Date(item.date).toLocaleDateString("en-GB")}
//                   </td>
//                   <td className="border p-2">
//                     <span
//                       className={`px-2 py-1 rounded text-xs font-semibold ${
//                         item.state === "Approved"
//                           ? "bg-green-100 text-green-800"
//                           : item.state === "Rejected"
//                             ? "bg-red-100 text-red-800"
//                             : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {item.state}
//                     </span>
//                   </td>

//                   {/* Actions */}
//                   <td className="border p-2">
//                     <div className="flex items-center justify-center gap-2">
//                       {/* View */}
//                       <button
//                         onClick={() => handleView(item.id)}
//                         disabled={viewLoading === item.id}
//                         className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//                         title="View"
//                       >
//                         {viewLoading === item.id ? (
//                           <Loader2 className="animate-spin h-4 w-4" />
//                         ) : (
//                           <Eye className="h-4 w-4" />
//                         )}
//                       </button>

//                       {/* Download */}
//                       <button
//                         onClick={() => handleDownload(item.id)}
//                         className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
//                         title="Download"
//                       >
//                         <Download className="h-4 w-4" />
//                       </button>

//                       {/* Edit */}
//                       <button
//                         onClick={() => handleEdit(item.id)}
//                         className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
//                         title="Edit"
//                       >
//                         <Edit className="h-4 w-4" />
//                       </button>

//                       {/* Delete */}
//                       <button
//                         onClick={() => {
//                           setDeleteId(item.id);
//                           setShowDeleteModal(true);
//                         }}
//                         className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
//                         title="Delete"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                       {/* <button
//                         onClick={() => { handleConvertToInvoice(item?.estimateNumber) }}
//                         className="flex items-center mb-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-semibold transition-colors shadow-md"
//                       >
//                         <span className="mr-2">
//                           <FileText size={18} />
//                         </span>
//                         Convert to Invoice
//                       </button> */}

//                       <div className="relative group flex items-center justify-center">
//                         <button
//                           onClick={() =>
//                             handleConvertToInvoice(item?.estimateNumber)
//                           }
//                           className="flex items-center justify-center p-2 bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white rounded-md transition-all duration-300 shadow-sm"
//                         >
//                           <FileText size={18} />
//                         </button>

//                         {/* Bottom Tooltip */}
//                         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 ease-out transform group-hover:translate-y-0 -translate-y-1 pointer-events-none z-50">
//                           <div className="relative">
//                             <div className="absolute left-1/2 -translate-x-1/2 -top-1">
//                               <div className="w-2 h-2 rotate-45 bg-gray-900/95"></div>
//                             </div>
//                             <div className="px-3 py-1.5 primary-color backdrop-blur-sm rounded-md shadow-xl">
//                               <span className="text-xs font-medium text-white whitespace-nowrap">
//                                 Convert to Invoice
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//       {/* Hidden PDF Renderer */}
//       {downloadId && (
//         <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
//           <EstimateDownload
//             estimateId={downloadId}
//             onDone={() => setDownloadId(null)}
//           />
//         </div>
//       )}
//       <DeleteConfirmModal
//         open={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={() => handleDelete(deleteId)}
//       />
//     </div>
//   );
// };

// export default Estimate;

// @ts-nocheck
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Download, Edit, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import EstimateDownload from "./EstimateDownload";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import Loader from "../../components/common/Loader";
import { AgGridTable } from "../../components/common/AgGridTable";
import { cn } from "../../utils/helper";
import ExportButton from "../../components/common/ExportButton";

const initialCategories = [
  {
    id: 1,
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop",
    count: 124,
    status: "Active",
  },
  {
    id: 2,
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b830c6050?w=100&h=100&fit=crop",
    count: 85,
    status: "Active",
  },
  {
    id: 3,
    name: "Home & Garden",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=100&h=100&fit=crop",
    count: 62,
    status: "Inactive",
  },
  {
    id: 4,
    name: "Books",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=100&h=100&fit=crop",
    count: 45,
    status: "Active",
  },
];

const Estimate = () => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewLoading, setViewLoading] = useState(null);

  const getEstimates = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endPointApi.getAllEstimate}`);
      if (res.data) {
        setEstimates(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch estimates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEstimates();
  }, []);

  const handleView = async (id) => {
    try {
      setViewLoading(id);
      const res = await api.get(`${endPointApi.getByIdEstimate}/${id}`);
      if (res.data?.success) {
        navigate(`/estimate/view/${id}`);
      }
    } catch {
      toast.error("Failed to fetch estimate details");
    } finally {
      setViewLoading(null);
    }
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    try {
      const res = await api.delete(`${endPointApi.deleteEstimate}/${id}`);
      if (res.data) {
        toast.success(res.data.message || "Estimate deleted successfully");
        getEstimates();
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting estimate");
      setShowDeleteModal(false);
    }
  };

  const handleConvertToInvoice = (estimateNumber) => {
    navigate("/invoice/add", {
      state: { fromEstimate: true, estimateNumber },
    });
  };

  // 🔹 Polished Column Definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Customer Name",
        field: "customerId.name",
        filter: "agTextColumnFilter",
        minWidth: 200,
        cellRenderer: (params) => (
          <span className="font-semibold text-gray-900 dark:text-gray-200">
            {params.value || "N/A"}
          </span>
        ),
      },
      {
        headerName: "Estimate #",
        field: "estimateNumber",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "Date",
        field: "date",
        width: 130,
        valueFormatter: (params) => {
          if (!params.value) return "N/A";
          return new Date(params.value).toLocaleDateString("en-GB");
        },
      },
      {
        headerName: "Status",
        field: "state",
        width: 130,
        cellRenderer: (params) => {
          const state = params.value;
          const colorClass =
            state === "Approved"
              ? "bg-success-50 text-success-700 border-success-200"
              : state === "Rejected"
                ? "bg-error-50 text-error-700 border-error-200"
                : "bg-warning-50 text-warning-700 border-warning-200";

          return (
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                colorClass,
              )}
            >
              {state || "Pending"}
            </span>
          );
        },
      },
      {
        headerName: "Actions",
        width: 280,
        pinned: "right",
        filter: false,
        sortable: false,
        cellRenderer: (params: { data: any }) => {
          const item = params.data;
          return (
            <div className="flex items-center gap-2 h-full">
              <button
                onClick={() => handleView(item.id)}
                disabled={viewLoading === item.id}
                className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title="View"
              >
                {viewLoading === item.id ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => setDownloadId(item.id)}
                className="p-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate(`/estimate/edit/${item.id}`)}
                className="p-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  setDeleteId(item.id);
                  setShowDeleteModal(true);
                }}
                className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleConvertToInvoice(item.estimateNumber)}
                className="p-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                title="Convert to Invoice"
              >
                <FileText size={18} />
              </button>
            </div>
          );
        },
      },
    ],
    [viewLoading, navigate],
  );

  const exportCols = [
    { header: "#", key: "id", width: 8, pdfWidth: 15 },
    { header: "Customer Name", key: "customerName", width: 30, pdfWidth: 44 },
    { header: "Estimate #", key: "estimateNumber", width: 35, pdfWidth: 58 },
    { header: "Date", key: "formattedDate", width: 20, pdfWidth: 32 },
    { header: "Status", key: "state", width: 20, pdfWidth: "auto" },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <AgGridTable
        title="Estimate List"
        rowData={estimates}
        columnDefs={columnDefs}
        addButton={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/estimate/add")}
              className="flex items-center gap-2 primary-color text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all"
            >
              + Add Estimate
            </button>
            <ExportButton
              data={estimates.map((item, index) => ({
                ...item,
                id: index + 1,
                customerName: item.customerId?.name || "N/A",
                formattedDate: new Date(item.date).toLocaleDateString("en-GB"),
              }))}
              filename="Estimate_List"
              title="Estimate Directory"
              columns={exportCols}
            />
          </div>
        }
      />

      {downloadId && (
        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <EstimateDownload
            estimateId={downloadId}
            onDone={() => setDownloadId(null)}
          />
        </div>
      )}

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDelete(deleteId)}
      />
    </div>
  );
};

export default Estimate;
