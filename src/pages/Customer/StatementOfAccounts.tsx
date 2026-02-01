// import React, { useEffect, useRef, useState } from "react";
// import { Phone, MapPin, Mail, Download } from "lucide-react";
// import endPointApi from "../../utils/endPointApi";
// import { api } from "../../utils/axiosInstance";
// import { useParams } from "react-router";

// interface Company {
//   company_name: string;
//   company_logo: string;
//   gst_number: string;
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
//   website: string;
//   phone_number: string;
//   email: string;
// }

// interface Customer {
//   name: string;
//   mobile: string;
//   email: string;
//   gst_number: string;
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
// }

// interface Transaction {
//   date: string;
//   type?: string;
//   transaction?: string; // Supporting both keys from your API
//   notes: string;
//   amount: number;
//   payment: number;
//   balance: number;
// }

// interface StatementData {
//   company: Company;
//   customer: Customer;
//   summary: {
//     openingBalance: number;
//     invoicedAmount: number;
//     amountPaid: number;
//     balanceDue: number;
//   };
//   transactions: Transaction[];
// }

// export default function StatementOfAccounts() {
//   const { id } = useParams<{ id: string }>();
//   const statementRef = useRef<HTMLDivElement>(null);
//   const [statementData, setStatementData] = useState<StatementData | null>(
//     null,
//   );
//     const [loading, setLoading] = useState<boolean>(true);

//   const getStatement = async (): Promise<void> => {
//     try {
//       const res = await api.get(
//         `${endPointApi.customerStatement}/${id}/statement`,
//       );
//       if (res.status === 200) {
//         setStatementData(res.data);
//       }
//     } catch (error) {
//       console.error("Error fetching statement:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) getStatement();
//   }, [id]);

//   const formatCurrency = (val: number): string => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(val || 0);
//   };

//   const formatDate = (dateString: string): string => {
//     return new Date(dateString).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   if (loading)
//     return <div className="p-10 text-center">Loading Statement...</div>;
//   if (!statementData)
//     return <div className="p-10 text-center">No statement data found.</div>;

//   const { company, customer, summary, transactions } = statementData;
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div ref={statementRef} className="max-w-7xl mx-auto bg-white shadow-lg">
//         {/* Header */}
//         <div className="border-b-4 border-blue-600 bg-gradient-to-r from-blue-50 to-white p-8">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold text-blue-900 mb-2">
//                 {company.company_name}
//               </h1>
//               <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
//                 <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
//                 <p className="max-w-[300px] leading-relaxed">
//                   {company.address},<br /> {company.city}, {company.state} -{" "}
//                   {company.pincode}
//                 </p>
//               </div>
//               <p className="text-sm text-gray-600">
//                 GST No - {company.gst_number}
//               </p>
//             </div>
//             <div className="text-right">
//               {/* <div className="flex items-center justify-end gap-2 mb-2">
//                 <FileText className="w-6 h-6 text-blue-600" />
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   Statement of Accounts
//                 </h2>
//               </div>
//               <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
//                 <Calendar className="w-4 h-4" />
//                 <p>{period}</p>
//               </div> */}
//               <div className="flex justify-end gap-3 mb-4">
//                 <button
//                   title="Download Statement"
//                   className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-blue-100"

//                               >
//                   <Download className="w-5 h-5" />
//                 </button>
//                 <button
//                   title="Send Email"
//                   className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors border border-green-100"
//                   onClick={() =>
//                     (window.location.href = `mailto:${customer.email}`)
//                   }
//                 >
//                   <Mail className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Customer Info */}
//         <div className="p-8 border-b bg-gray-50">
//           <p className="text-sm font-semibold text-gray-700 mb-2">To,</p>
//           <h3 className="text-lg font-bold text-gray-900 mb-1">
//             {customer.name}
//           </h3>
//           <p className="text-sm text-gray-600 mb-1">
//             {customer.address}
//             <br />
//             {customer.city}, {customer.state} - {customer.pincode}
//           </p>
//           <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
//             <Phone className="w-4 h-4" />
//             <p>{customer.mobile}</p>
//           </div>
//           <p className="text-sm text-gray-600">GSTN: {customer.gst_number}</p>
//         </div>

