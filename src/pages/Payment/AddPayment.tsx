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
import { Upload, X, ZoomIn } from "lucide-react";
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

  // Fetch customers
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

        if (data.image) {
          setImagePreview(data.image);
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
      // Validate file size (max 5MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      // Validate file type
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
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

    // Customer validation
    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    // Invoice validation
    if (!formData.invoiceId) {
      newErrors.invoiceId = "Invoice is required";
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    // Payment mode validation
    if (!formData.paymentMode) {
      newErrors.paymentMode = "Payment mode is required";
    }

    // Amount validation
    if (!formData.amount || formData.amount.trim() === "") {
      newErrors.amount = "Amount is required";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Amount must be a valid number";
    }

    // Note validation (optional but if provided, should not be too long)
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

      // Create FormData for file upload
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

  // Whenever the customer changes, filter invoices
  const invoices = allInvoices.filter(
    (inv) => inv.customerId?.id === formData.customerId,
  );

  console.log("invoices", invoices, allInvoices);
  const invoiceOptions = invoices.map((inv) => ({
    value: inv.id,
    label: inv.invoiceNo,
  }));

  const paymentModeOptions = [
    { value: "cash", label: "Cash" },
    { value: "online", label: "Online" },
  ];

  return (
    <ComponentCard title={id ? "Edit Payment" : "Add Payment"}>
      {loading && <Loader src="/loader.mp4" fullScreen />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Name */}
        <div>
          <Label>Customer Name *</Label>
          <Select
            className={errors.customerId ? "border-red-500 focus:ring-red-200" : ""}
            disabled={isFieldDisabled}
            options={customerOptions}
            value={formData.customerId}
            placeholder="Select Customer"
            showAddButton={true}
            onAddNew={() => navigate("/customer/add")}
            addButtonText="Add New Customer"
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                customerId: value,
              }));
              setErrors((prev) => ({
                ...prev,
                customerId: "",
              }));
            }}
          />
          {errors.customerId && (
            <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>
          )}
        </div>

        {/* Invoice */}

        <div>
          <Label>Invoice Number *</Label>
          <Select
            className={errors.invoiceId ? "border-red-500 focus:ring-red-200" : ""}
            disabled={isFieldDisabled}
            options={invoiceOptions}
            value={formData.invoiceId}
            placeholder="Select Invoice"
            showAddButton={true}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                invoiceId: value,
              }));
              setErrors((prev) => ({
                ...prev,
                invoiceId: "",
              }));
            }}
          />
          {errors.invoiceId && (
            <p className="text-red-500 text-sm mt-1">{errors.invoiceId}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <DatePicker
            disabled={isFieldDisabled}
            id="payment-date"
            label="Payment Date *"
            placeholder="Select date"
            // minDate={new Date()}
            defaultDate={formData.date ?? undefined}
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
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Payment Mode */}
        <div>
          <Label>Payment Mode *</Label>
          <Select
            className={errors.paymentMode ? "border-red-500 focus:ring-red-200" : ""}
            disabled={isFieldDisabled}
            options={paymentModeOptions}
            value={formData.paymentMode}
            showAddButton={true}
            placeholder="Select Payment Mode"
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
          {errors.paymentMode && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentMode}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <Label>Amount *</Label>
          <Input
            className={errors.amount ? "border-red-500 focus:ring-red-200" : ""}
            disabled={isFieldDisabled}
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            min="0"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Note */}
        <div className="md:col-span-2">
          <Label>Note (Optional)</Label>
          <TextArea
            disabled={isFieldDisabled}
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Add any additional notes..."
            rows={6}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.note && (
              <p className="text-red-500 text-sm">{errors.note}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="">
          <Label>Payment Receipt (Optional)</Label>
          <div
            className={`relative group ${isFieldDisabled ? "pointer-events-none opacity-60" : ""}`}
          >
            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src={imagePreview}
                  alt="Preview"
                  // Disable zoom click if form is disabled
                  className={`w-32 h-32 object-cover transition-transform duration-200 ${
                    isFieldDisabled
                      ? "cursor-default"
                      : "cursor-zoom-in hover:scale-105"
                  }`}
                  onClick={() => !isFieldDisabled && setIsZoomed(true)}
                />

                {/* Hide overlay icons in disabled mode */}
                {!isFieldDisabled && (
                  <>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm text-gray-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                    <button
                      type="button" // Always specify button type
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 p-1.5 rounded-full hover:bg-white transition shadow-md opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl transition-all duration-300 
        ${
          isFieldDisabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-primary/30 cursor-pointer hover:border-primary hover:bg-primary/5 bg-muted/30"
        }`}
              >
                <Upload
                  className={`w-8 h-8 mb-2 ${isFieldDisabled ? "text-gray-300" : "text-primary/60"}`}
                />
                <p className="text-sm font-medium text-foreground/70">
                  {isFieldDisabled ? "Upload Locked" : "Drop image here"}
                </p>
                {!isFieldDisabled && (
                  <p className="text-xs text-muted-foreground">
                    or click to browse
                  </p>
                )}
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

          <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
            <DialogContent className="max-w-4xl p-2 bg-background/95 backdrop-blur-sm">
              <VisuallyHidden>
                <DialogTitle>Image Preview</DialogTitle>
              </VisuallyHidden>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Zoomed Preview"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-8 gap-3">
        <button
          type="button"
          onClick={() => navigate("/payment")}
          className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="primary-color text-white px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || isFieldDisabled}
        >
          {loading ? "Please wait" : id ? "Update Payment" : "Save Payment"}
        </button>
      </div>
    </ComponentCard>
  );
};

export default AddPayment;
