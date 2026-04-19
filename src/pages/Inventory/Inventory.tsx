// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Edit, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import { AgGridTable } from "../../components/common/AgGridTable";
import { ColDef } from "ag-grid-community";
import { cn } from "../../utils/helper";
import ExportButton from "../../components/common/ExportButton";

const Inventory = () => {
  const navigate = useNavigate();
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  const getInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endPointApi.getAllInventory}`);
      if (res.data?.success) {
        setInventoryList(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInventory();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(
        `${endPointApi.deleteInventory}/${deleteId}`,
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Inventory deleted successfully");
        setShowDeleteModal(false);
        setDeleteId(null);
        getInventory();
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Delete failed";
      toast.error(errorMsg);
      setShowDeleteModal(false);
    }
  };

  const handleExcelClick = () => fileInputRef.current.click();

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const res = await api.post(endPointApi.uploadExcelInventory, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data) {
        toast.success("Excel uploaded successfully");
        getInventory();
      }
    } catch {
      toast.error("Excel upload failed");
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Name",
        field: "name",
        filter: "agTextColumnFilter",
        minWidth: 200,
        cellRenderer: (params) => (
          <span className="font-semibold text-gray-900 dark:text-gray-200">
            {params.value || "N/A"}
          </span>
        ),
      },
      {
        headerName: "HSN",
        field: "hsn",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "Tax (%)",
        field: "tax",
        width: 120,
        valueFormatter: (params) => (params.value ? `${params.value}%` : "-"),
      },
      {
        headerName: "Unit",
        field: "unit",
        width: 120,
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
                onClick={() => navigate(`/inventory/edit/${item.id}`)}
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

  const exportCols = [
    { header: "#", key: "id", width: 8, pdfWidth: 15 },
    { header: "Name", key: "name", width: 30, pdfWidth: 44 },
    { header: "HSN", key: "hsn", width: 35, pdfWidth: 58 },
    { header: "TAX(%)", key: "tax", width: 20, pdfWidth: 32 },
    { header: "UNIT", key: "unit", width: 20, pdfWidth: "auto" },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <AgGridTable
        title="Inventory List"
        rowData={inventoryList}
        columnDefs={columnDefs}
        addButton={
          <div className="flex gap-3">
            <button
              onClick={handleExcelClick}
              className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-green-600 hover:text-white transition-all"
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
              className="primary-color text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all font-outfit"
            >
              + Add Inventory
            </button>
            <ExportButton
              data={inventoryList}
              filename="Inventory_List"
              title="Inventory Directory"
              columns={exportCols}
            />
          </div>
        }
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Inventory;
