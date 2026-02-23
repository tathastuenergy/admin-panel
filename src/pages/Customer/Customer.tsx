// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Edit, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";

const Customer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 🔹 Get all customers
  const getCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endPointApi.getAllCustomer}`);

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
    getCustomers();
  }, []);

  // 🔹 Delete customer
  const handleDelete = async (id: number | null) => {
    if (!id) return;

    try {
      const res = await api.delete(`${endPointApi.deleteCustomer}/${id}`);

      if (res.data?.success) {
        toast.success(res.data.message || "Customer deleted successfully");
        getCustomers(); // refresh list
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Delete failed";
      toast.error(errorMsg);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="p-4">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Customer List</h2>
        <button
          onClick={() => navigate("/customer/add")}
          className="primary-color text-white px-4 py-2 rounded hover:primary-color"
        >
          + Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">City</th>
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
                <tr key={item.id}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td
                    className="border p-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/customer/${item.id}/statement`)}
                  >
                    {item.name}
                  </td>

                  <td className="border p-2">{item.email || "-"}</td>
                  <td className="border p-2">{item.mobile}</td>
                  <td className="border p-2">{item.city}</td>

                  {/* Actions */}
                  <td className="border p-2 text-center space-x-2">
                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/customer/edit/${item.id}`)}
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

export default Customer;
