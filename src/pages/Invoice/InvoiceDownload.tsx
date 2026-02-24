import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { numberToWords } from "../../utils/helper";

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

type BankDetails = {
  account_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  branch: string;
};

export default function InvoiceDownload({
  invoiceId,
  onDone,
}: {
  invoiceId: string;
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
    invoiceNo: "",
    orderNo: "",
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
        total: 0,
        taxableAmount: 0,
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
    if (!invoiceId) return;

    const fetchInvoice = async () => {
      try {
        const res = await api.get(`${endPointApi.getByIdInvoice}/${invoiceId}`);
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
          invoiceNo: data.invoiceNo || "",
          orderNo: data.orderNo || "",
          date: data.date ? new Date(data.date) : null,
          state: data.state || "",
          subTotal: data.subTotal || 0,
          totalTax: data.totalTax || 0,
          grandTotal: data.grandTotal || 0,
          items: data.items || [],
        });
      } catch (error) {
        toast.error("Failed to load invoice");
        console.error(error);
      }
      setReady(true);
    };

    fetchInvoice();
  }, [invoiceId]);

  // const handleDownloadPDF = () => {
  //   const element: any = document.getElementById("invoice-pdf");

  //   const options: any = {
  //     margin: 10,
  //     filename: `Invoice-${invoiceId}.pdf`,
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: {
  //       scale: 2,
  //       useCORS: true,
  //     },
  //     jsPDF: {
  //       unit: "mm",
  //       format: "a4",
  //       orientation: "portrait",
  //     },
  //   };

  //   html2pdf()
  //     .set(options)
  //     .from(element)
  //     .save()
  //     .then(() => onDone());
  // };

  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-pdf");
    if (!element) return;

    const options = {
      margin: 10,
      filename: `Invoice-${invoiceId}.pdf`,
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
      <div id="invoice-pdf" className="max-w-4xl mx-auto bg-white p-8">
        {/* Header */}
        <div className="grid grid-cols-2">
          <div>
            <h1 className="text-xl font-bold mb-2">{company?.company_name}</h1>
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
          <div className="flex justify-end">
            <img
              src="/images/logo/Icon1.png"
              alt="Logo"
              className="h-40 w-40"
            />
          </div>
        </div>

        <div className="border-t border-black my-4" />

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold w-40">Invoice Date:</span>
              <span>
                {formData.date ? formData.date.toLocaleDateString("en-GB") : ""}
              </span>
            </div>
            <div className="flex">
              <span className="font-semibold w-40">Place of Supply:</span>
              <span>{formData.state}</span>
            </div>
            <div className="mt-4 flex">
              <span className="font-semibold w-40">Invoice#</span>
              <span className="text-lg font-bold">{formData.invoiceNo}</span>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-bold mb-2">Buyer Details</h3>
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">{formData.customer.name}</span>
              <br />
              {formData.customer.address}
              <br />
              {formData.customer.city}, {formData.customer.state} -{" "}
              {formData.customer.pincode}
              <br />
              +91 {formData.customer.mobile}
            </p>
            <p className="text-sm font-semibold mt-2">
              GSTN: {formData.customer.gst_number}
            </p>
          </div>
        </div>

        <div className="border-t border-black" />

        {/* Items */}
        <table className="w-full border-collapse mt-2">
          <thead>
            <tr className="border-b border-black">
              <th className="p-2 text-left text-sm">Sr.</th>
              <th className="p-2 text-left text-sm">Items & Description</th>
              <th className="p-2 text-left text-sm">HSN</th>
              <th className="p-2 text-left text-sm">Qty</th>
              <th className="p-2 text-left text-sm">Rate</th>
              <th className="p-2 text-left text-sm">Tax</th>
              {formData.state === "Gujarat" ? (
                <>
                  <th className="p-2 text-left text-sm">CGST</th>
                  <th className="p-2 text-left text-sm">SGST</th>
                </>
              ) : (
                <th className="p-2 text-left text-sm">IGST</th>
              )}
              <th className="p-2 text-left text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 text-sm">{index + 1}</td>
                <td className="p-2 text-sm">{item.description ? `${item.item?.name} - ${item.description}` : `${item.item?.name}`}</td>
                <td className="p-2 text-sm">{item.item?.hsn}</td>
                <td className="p-2 text-sm">{item.qty}</td>
                <td className="p-2 text-sm">{item.rate}</td>
                <td className="p-2 text-sm">{item.taxRate}%</td>
                {formData.state === "Gujarat" ? (
                  <>
                    <td className="p-2 text-sm">{item.cgst}</td>
                    <td className="p-2 text-sm">{item.sgst}</td>
                  </>
                ) : (
                  <td className="p-2 text-sm">{item.igst}</td>
                )}
                <td className="p-2 text-sm">{item.taxableAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-8 mt-6">
          {/* Bank Details */}
          <div className="mt-16">
            <h3 className="font-bold mb-2">Bank Details</h3>
            <p className="text-sm">Name: {company?.company_name}</p>
            <p className="text-sm">
              Account No: {company?.bank_details?.account_number}
            </p>
            <p className="text-sm">Bank: {company?.bank_details?.bank_name}</p>
            <p className="text-sm">ISFC: {company?.bank_details?.ifsc_code}</p>
            <p className="text-sm">Branch: {company?.bank_details?.branch}</p>
          </div>

          <div>
            <div className="flex justify-between p-2 border-b">
              <span>Sub Total</span>
              <span>₹ {formData.subTotal}.00</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span>Total Tax</span>
              <span>₹ {formData.totalTax}.00</span>
            </div>
            <div className="flex justify-between p-2 border-b-2 border-black">
              <span className="font-bold">Grand Total</span>
              <span className="font-bold">₹ {formData.grandTotal}.00</span>
            </div>
            <div className="p-2">
              <p className="text-sm font-semibold">Total In Words:</p>
              <p className="text-sm">{numberToWords(formData.grandTotal)}</p>
            </div>
          </div>
        </div>
        {/* Signature */}
        <div className="text-right mt-12">
          <p className="font-bold">For, {company?.company_name}</p>
          <div className="mt-16"></div>
        </div>
      </div>
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