//         {/* Account Summary */}
//         <div className="p-5 bg-blue-50 border-b">
//           <h3 className="text-lg font-bold text-gray-900 mb-4">
//             Account Summary
//           </h3>
//           <div className="grid grid-cols-4 gap-6">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Opening Balance</p>
//               <p className="text-xl font-bold text-gray-900">
//                 {formatCurrency(summary.openingBalance)}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Invoiced Amount</p>
//               <p className="text-xl font-bold text-blue-600">
//                 {formatCurrency(summary.invoicedAmount)}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
//               <p className="text-xl font-bold text-green-600">
//                 {formatCurrency(summary.amountPaid)}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Balance Due</p>
//               <p className="text-xl font-bold text-red-600">
//                 {formatCurrency(summary.balanceDue)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Transactions Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-blue-900 text-white">
//               <tr>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">
//                   Date
//                 </th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">
//                   Transactions
//                 </th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">
//                   Notes
//                 </th>
//                 <th className="px-4 py-3 text-right text-sm font-semibold">
//                   Amount
//                 </th>
//                 <th className="px-4 py-3 text-right text-sm font-semibold">
//                   Payments
//                 </th>
//                 <th className="px-4 py-3 text-right text-sm font-semibold">
//                   Balance
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.map((t, index) => (
//                 <tr
//                   key={index}
//                   className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
//                 >
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {formatDate(t.date)}
//                   </td>
//                   <td className="px-4 py-3 text-sm">
//                     <span
//                       className={`px-2 py-1 rounded-md text-xs font-bold ${
//                         (t.type || t.transaction) === "Invoice"
//                           ? "bg-blue-100 text-blue-700"
//                           : "bg-green-100 text-green-700"
//                       }`}
//                     >
//                       {t.type || t.transaction}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-600 whitespace-pre-line max-w-md">
//                     {t.notes}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
//                     {t.amount > 0 ? formatCurrency(t.amount) : "-"}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
//                     {t.payment > 0 ? formatCurrency(t.payment) : "-"}
//                   </td>
//                   <td className={`px-4 py-3 text-sm text-right font-bold`}>
//                     {formatCurrency(t.balance)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div className="p-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
//           <div className="flex justify-between items-center">
//             <div>
//               {/* <p className="text-sm opacity-90">
//                 Statement Period: {period}
//               </p> */}
//             </div>
//             <div className="text-right">
//               <p className="text-sm opacity-90 mb-1">Balance Due</p>
//               <p className="text-2xl font-bold">
//                 {formatCurrency(summary.balanceDue)}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Phone, MapPin, Mail, Download, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import DateRangeFilter from "../../components/form/DateRangeFilter";

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
              <p className="text-sm" style={{ color: "#4b5563" }}>
                GST No - {company.gst_number}
              </p>
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
        <div
          className="p-8 border-b avoid-break"
          style={{ background: "#f9fafb" }}
        >
          <p
            className="text-sm font-semibold mb-2"
            style={{ color: "#374151" }}
          >
            To,
          </p>
          <h3 className="text-lg font-bold mb-1" style={{ color: "#111827" }}>
            {customer.name}
          </h3>
          <p className="text-sm mb-1" style={{ color: "#4b5563" }}>
            {customer.address}
            <br />
            {customer.city}, {customer.state} - {customer.pincode}
          </p>
          <div
            className="flex items-center gap-2 text-sm mb-1"
            style={{ color: "#4b5563" }}
          >
            <Phone className="w-4 h-4" />
            <p>{customer.mobile}</p>
          </div>
          {customer.email && (
            <div
              className="flex items-center gap-2 text-sm mb-1"
              style={{ color: "#4b5563" }}
            >
              <Mail className="w-4 h-4" />
              <p>{customer.email}</p>
            </div>
          )}
          <p className="text-sm" style={{ color: "#4b5563" }}>
            GSTN: {customer.gst_number}
          </p>
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
