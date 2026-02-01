// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Download, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import EstimateDownload from "./EstimateDownload";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import Loader from "../../components/common/Loader";

const Estimate = () => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewLoading, setViewLoading] = useState(null);

  // 🔹 Get all estimate
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

  // 🔹 View estimate
  // const handleView = (id) => {
  //   navigate(`/estimate/view/${id}`);
  // };
 const handleView = async (id) => {
    try {
      setViewLoading(id); // Start loading for this specific button
      const res = await api.get(`${endPointApi.getByIdEstimate}/${id}`);

      if (res.data?.success) {
        // Navigate only after data is confirmed
        navigate(`/estimate/view/${id}`);
      }
    } catch (error) {
      toast.error("Failed to fetch estimate details");
    } finally {
      setViewLoading(null);
    }
  };

  const handleDownload = (id) => {
    setDownloadId(id)
    // navigate(`/estimate/download/${id}`);
  };

  // 🔹 Edit estimate
  const handleEdit = (id) => {
    navigate(`/estimate/edit/${id}`);
  };

  // 🔹 Delete estimate
  const handleDelete = async (id: number | null) => {
    if (!id) return;

    try {
      const res = await api.delete(`${endPointApi.deleteEstimate}/${id}`);

      if (res.data) {
        toast.success(res.data.message);
        getEstimates(); // refresh list
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error deleting estimate");
    }
  };

  return (
    <div className="p-4">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Estimate List</h2>
        <button
          onClick={() => navigate("/estimate/add")}
          className="primary-color text-white px-4 py-2 rounded hover:primary-color"
        >
          + Add Estimate
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Customer Name</th>
              <th className="border p-2">Estimate Number</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">State</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : estimates.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No estimate found
                </td>
              </tr>
            ) : (
              estimates.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.customerId?.name}</td>
                  <td className="border p-2">{item.estimateNumber}</td>
                  <td className="border p-2">
                    {" "}
                    {new Date(item.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${item.state === "Approved"
                        ? "bg-green-100 text-green-800"
                        : item.state === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {item.state}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="border p-2">
                    <div className="flex items-center justify-center gap-2">
                      {/* View */}
                      <button
                        onClick={() => handleView(item.id)}
                      disabled={viewLoading === item.id}

                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        title="View"
                      >
                         {viewLoading === item.id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      </button>

                      {/* Download */}
                      <button
                        onClick={() => handleDownload(item.id)}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          setDeleteId(item.id);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Hidden PDF Renderer */}
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
