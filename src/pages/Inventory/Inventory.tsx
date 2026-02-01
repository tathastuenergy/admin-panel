// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Edit, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";

const Inventory = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 🔹 Get all Inventory
  const getInventory = async () => {
    try {
      setLoading(true);

      const res = await api.get(`${endPointApi.getAllInventory}`);

      if (res.data?.success) {
        setCustomers(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch customers ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInventory();
  }, []);

  // 🔹 Delete inventory
  const handleDelete = async (id: number | null) => {
    if (!id) return;

    try {
      const res = await api.delete(`${endPointApi.deleteInventory}/${id}`);

      if (res.data) {
        toast.success(res.data.message);
        getInventory(); // refresh list
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const fileInputRef = useRef(null);

  const handleExcelClick = () => {
    fileInputRef.current.click();
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
       const res = await api.post(endPointApi.uploadExcelInventory, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      if (res.data) {
        toast.success("Excel uploaded successfully");
        getInventory();

        // optional: inventory list reload
      } else {
        toast.error("Excel upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-4">
      {loading && <Loader src="/loader.mp4" fullScreen />}
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Inventory List</h2>

        {/* Right side buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExcelClick}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Excel Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
          />
          <button
            onClick={() => navigate("/inventory/add")}
            className="primary-color text-white px-4 py-2 rounded"
          >
            + Add Inventory
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Hsn</th>
              <th className="border p-2">Tax</th>
              <th className="border p-2">Unit</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((item, index) => (
                <tr key={item._id}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.hsn || "-"}</td>
                  <td className="border p-2">
                    {item.tax ? `${item.tax}%` : "-"}
                  </td>
                  <td className="border p-2">{item.unit}</td>

                  {/* Actions */}
                  <td className="border p-2 text-center space-x-2">
                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/inventory/edit/${item.id}`)}
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDelete(deleteId)}
      />
    </div>
  );
};

export default Inventory;
