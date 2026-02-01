import { useEffect, useState } from "react";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { MoveLeft } from "lucide-react";
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

export default function EstimateView() {
  const navigate = useNavigate();
  const { id } = useParams();

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
        total: 0,
        taxableAmount: 0,
      },
    ],
  });

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
 
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
    if (!id) return;

    const fetchEstimate = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${endPointApi.getByIdEstimate}/${id}`);
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
          // date: data.date ? data.date.split("T")[0] : "",
          date: data.date ? new Date(data.date) : null,
          state: data.state || "",
          subTotal: data.subTotal || 0,
          totalTax: data.totalTax || 0,
          grandTotal: data.grandTotal || 0,
          items: data.items || [],
        });
      } catch (error) {
        toast.error("Failed to load estimate");
        console.error(error);
      }finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [id]);

    if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Fetching Invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => navigate("/estimate")} // goes back to previous page
          className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
        >
          <span className="mr-2">
            <MoveLeft />
          </span>{" "}
          Back to Estimates
        </button>
      </div>
      <div id="estimate-pdf" className="max-w-4xl mx-auto bg-white p-8">
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
            <div className="flex justify-end">
              <img src="/images/logo/Icon1.png" alt="Logo" className="h-60 w-60" />
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
                {/* <th className="text-left p-2 text-sm font-bold">IGST (₹)</th> */}
                {/* {formData.state === "Gujarat" && (
                  <>
                    <th className="text-left p-2 text-sm font-bold">
                      CGST (₹)
                    </th>
                    <th className="text-left p-2 text-sm font-bold">
                      SGST (₹)
                    </th>
                  </>
                )} */}
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
                    {/* {item.item?.name} */}
                    {item.description ? `${item.description}` : ""}
                  </td>
                  <td className="p-2 text-sm align-top">{item.item?.hsn}</td>
                  <td className="p-2 text-sm align-top">{item.qty}</td>
                  <td className="p-2 text-sm align-top">{item.rate}</td>
                  <td className="p-2 text-sm align-top">{item.taxRate}.00 %</td>
                  {/* <td className="p-2 text-sm align-top">{item.igst}</td> */}

                  {formData.state === "Gujarat" ? (
                    <>
                      <td className="p-2 text-sm">{item.cgst}</td>
                      <td className="p-2 text-sm">{item.sgst}</td>
                    </>
                  ) : (
                    <td className="p-2 text-sm">{item.igst}</td>
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
          <div className="mt-16">
            <h3 className="font-bold mb-2">Bank Details</h3>
            <p className="text-sm">Name: {company?.company_name}</p>
            <p className="text-sm">Account No: {company?.bank_details?.account_number}</p>
            <p className="text-sm">Bank: {company?.bank_details?.bank_name}</p>
            <p className="text-sm">ISFC: {company?.bank_details?.ifsc_code}</p>
            <p className="text-sm">Branch: {company?.bank_details?.branch}</p>
          </div>

          {/* Amount Details */}
          <div>
            <div className="flex justify-between p-2 border-b border-gray-400">
              <span className="font-semibold">Sub Total</span>
              <span>₹ {formData?.subTotal}.00</span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-400">
              <span className="font-semibold">IGST @ 18%</span>
              <span>₹ {formData?.totalTax}.00</span>
            </div>
            <div className="flex justify-between p-2 border-b-2 border-black">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg">
                ₹ {formData?.grandTotal}.00
              </span>
            </div>
            <div className="p-2">
              <p className="text-sm font-semibold">Total In Words:</p>
              <p className="text-sm"> {numberToWords(formData?.grandTotal)}</p>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="text-right mt-12">
          <p className="font-bold">For, {company?.company_name}</p>
          <div className="mt-16"></div>
        </div>
      </div>
    </>
  );
}
