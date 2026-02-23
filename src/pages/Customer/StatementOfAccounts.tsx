import { useEffect, useRef, useState } from "react";
import {
  Phone,
  MapPin,
  Mail,
  Download,
  Loader2,
  Check,
  Edit2,
  X,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import DateRangeFilter from "../../components/form/DateRangeFilter";
import TextArea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { cityOptions, getStateFromCity } from "../../utils/cityStateData";
import Select from "../../components/form/Select";

interface Company {
  company_name: string;
  company_logo: string;
  gst_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  phone_number: string;
  email: string;
}

interface Customer {
  name: string;
  mobile: string;
  email: string;
  gst_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Transaction {
  date: string;
  type?: string;
  transaction?: string;
  notes: string;
  amount: number;
  payment: number;
  balance: number;
}

interface StatementData {
  company: Company;
  customer: Customer;
  summary: {
    openingBalance: number;
    invoicedAmount: number;
    amountPaid: number;
    balanceDue: number;
  };
  transactions: Transaction[];
}

type PdfOptions = {
  margin?: number | [number, number, number, number];
  filename?: string;

  image?: {
    type?: "jpeg" | "png" | "webp";
    quality?: number;
  };

  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    letterRendering?: boolean;
  };

  jsPDF?: {
    unit?: "pt" | "mm" | "cm" | "in";
    format?: "a4" | "letter" | "legal" | [number, number];
    orientation?: "portrait" | "landscape";
  };

  pagebreak?: {
    mode?: ("avoid-all" | "css" | "legacy")[];
  };
};

export default function StatementOfAccounts() {
  const { id } = useParams<{ id: string }>();
  const statementRef = useRef<HTMLDivElement>(null);
  const [statementData, setStatementData] = useState<StatementData | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<{
    value: string; // ✅ Add this - stores "this_month", "last_year", etc.
    label: string; // Display text like "This Month", "Last Year"
    start: string;
    end: string;
  } | null>(null);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gst_number: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});

  const handleDownloadPDF = async () => {
    if (!statementRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      const customerName = statementData?.customer.name || "customer";
      const currentDate = new Date().toISOString().split("T")[0];

      const opt: PdfOptions = {
        margin: 0,
        filename: `statement-${customerName}-${currentDate}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      await html2pdf().from(statementRef.current).set(opt).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDFBlob = async (): Promise<Blob> => {
    if (!statementRef.current) throw new Error("No content");

    const opt: PdfOptions = {
      margin: [10, 10, 10, 10],
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const pdf = await html2pdf()
      .from(statementRef.current)
      .set(opt)
      .outputPdf("blob");

    return pdf;
  };

  const getStatement = async () => {
    try {
      setLoading(true);
      // Send the start and end dates to the backend
      const res = await api.get(
        `${endPointApi.customerStatement}/${id}/statement`,
        {
          params: {
            startDate: selectedYear?.start,
            endDate: selectedYear?.end,
          },
        },
      );
      setStatementData(res.data);
      // Initialize Edit Form with data from response
      const c = res.data.customer;

      setFormData({
        name: c.name || "",
        mobile: c.mobile || "",
        email: c.email || "",
        gst_number: c.gst_number || "",
        address: c.address || "",
        city: c.city || "",
        state: c.state || "",
        country: c.country || "India",
        pincode: c.pincode || "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when user selects a different year in the dropdown
  useEffect(() => {
    if (id) getStatement();
  }, [id, selectedYear]);

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val || 0);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --- Edit Form Handlers (Mirrored from your AddCustomer logic) ---
  const handleCityChange = (value: string) => {
    const state = getStateFromCity(value);
    setFormData((prev) => ({
      ...prev,
      city: value,
      state,
      country: "India",
    }));
    setErrors((prev) => ({ ...prev, city: "", state: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" || name === "pincode") {
      if (!/^\d*$/.test(value)) return;
      if (name === "mobile" && value.length > 10) return;
      if (name === "pincode" && value.length > 6) return;
    }

    if (name === "gst_number") {
      if (value.length > 15) return;
      if (!/^[a-zA-Z0-9]*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "gst_number" ? value.toUpperCase() : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required";
    }

    // Mobile
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    // GST
    if (!formData.gst_number) {
      newErrors.gst_number = "GST number is required";
    } else if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gst_number,
      )
    ) {
      newErrors.gst_number = "Enter a valid GST number";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.address) {
      newErrors.address = "Address is required";
    }

    // City
    if (!formData.city) {
      newErrors.city = "Please select a city";
    }

    // Pincode
    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateCustomer = async () => {
    if (!validateForm()) return;
    setLoading(true); // loader ON

    try {
      const method = "put";
      const url = `${endPointApi.updateCustomer}/${id}`;

      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        gst_number: formData.gst_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      };

      const res = await api[method](url, payload);

      if (res.data?.success) {
        toast.success("Customer updated successfully");
        setIsEditing(false)
        getStatement();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false); // loader OFF
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f9fafb" }}
      >
        <div className="text-center">
          <Loader2
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: "#2563eb" }}
          />
          <p style={{ color: "#4b5563" }}>Loading Statement...</p>
        </div>
      </div>
    );
  }

  if (!statementData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f9fafb" }}
      >
        <div className="text-center">
          <p className="text-lg" style={{ color: "#4b5563" }}>
            No statement data found.
          </p>
        </div>
      </div>
    );
  }

  const { company, customer, summary, transactions } = statementData;

  const handleSendEmail = async () => {
    try {
      const pdfBlob = await generatePDFBlob();

      const formData = new FormData();
      formData.append("pdf", pdfBlob, "statement.pdf");
      formData.append("email", customer.email);
      formData.append("customerName", customer.name);
      formData.append("company_name", company?.company_name);

      await api.post("customer/send-statement-email", formData);

      toast.success("Email sent successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const dateRangeOptions = [
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_year", label: "This Year" },
    { value: "last_year", label: "Last Year" },
    { value: "custom", label: "Custom Range" },
  ];

  return (
    <div className="min-h-screen p-8" style={{ background: "#f9fafb" }}>
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div
        ref={statementRef}
        className="max-w-7xl mx-auto shadow-lg"
        style={{ background: "#ffffff" }}
      >
        {/* Header */}
        <div
          className="p-8"
          style={{
            borderBottom: "4px solid #2563eb",
            background: "linear-gradient(to right, #eff6ff, #ffffff)",
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "#1e3a8a" }}
              >
                {company.company_name}
              </h1>
              <div
                className="flex items-start gap-2 text-sm mb-1"
                style={{ color: "#4b5563" }}
              >
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <p className="max-w-[300px] leading-relaxed">
                  {company.address},<br /> {company.city}, {company.state} -{" "}
                  {company.pincode}
                </p>
              </div>

              {company.phone_number && (
                <div
                  className="flex items-center gap-2 text-sm mt-1"
                  style={{ color: "#4b5563" }}
                >
                  <Phone className="w-4 h-4" />
                  <p>{company.phone_number}</p>
                </div>
              )}
              {company.email && (
                <div
                  className="flex items-center gap-2 text-sm mt-1"
                  style={{ color: "#4b5563" }}
                >
                  <Mail className="w-4 h-4" />
                  <p>{company.email}</p>
                </div>
              )}
              <p className="text-sm font-bold text-blue-700 mt-1">
                GST: {company.gst_number}
              </p>
            </div>
            {/* Filter, Download and Email */}
            <div className="text-right" data-html2canvas-ignore="true">
              <div className="flex justify-end gap-3 mb-4 no-print">
                <DateRangeFilter
                  options={dateRangeOptions}
                  placeholder="Select Date Range"
                  value={selectedYear?.value || ""} // ✅ Use value, not label
                  // alwaysShowCalendar={true}
                  onChange={(value, startDate, endDate) => {
                    if (startDate && endDate) {
                      const option = dateRangeOptions.find(
                        (opt) => opt.value === value,
                      );
                      setSelectedYear({
                        value: value, // "this_month", "last_year", etc.
                        label: option?.label || value, // "This Month", "Last Year", etc.
                        start: startDate,
                        end: endDate,
                      });
                    }
                  }}
                />
                <button
                  title="Download Statement"
                  className={`p-3 rounded-full transition-colors border ${
                    isDownloading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{
                    color: "#2563eb",
                    borderColor: "#dbeafe",
                    background: isDownloading ? "#f3f4f6" : "#ffffff",
                  }}
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  onMouseEnter={(e) =>
                    !isDownloading &&
                    (e.currentTarget.style.background = "#eff6ff")
                  }
                  onMouseLeave={(e) =>
                    !isDownloading &&
                    (e.currentTarget.style.background = "#ffffff")
                  }
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
                <button
                  title="Send Email"
                  className="p-3 rounded-full transition-colors border"
                  style={{
                    color: "#16a34a",
                    borderColor: "#bbf7d0",
                    background: "#ffffff",
                  }}
                  onClick={handleSendEmail}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0fdf4")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#ffffff")
                  }
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {/* Dynamic Customer Section (View/Edit) */}
        <div className="p-8 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            {!isEditing ? <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Bill To:
            </h2> : <h2></h2>}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="no-print flex items-center gap-2 px-4 py-2 text-sm border rounded bg-white hover:shadow-sm transition-all"
            >
              {isEditing ? (
                <>
                  <X size={16} className="text-red-500" /> Cancel
                </>
              ) : (
                <>
                  <Edit2 size={16} className="text-blue-600" /> Edit Customer
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print p-6 bg-white border rounded-xl shadow-inner">
              <div className="md:col-span-2">
                <Label>Customer Name</Label>
                <Input
                  className={
                    errors.name ? "border-red-500 focus:ring-red-200" : ""
                  }
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>Mobile</Label>
                <Input
                  className={
                    errors.mobile ? "border-red-500 focus:ring-red-200" : ""
                  }
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  max={10}
                  inputMode="numeric"
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className={
                    errors.email ? "border-red-500 focus:ring-red-200" : ""
                  }
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <TextArea
                  className={
                    errors.address ? "border-red-500 focus:ring-red-200" : ""
                  }
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <Label>City</Label>
                <Select
                  className={
                    errors.city ? "border-red-500 focus:ring-red-200" : ""
                  }
                  showAddButton={true}
                  options={cityOptions}
                  value={formData.city}
                  onChange={handleCityChange}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label>State</Label>
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  placeholder="Auto-filled based on city"
                  readOnly
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country}
                  placeholder="Auto-filled based on city"
                  readOnly
                />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input
                  className={
                    errors.pincode ? "border-red-500 focus:ring-red-200" : ""
                  }
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="Enter area pincode"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                )}
              </div>
              <div>
                <Label>GST Number</Label>
                <Input
                  className={
                    errors.gst_number ? "border-red-500 focus:ring-red-200" : ""
                  }
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  placeholder="Enter GSTIN (if applicable)"
                />
                {errors.gst_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gst_number}
                  </p>
                )}
              </div>
              <div className="md:col-span-4 flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleUpdateCustomer}
                  className="flex items-center gap-2 primary-color text-white px-6 py-2 rounded-lg font-bold"
                >
                  <Check size={18} /> Update Customer Info
                </button>
              </div>
            </div>
          ) : (
            <div className="view-mode">
              <h3 className="text-xl font-bold text-gray-900">
                {customer.name}
              </h3>
              <p className="text-sm mb-1" style={{ color: "#4b5563" }}>
                {" "}
                {customer.address}
                <br />
                {customer.city}, {customer.state} - {customer.pincode}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Phone className="w-4 h-4" /> {customer.mobile}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Mail className="w-4 h-4" /> {customer.email}
              </div>
              <div className="text-sm font-bold text-blue-700 mt-1">
                GST: {customer.gst_number}
              </div>
            </div>
          )}
        </div>

        {/* Account Summary */}
        <div
          className="p-8 border-b avoid-break"
          style={{ background: "#eff6ff" }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: "#111827" }}>
            Account Summary
          </h3>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm mb-1" style={{ color: "#4b5563" }}>
                Opening Balance
              </p>
              <p className="text-xl font-bold" style={{ color: "#111827" }}>
                {formatCurrency(summary.openingBalance)}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: "#4b5563" }}>
                Invoiced Amount
              </p>
              <p className="text-xl font-bold" style={{ color: "#2563eb" }}>
                {formatCurrency(summary.invoicedAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: "#4b5563" }}>
                Amount Paid
              </p>
              <p className="text-xl font-bold" style={{ color: "#16a34a" }}>
                {formatCurrency(summary.amountPaid)}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: "#4b5563" }}>
                Balance Due
              </p>
              <p className="text-xl font-bold" style={{ color: "#dc2626" }}>
                {formatCurrency(summary.balanceDue)}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "#1e3a8a", color: "#ffffff" }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Transactions
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Notes
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Payments
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr
                  key={index}
                  className="border-b avoid-break transition-colors"
                  style={{
                    background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eff6ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      index % 2 === 0 ? "#ffffff" : "#f9fafb")
                  }
                >
                  <td
                    className="px-4 py-3 text-sm whitespace-nowrap"
                    style={{ color: "#374151" }}
                  >
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className="px-2 py-1 rounded-md text-xs font-bold"
                      style={{
                        background:
                          (t.type || t.transaction) === "Invoice"
                            ? "#dbeafe"
                            : (t.type || t.transaction) === "Payment Received"
                              ? "#dcfce7"
                              : "#f3f4f6",
                        color:
                          (t.type || t.transaction) === "Invoice"
                            ? "#1d4ed8"
                            : (t.type || t.transaction) === "Payment Received"
                              ? "#15803d"
                              : "#374151",
                      }}
                    >
                      {t.type || t.transaction}
                    </span>
                  </td>

                  <td
                    className="px-4 py-3 text-sm max-w-md"
                    style={{ color: "#4b5563" }}
                  >
                    {t.notes}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right font-semibold"
                    style={{ color: "#111827" }}
                  >
                    {t.amount > 0 ? formatCurrency(t.amount) : "-"}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right font-semibold"
                    style={{ color: "#16a34a" }}
                  >
                    {t.payment > 0 ? formatCurrency(t.payment) : "-"}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right font-bold"
                    style={{
                      color:
                        t.balance < 0
                          ? "#ea580c"
                          : t.balance === 0
                            ? "#4b5563"
                            : "#dc2626",
                    }}
                  >
                    {formatCurrency(t.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="p-5"
          style={{
            background: "linear-gradient(to right, #1e3a8a, #1e40af)",
            color: "#ffffff",
          }}
        >
          <div className="flex justify-between items-center">
            <div></div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1">Balance Due</p>
              <p className="text-3xl font-bold">
                {formatCurrency(summary.balanceDue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
