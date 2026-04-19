import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { numberToWords } from "../../utils/helper";

type BankDetails = {
  account_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  branch: string;
};

type Company = {
  company_name: string;
  address: string;
  city: string;
  state: string;
  phone_number: string;
  company_logo: string;
  pincode: string;
  gst_number: string;
  bank_details?: BankDetails;
};

export default function EstimateDownload({
  estimateId,
  onDone,
}: {
  estimateId: string;
  onDone: () => void;
}) {
  const hasDownloaded = useRef(false);
  const [formData, setFormData] = useState({
    customer: {
      id: "",
      name: "",
      mobile: "",
      email: "",
      gst_number: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    estimateNumber: "",
    date: null as Date | null,
    state: "",
    subTotal: 0,
    totalTax: 0,
    grandTotal: 0,
    items: [
      {
        item: { name: "", unit: "", hsn: "", id: "" },
        description: "",
        qty: 0,
        rate: 0,
        taxRate: 0,
        igst: 0,
        sgst: 0,
        cgst: 0,
        taxableAmount: 0,
        total: 0,
      },
    ],
  });

  const [company, setCompany] = useState<Company | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(endPointApi.getAllCompany);

        if (res.data.success && res.data.data.length > 0) {
          const raw = res.data.data[0];

          const parsedCompany: Company = {
            ...raw,
            bank_details:
              typeof raw.bank_details === "string"
                ? JSON.parse(raw.bank_details)
                : raw.bank_details,
          };

          setCompany(parsedCompany);
        }
      } catch (error) {
        console.error("Failed to fetch company:", error);
      }
    };

    fetchCompany();
  }, []);

  useEffect(() => {
    if (!estimateId) return;

    const fetchEstimate = async () => {
      const res = await api.get(`${endPointApi.getByIdEstimate}/${estimateId}`);
      const data = res.data.data;

      setFormData({
        customer: {
          id: data.customerId?.id || "",
          name: data.customerId?.name || "",
          mobile: data.customerId?.mobile || "",
          email: data.customerId?.email || "",
          gst_number: data.customerId?.gst_number || "",
          address: data.customerId?.address || "",
          city: data.customerId?.city || "",
          state: data.customerId?.state || "",
          country: data.customerId?.country || "",
          pincode: data.customerId?.pincode || "",
        },
        estimateNumber: data.estimateNumber || "",
        date: data.date ? new Date(data.date) : null,
        state: data.state || "",
        subTotal: data.subTotal || 0,
        totalTax: data.totalTax || 0,
        grandTotal: data.grandTotal || 0,
        items: data.items || [],
      });

      setReady(true); // mark estimate loaded
    };

    fetchEstimate();
  }, [estimateId]);

  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-content");
    if (!element) return;

    const options = {
      margin: 10,
      filename: `Estimate-${estimateId}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => onDone());
  };

  useEffect(() => {
    if (!ready || !company) return;
    if (hasDownloaded.current) return;

    hasDownloaded.current = true;
    setTimeout(handleDownloadPDF, 300);
  }, [ready, company]);
  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Invoice Container */}
      <div
        id="invoice-content"
        className="max-w-4xl mx-auto bg-white p-8 shadow-lg print:shadow-none"
      >
        {/* Header Section */}
        <div className="">
          <div className="grid grid-cols-2">
            {/* Company Details */}
            <div>
              <h1 className="text-xl font-bold mb-2">
                {company?.company_name}
              </h1>
              <p className="text-sm leading-relaxed">
                {company?.address}
                <br />
                {company?.city}, {company?.state} - {company?.pincode}
                <br />
              </p>
              <p className="text-sm mt-1">Phone: {company?.phone_number}</p>
              <p className="text-sm font-semibold mt-1">
                GSTN: {company?.gst_number}
              </p>
            </div>

            {/* Invoice Type */}
            <div className="flex items-center justify-end">
              <img src="/images/logo/Icon1.png" alt="Logo" className="h-40 w-40" />
            </div>
          </div>

          {/* Horizontal Line after first part */}
          <div className="border-t-1 border-black mb-4"></div>

          {/* Estimate Details and Buyer Details */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Left Column - Estimate Details */}
            <div className="space-y-2">
              <div className="flex">
                <span className="font-semibold w-40">Estimate Date:</span>
                <span>
                  {formData.date
                    ? new Date(formData.date).toLocaleDateString('en-GB')
                    : ""}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-40">Place of Supply:</span>
                <span>{formData?.state}</span>
              </div>
              <div className="mt-4">
                <div className="flex">
                  <span className="font-semibold w-40">Estimate#</span>
                  <span className="text-lg font-bold">
                    {formData?.estimateNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Buyer Details */}
            <div className="text-right">
              <h3 className="font-bold mb-2">Buyer Details</h3>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">
                  {formData.customer?.name || ""}
                </span>
                <br />
                {formData.customer?.address || ""}
                <br />
                {formData.customer?.city || ""},{" "}
                {formData.customer?.state || ""} - {formData.customer?.pincode}
                <br />
                +91 {formData.customer?.mobile || ""}
              </p>
              <p className="text-sm font-semibold mt-2">
                GSTN: {formData.customer?.gst_number || ""}
              </p>
            </div>
          </div>

          {/* Horizontal Line after second part */}
          <div className="border-t-1 border-black"></div>
        </div>

        {/* Items Table */}
        <div className="mb-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-1 border-black">
                <th className="text-left p-2 text-sm font-bold">Sr.</th>
                <th className="text-left p-2 text-sm font-bold">
                  Items & Description
                </th>
                <th className="text-left p-2 text-sm font-bold">HSN/SAC</th>
                <th className="text-left p-2 text-sm font-bold">Quantity</th>
                <th className="text-left p-2 text-sm font-bold">Rate</th>
                <th className="text-left p-2 text-sm font-bold">Tax</th>
                {formData.state === "Gujarat" ? (
                  <>
                    <th className="text-left p-2 text-sm font-bold">
                      CGST (₹)
                    </th>
                    <th className="text-left p-2 text-sm font-bold">
                      SGST (₹)
                    </th>
                  </>
                ) : (
                  <th className="text-left p-2 text-sm font-bold">IGST (₹)</th>
                )}
                <th className="text-left p-2 text-sm font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {formData?.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="p-2 text-sm align-top">{index + 1}</td>
                  <td className="p-2 text-sm align-top whitespace-pre-line">
                    {item.description ? `${item.item?.name} - ${item.description}` : `${item.item?.name}`}
                  </td>
                  <td className="p-2 text-sm align-top">{item.item?.hsn}</td>
                  <td className="p-2 text-sm align-top">{item.qty}</td>
                  <td className="p-2 text-sm align-top">{item.rate}</td>
                  <td className="p-2 text-sm align-top">{item.taxRate}</td>
                  {formData.state === "Gujarat" ? (
                    <>
                      <td className="p-2 text-sm align-top">{item.cgst}</td>
                      <td className="p-2 text-sm align-top">{item.sgst}</td>
                    </>
                  ) : (
                    <td className="p-2 text-sm align-top">{item.igst}</td>
                  )}
                  <td className="p-2 text-sm align-top">
                    {item.taxableAmount}.00
                  </td>
                </tr>
              ))}
              {/* Empty rows for spacing */}
              <tr style={{ height: "40px" }}>
                <td colSpan={8}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div className="grid grid-cols-2 gap-8 mb-4">
          {/* Bank Details */}
          <div className="mt-45">
            <h3 className="font-bold mb-2">Bank Details</h3>
            <p className="text-sm">Name: {company?.company_name}</p>
            <p className="text-sm">
              Account No: {company?.bank_details?.account_number}
            </p>
            <p className="text-sm">Bank: {company?.bank_details?.bank_name}</p>
            <p className="text-sm">ISFC: {company?.bank_details?.ifsc_code}</p>
            <p className="text-sm">Branch: {company?.bank_details?.branch}</p>
          </div>

          {/* Amount Details */}
          <div>
            <div className="flex justify-between p-2 border-b border-gray-400">
              <span className="font-semibold">Sub Total</span>
              <span>₹ {Math.floor(formData?.subTotal)}.00</span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-400">
              <span className="font-semibold">IGST @ 18%</span>
              <span>₹ {Math.floor(formData?.totalTax)}.00</span>
            </div>
            <div className="flex justify-between p-2 border-b-2 border-black">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg">
                ₹ {Math.floor(formData?.grandTotal)}.00
              </span>
            </div>
            <div className="p-2">
              <p className="text-sm font-semibold">Total In Words:</p>
              <p className="text-sm"> {numberToWords(Math.floor(formData?.grandTotal))}</p>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="text-right mt-12">
          <p className="font-bold">For, {company?.company_name}</p>
          <div className="mt-16"></div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
          html, body {
            width: 210mm;
            height: 297mm;
          }
          #invoice-content {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
