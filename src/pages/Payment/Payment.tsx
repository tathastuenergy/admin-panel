import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Edit, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";

const Payment = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 🔹 Get all payment
  const getPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endPointApi.getAllPayment}`);

      if (res.data?.success) {
        setPayment(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      // alert("Failed to fetch payment ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayment();
  }, []);

  // 🔹 Delete payment
  const handleDelete = async (id: number | null) => {
    if (!id) return;

    try {
      const res = await api.delete(`${endPointApi.deletePayment}/${id}`);

      if (res.data) {
        toast.success(res.data.message);
        getPayment(); // refresh list
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <div className="p-4">
      {loading && <Loader src="/loader.mp4" fullScreen />}
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Payment List</h2>
        <button
          onClick={() => navigate("/payment/add")}
          className="primary-color text-white px-4 py-2 rounded hover:primary-color"
        >
          + Add Payment
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Customer Name</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Payment Mode</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : payment.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No payments found
                </td>
              </tr>
            ) : (
              payment.map((item: any, index) => (
                <tr key={item.id}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.customerId?.name}</td>
                  <td className="border p-2">{new Date(item.date).toLocaleDateString("en-GB")}</td>
                  <td className="border p-2">{item.paymentMode}</td>
                  <td className="border p-2">{item.amount}</td>

                  {/* Actions */}
                  <td className="border p-2 text-center space-x-2">
                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/payment/edit/${item.id}`)}
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

export default Payment;
