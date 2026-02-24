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
import AgGridTable from "../../components/common/AgGridTable";

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
    }
  };

  const handleConvertToInvoice = (estimateNumber) => {
    navigate("/invoice/add", {
      state: { fromEstimate: true, estimateNumber },
    });
  };

  // 🔹 AG Grid Column Definitions
  const columnDefs = useMemo(() => [
    {
      headerName: "Sr.",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 70,
    },
    {
      headerName: "Customer Name",
      field: "customerId.name",
      filter: true,
      flex: 1,
    },
    {
      headerName: "Estimate Number",
      field: "estimateNumber",
      filter: true,
    },
    {
      headerName: "Date",
      field: "date",
      valueFormatter: (params) => new Date(params.value).toLocaleDateString("en-GB"),
    },
    {
      headerName: "State",
      field: "state",
      cellRenderer: (params) => {
        const state = params.value;
        const colorClass = state === "Approved" 
          ? "bg-green-100 text-green-800" 
          : state === "Rejected" 
          ? "bg-red-100 text-red-800" 
          : "bg-yellow-100 text-yellow-800";
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
            {state}
          </span>
        );
      }
    },
    {
      headerName: "Actions",
      width: 250,
      pinned: 'right', // Keeps actions visible while scrolling
      cellRenderer: (params) => {
        const item = params.data;
        return (
          <div className="flex items-center gap-2 h-full">
            <button
              onClick={() => handleView(item.id)}
              disabled={viewLoading === item.id}
              className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="View"
            >
              {viewLoading === item.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setDownloadId(item.id)}
              className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate(`/estimate/edit/${item.id}`)}
              className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setDeleteId(item.id);
                setShowDeleteModal(true);
              }}
              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleConvertToInvoice(item.estimateNumber)}
              className="p-1.5 bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white rounded"
              title="Convert to Invoice"
            >
              <FileText size={18} />
            </button>
          </div>
        );
      }
    }
  ], [viewLoading]);

  return (
    <div className="p-4">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Estimate List</h2>
        <button
          onClick={() => navigate("/estimate/add")}
          className="primary-color text-white px-4 py-2 rounded"
        >
          + Add Estimate
        </button>
      </div>

      {/* 🔹 Replaced simple table with your AgGridTable */}
      <AgGridTable
        tableName="Estimates"
        rowData={estimates}
        columns={columnDefs}
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
