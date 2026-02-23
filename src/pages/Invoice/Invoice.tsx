// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Download, Edit, Eye, Loader2, Trash2 } from "lucide-react";
import InvoiceDownload from "./InvoiceDownload";
import Loader from "../../components/common/Loader";

const Invoice = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(null);

  // 🔹 View invoice
  const handleView = async (id) => {
    try {
      setViewLoading(id); // Start loading for this specific button
      const res = await api.get(`${endPointApi.getByIdInvoice}/${id}`);

      if (res.data?.success) {
        // Navigate only after data is confirmed
        navigate(`/invoice/view/${id}`);
      }
    } catch {
      toast.error("Failed to fetch invoice details");
    } finally {
      setViewLoading(null);
    }
  };

  const handleDownload = (id) => {
    setDownloadId(id);
  };

  // 🔹 Get all invoices
  const getInvoice = async () => {
    try {
      setLoading(true);

      const res = await api.get(`${endPointApi.getAllInvoice}`);
      if (res.data?.success) {
        setInvoices(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      // alert("Failed to fetch invoices ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInvoice();
  }, []);

  // 🔹 Delete customer
  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`${endPointApi.deleteInvoice}/${id}`);

      if (res.data) {
        toast.success(res.data.message || "Invoice deleted successfully");
        getInvoice(); // refresh list
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
        <h2 className="text-xl font-semibold">Invoice List</h2>
        <button
          onClick={() => navigate("/invoice/add")}
          className="primary-color text-white px-4 py-2 rounded hover:primary-color"
        >
          + Add Invoice
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Customer Name</th>
              <th className="border p-2">Invoice Number</th>
              <th className="border p-2">Order Number</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">State</th>
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
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No invoice found
                </td>
              </tr>
            ) : (
              invoices.map((item, index) => (
                <tr key={item.id}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.customerId?.name}</td>
                  <td className="border p-2">{item.invoiceNo}</td>
                  <td className="border p-2">{item.orderNo}</td>
                  <td className="border p-2">
                    {new Date(item.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border p-2">{item.state}</td>

                  {/* Actions */}
                  <td className="border p-2 text-center space-x-2">
                    {/* View */}
                    <button
                      onClick={() => handleView(item.id)}
                      disabled={viewLoading === item.id}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {viewLoading === item.id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {/* Download*/}
                    <button
                      onClick={() => handleDownload(item.id)}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/invoice/edit/${item.id}`)}
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
      {/* Hidden PDF Renderer */}
      {downloadId && (
        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <InvoiceDownload
            invoiceId={downloadId}
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

export default Invoice;
