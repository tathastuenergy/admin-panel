import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Download, Edit, Eye, Loader2, Trash2 } from "lucide-react";
import InvoiceDownload from "./InvoiceDownload";
import Loader from "../../components/common/Loader";
import { AgGridTable } from "../../components/common/AgGridTable";
import { ColDef } from "ag-grid-community";
import { cn } from "../../utils/helper";
import ExportButton from "../../components/common/ExportButton";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  orderNo?: string;
  date: string;
  state: string;
  customerId?: {
    name: string;
  };
}

const Invoice = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(null);

  const handleView = async (id) => {
    try {
      setViewLoading(id);
      const res = await api.get(`${endPointApi.getByIdInvoice}/${id}`);
      if (res.data?.success) {
        navigate(`/invoice/view/${id}`);
      }
    } catch {
      toast.error("Failed to fetch invoice details");
    } finally {
      setViewLoading(null);
    }
  };

  const getInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endPointApi.getAllInvoice}`);
      if (res.data?.success) {
        setInvoices(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInvoice();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`${endPointApi.deleteInvoice}/${id}`);
      if (res.data) {
        toast.success(res.data.message || "Invoice deleted successfully");
        getInvoice();
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Delete failed";
      toast.error(errorMsg);
      setShowDeleteModal(false);
    }
  };

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
        headerName: "Invoice #",
        field: "invoiceNo",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "Order #",
        field: "orderNo",
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
            state === "Paid"
              ? "bg-success-50 text-success-700 border-success-200"
              : state === "Unpaid"
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
        width: 250,
        pinned: "right",
        filter: false,
        sortable: false,
        cellRenderer: (params) => {
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
                onClick={() => navigate(`/invoice/edit/${item.id}`)}
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
    [viewLoading, navigate],
  );

  const exportCols = [
    { header: "#", key: "id", width: 8, pdfWidth: 15 },
    { header: "Customer Name", key: "customerName", width: 30, pdfWidth: 44 },
    { header: "Invoice #", key: "invoiceNo", width: 35, pdfWidth: 58 },
    { header: "Order #", key: "orderNo", width: 35, pdfWidth: 58 },
    { header: "Date", key: "formattedDate", width: 20, pdfWidth: 32 },
    { header: "Status", key: "state", width: 20, pdfWidth: "auto" },
  ];
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <AgGridTable
        title="Invoice List"
        rowData={invoices}
        columnDefs={columnDefs}
        addButton={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/invoice/add")}
              className="flex items-center gap-2 primary-color text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all font-outfit"
            >
              + Add Invoice
            </button>
            <ExportButton
              data={invoices.map((item, index) => ({
                ...item,
                id: index + 1,
                customerName: item.customerId?.name || "N/A",
                orderNo: item.orderNo || "N/A",
                formattedDate: item.date
                  ? new Date(item.date).toLocaleDateString("en-GB")
                  : "N/A",
                state: item.state || "Pending",
              }))}
              filename="Invoice_List"
              title="Invoice Directory"
              columns={exportCols}
            />
          </div>
        }
      />

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
