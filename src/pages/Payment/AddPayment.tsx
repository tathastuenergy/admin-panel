// @ts-nocheck
import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { useNavigate, useParams } from "react-router";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { toast } from "react-toastify";
import Select from "../../components/form/Select";
import { Upload, X, ZoomIn, CreditCard, Receipt, Calendar, User, ClipboardList, FileText, Image as ImageIcon, ArrowLeft, Save, Info } from "lucide-react";
import axios from "axios";
import TextArea from "../../components/form/input/TextArea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog/Dailog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Loader from "../../components/common/Loader";
import { useForm } from "../Context/FormContext";

interface PaymentFormData {
  customerId: string;
  invoiceId: string;
  date: Date | null;
  paymentMode: "" | "online" | "cash";
  amount: string;
  note: string;
  image?: File | null;
}

interface Customer {
  id: string;
  name: string;
  state: string;
  email?: string;
}

const AddPayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isFormEnabled } = useForm();
  const isEnabledFromSettings = isFormEnabled("payment");
  const isFieldDisabled = id ? !isEnabledFromSettings : false;

  const [formData, setFormData] = useState<PaymentFormData>({
    customerId: "",
    invoiceId: "",
    date: new Date(),
    paymentMode: "",
    amount: "",
    note: "",
    image: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allInvoices, setAllInvoices] = useState<
    { id: string; invoiceNo: string; customerId: { id: string } }[]
  >([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get(`${endPointApi.getAllCustomer}`);
        setCustomers(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load customers");
      }
    };

    fetchCustomers();
  }, []);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`${endPointApi.getAllInvoice}`);
        setAllInvoices(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load invoice");
      }
    };

    fetchInvoice();
  }, []);

  // Fetch payment by ID (for edit mode)
  useEffect(() => {
    if (!id) return;

    const fetchPayment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${endPointApi.getByIdPayment}/${id}`);
        const data = res.data.data;

        setFormData({
          customerId: data.customerId?.id || "",
          invoiceId: data.invoiceId?.id || "",
          date: data.date ? new Date(data.date) : null,
          paymentMode: data.paymentMode || "",
          amount: data.amount?.toString() || "",
          note: data.note || "",
          image: null,
        });

        if (data.image?.url) {
          setImagePreview(data.image?.url);
        }
      } catch (error) {
        toast.error("Failed to load payment details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 10MB",
        }));
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Only JPG, PNG and WEBP images are allowed",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.paymentMode) {
      newErrors.paymentMode = "Payment mode is required";
    }
    if (!formData.amount || formData.amount.trim() === "") {
      newErrors.amount = "Amount is required";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Amount must be a valid number";
    }
    if (formData.note && formData.note.length > 500) {
      newErrors.note = "Note should not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("customerId", formData.customerId);
      formDataToSend.append("invoiceId", formData.invoiceId);
      formDataToSend.append("date", formData.date?.toISOString() || "");
      formDataToSend.append("paymentMode", formData.paymentMode);
      formDataToSend.append("amount", formData.amount);
      formDataToSend.append("note", formData.note);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const method = id ? "put" : "post";
      const url = id
        ? `${endPointApi.updatePayment}/${id}`
        : `${endPointApi.createPayment}`;

      const res = await api[method](url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data) {
        toast.success(
          id
            ? "Payment updated successfully ✅"
            : "Payment added successfully ✅",
        );
        navigate("/payment");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong ❌");
      } else {
        toast.error("Something went wrong ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const customerOptions = customers.map((cust) => ({
    value: cust.id,
    label: cust.name,
  }));

  const invoices = allInvoices.filter(
    (inv) => inv.customerId?.id === formData.customerId,
  );

  const invoiceOptions = invoices.map((inv) => ({
    value: inv.id,
    label: inv.invoiceNo,
  }));

  const paymentModeOptions = [
    { value: "cash", label: "Cash Payment" },
    { value: "online", label: "Online / Bank Transfer" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 dark:bg-[#0f172a]">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/payment")}
              className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-outfit dark:text-white">
                {id ? "Edit Payment Record" : "Add Payment"}
              </h1>
              <p className="text-sm text-gray-500">
                {id ? "Modify existing transaction details" : "Record a new payment received from a customer"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-white">Transaction Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gray-400" /> Customer Name *
                  </Label>
                  <Select
                    className={`${errors.customerId ? "border-red-500 focus:ring-red-200" : "focus:border-blue-400 focus:ring-blue-100"} rounded-xl transition-all h-[42px]`}
                    disabled={isFieldDisabled}
                    options={customerOptions}
                    value={formData.customerId}
                    placeholder="Select Customer"
                    showAddButton={true}
                    onAddNew={() => navigate("/customer/add")}
                    addButtonText="Add New"
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        customerId: value,
                        invoiceId: "", // Reset invoice when customer changes
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        customerId: "",
                      }));
                    }}
                  />
                  {errors.customerId && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.customerId}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5 text-gray-400" /> Invoice Number
                  </Label>
                  <Select
                    disabled={isFieldDisabled || !formData.customerId}
                    options={invoiceOptions}
                    value={formData.invoiceId}
                    placeholder={formData.customerId ? "Select Invoice (Optional)" : "Select customer first"}
                    className="rounded-xl transition-all h-[42px] border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        invoiceId: value,
                      }));
                    }}
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" /> Payment Date *
                  </Label>
                  <DatePicker
                    disabled={isFieldDisabled}
                    id="payment-date"
                    placeholder="Select date"
                    defaultDate={formData.date ?? undefined}
                    className={`${errors.date ? "border-red-500" : ""} rounded-xl transition-all`}
                    onChange={(selectedDates) => {
                      setFormData((prev) => ({
                        ...prev,
                        date: selectedDates[0],
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        date: "",
                      }));
                    }}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.date}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" /> Payment Mode *
                  </Label>
                  <Select
                    className={`${errors.paymentMode ? "border-red-500" : "border-gray-200"} rounded-xl transition-all h-[42px] focus:border-blue-400 focus:ring-blue-100`}
                    disabled={isFieldDisabled}
                    searchable={false}
                    options={paymentModeOptions}
                    value={formData.paymentMode}
                    placeholder="Select Mode"
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        paymentMode: value as "cash" | "online",
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        paymentMode: "",
                      }));
                    }}
                  />
                  {errors.paymentMode && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.paymentMode}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5 text-gray-400" /> Amount Received *
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                    <Input
                      className={`${errors.amount ? "border-red-500 dark:border-red-500" : "border-gray-200 dark:border-[#2a3550]"} rounded-xl p-2.5 pl-8 transition-all w-full text-lg font-bold text-gray-700 focus:ring-blue-100 focus:border-blue-400`}
                      disabled={isFieldDisabled}
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.amount}</p>}
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-white">Additional Details</h3>
              </div>
              
              <div>
                <Label className="text-gray-700 font-semibold mb-1.5">Note (Optional)</Label>
                <TextArea
                  disabled={isFieldDisabled}
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Record bank reference, check number, or other details..."
                  rows={4}
                  className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-100 transition-all resize-none"
                />
                {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
              </div>
            </ComponentCard>
          </div>

          {/* Right Column: Receipt Upload */}
          <div className="space-y-6">
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-white">Proof of Payment</h3>
              </div>

              <div className="space-y-4">
                <div
                  className={`relative overflow-hidden group border-2 border-dashed rounded-3xl transition-all duration-300 min-h-[220px] flex items-center justify-center p-4 
                    ${isFieldDisabled ? "bg-gray-50 border-gray-200 cursor-not-allowed" : 
                      imagePreview ? "border-blue-200 bg-blue-50/10" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/10 cursor-pointer"}`}
                >
                  {imagePreview ? (
                    <div className="relative w-full aspect-square max-w-[200px] overflow-hidden rounded-2xl shadow-md">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={`w-full h-full object-cover transition-transform duration-300 ${!isFieldDisabled ? "cursor-zoom-in hover:scale-110" : ""}`}
                        onClick={() => !isFieldDisabled && setIsZoomed(true)}
                      />
                      
                      {!isFieldDisabled && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsZoomed(true)}
                            className="p-2.5 bg-white text-gray-700 rounded-full hover:bg-gray-100 shadow-lg text-xs font-bold transition-all"
                          >
                            <ZoomIn className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className={`w-full flex flex-col items-center justify-center cursor-pointer ${isFieldDisabled ? "pointer-events-none" : ""}`}>
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-sm font-bold text-gray-700">Upload Receipt</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP (Max 10MB)</p>
                      <input
                        disabled={isFieldDisabled}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                {errors.image && <p className="text-red-500 text-xs text-center font-medium">{errors.image}</p>}
                
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <div className="flex gap-3">
                    <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                      Uploading a receipt proof helps in auditing and resolving transaction disputes later.
                    </p>
                  </div>
                </div>
              </div>

              <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
                <DialogContent className="max-w-4xl p-2 bg-white/95 backdrop-blur-sm border-none shadow-2xl overflow-hidden rounded-3xl">
                  <VisuallyHidden>
                    <DialogTitle>Proof Image Preview</DialogTitle>
                  </VisuallyHidden>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Zoomed Proof"
                      className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
                    />
                  )}
                </DialogContent>
              </Dialog>
            </ComponentCard>
          </div>
        </div>

        {/* Global Action Footer */}
        <div className="mt-8 flex items-center justify-between p-4 bg-white dark:bg-[#1e2535] dark:border-[#2a3550] border border-gray-200 rounded-3xl shadow-lg mb-10">
          <div className="hidden md:flex items-center gap-2 pl-4 text-gray-400 font-medium">
            <Info className="h-4 w-4" />
            <span className="text-sm dark:text-gray-400">Please ensure the amount matches your bank statement</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/payment")}
              className="px-8 py-3.5 bg-gray-50 dark:bg-[#252d40] dark:text-gray-300 dark:hover:bg-[#2a3550] dark:border-[#2a3550] text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 flex-1 md:flex-none justify-center border border-gray-100 shadow-sm"
            >
              <X className="h-5 w-5" /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || isFieldDisabled}
              className={`${isFieldDisabled ? "bg-gray-300 pointer-events-none" : "primary-color hover:shadow-lg shadow-blue-50"} text-white px-10 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              {id ? "Update Payment" : "Save Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPayment;
