// @ts-nocheck

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Edit, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import { AgGridTable } from "../../components/common/AgGridTable";
import { ColDef } from "ag-grid-community";
import ExportButton from "../../components/common/ExportButton";

// ─── Component ────────────────────────────────────────────────────────────────
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
      toast.error("Failed to fetch customers");
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
        getCustomers();
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Delete failed";
      toast.error(errorMsg);
      setShowDeleteModal(false);
    }
  };

  const exportCols = [
    { header: "#", key: "id", width: 8, pdfWidth: 15 },
    { header: "Customer Name", key: "name", width: 30, pdfWidth: 44 },
    { header: "Email Address", key: "email", width: 35, pdfWidth: 58 },
    { header: "Mobile", key: "mobile", width: 20, pdfWidth: 32 },
    { header: "City", key: "city", width: 20, pdfWidth: "auto" },
  ];

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Name",
        field: "name",
        filter: "agTextColumnFilter",
        minWidth: 200,
        cellRenderer: (params) => (
          <span
            className="font-semibold text-blue-600 dark:text-brand-400 cursor-pointer hover:underline"
            onClick={() => navigate(`/customer/${params.data.id}/statement`)}
          >
            {params.value || "N/A"}
          </span>
        ),
      },
      {
        headerName: "Email",
        field: "email",
        filter: "agTextColumnFilter",
        width: 200,
        valueFormatter: (params) => params.value || "-",
      },
      {
        headerName: "Mobile",
        field: "mobile",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "City",
        field: "city",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "Actions",
        width: 150,
        pinned: "right",
        filter: false,
        sortable: false,
        cellRenderer: (params) => {
          const item = params.data;
          return (
            <div className="flex items-center gap-2 h-full">
              <button
                onClick={() => navigate(`/customer/edit/${item.id}`)}
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
            </div>
          );
        },
      },
    ],
    [navigate],
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <AgGridTable
        // onGridReady={(params) => setGridApi(params.api)}
        title="Customer List"
        rowData={customers}
        columnDefs={columnDefs}
        addButton={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/customer/add")}
              className="flex items-center gap-2 primary-color text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all font-outfit"
            >
              + Add Customer
            </button>
            
            <ExportButton
              data={customers}
              filename="Customer_List"
              title="Customer Directory"
              columns={exportCols}
            />
          </div>
        }
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDelete(deleteId)}
      />
    </div>
  );
};

export default Customer;
