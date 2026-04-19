import { useEffect, useMemo, useState } from "react";
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

const Payment = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endPointApi.getAllPayment}`);
      if (res.data?.success) {
        setPayment(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayment();
  }, []);

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    try {
      const res = await api.delete(`${endPointApi.deletePayment}/${id}`);
      if (res.data) {
        toast.success(res.data.message || "Payment deleted successfully");
        getPayment();
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
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
        headerName: "Date",
        field: "date",
        width: 150,
        valueFormatter: (params) => {
          if (!params.value) return "N/A";
          return new Date(params.value).toLocaleDateString("en-GB");
        },
      },
      {
        headerName: "Payment Mode",
        field: "paymentMode",
        filter: "agTextColumnFilter",
        width: 180,
      },
      {
        headerName: "Amount",
        field: "amount",
        width: 150,
        cellRenderer: (params) => (
          <span className="font-bold text-gray-900 dark:text-gray-200">
            ₹{params.value || "0"}
          </span>
        ),
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
                onClick={() => navigate(`/payment/edit/${item.id}`)}
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
    { header: "Customer Name", key: "customerName", width: 30, pdfWidth: 44 },
    { header: "Date", key: "formattedDate", width: 35, pdfWidth: 58 },
    { header: "Payment Mode", key: "paymentMode", width: 20, pdfWidth: 32 },
    { header: "Amount", key: "amount", width: 20, pdfWidth: "auto" },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <AgGridTable
        title="Payment List"
        rowData={payment}
        columnDefs={columnDefs}
        addButton={
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/payment/add")}
              className="flex items-center gap-2 primary-color text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all font-outfit"
            >
              + Add Payment
            </button>
            <ExportButton
              data={payment.map((item: any, index) => ({
                ...item,
                id: index + 1,
                customerName: item.customerId?.name || "N/A",
                formattedDate: new Date(item.date).toLocaleDateString("en-GB"),
              }))}
              filename="Payment_List"
              title="Payment Directory"
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

export default Payment;
