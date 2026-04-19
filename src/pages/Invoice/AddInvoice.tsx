// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useEffect, useState } from "react";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ComponentCard from "../../components/common/ComponentCard";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import { generateInvoiceNumber } from "../../utils/helper";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import { Trash2, ArrowLeft, Plus, Save, X, FileText, Info, Calculator, ShoppingBag } from "lucide-react";
import AddCustomerModal from "../../components/common/AddCustomerModal";
import Loader from "../../components/common/Loader";
import AddInventoryModal from "../../components/common/Addinventorymodal";
import { useForm } from "../Context/FormContext";

type CustomChangeEvent = {
  target: {
    name: string;
    value: string;
  };
};

const AddInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isFormEnabled } = useForm();
  const isEnabledFromSettings = isFormEnabled("invoice");
  const isFieldDisabled = id ? !isEnabledFromSettings : false;

  const [formData, setFormData] = useState({
    customerId: "",
    invoiceNumber: "",
    orderNumber: "",
    date: new Date(),
    state: "",
    items: [
      {
        item: "",
        description: "",
        qty: "",
        rate: "",
        taxRate: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const preFilledData = location.state;

  /* -------------------- HANDLERS -------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleItemChange = (index: number, e: CustomChangeEvent) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedItems = [...prev.items];

      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };

      if (name === "item") {
        const selectedItem = inventoryData.find((inv) => inv.id === value);
        if (selectedItem) {
          updatedItems[index].taxRate = String(selectedItem.tax);
        }
      }

      return {
        ...prev,
        items: updatedItems,
      };
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      const errorKey = `${name}_${index}`;
      if (newErrors[errorKey]) {
        delete newErrors[errorKey];
      }
      if (name === "item") {
        delete newErrors[`taxRate_${index}`];
      }
      return newErrors;
    });
  };

  const fetchEstimateDetails = async (orderNo) => {
    if (!orderNo) return;

    try {
      const res = await api.get(`${endPointApi.estimateByNumber}/${orderNo}`);
      const estimate = res.data.data;

      if (!estimate) {
        toast.error("No estimate found");
        setFormData((prev) => ({ ...prev, orderNumber: "" }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        orderNumber: orderNo,
        customerId: estimate.customerId?.id || prev.customerId,
        state: estimate.customerId?.state || prev.state,
        date: estimate.date ? new Date(estimate.date) : prev.date,
        items:
          estimate.items?.map((i) => ({
            item: i.item?.id || "",
            description: i.description || "",
            qty: i.qty || 0,
            rate: i.rate || 0,
            taxRate: String(i.taxRate) || "0",
          })) || prev.items,
      }));

      setErrors({});
    } catch (error) {
      console.error("Error fetching estimate:", error);
      toast.error("Error loading estimate data");
    }
  };

  const handleOrderNumberEnter = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const orderNumber = formData.orderNumber.trim();
    fetchEstimateDetails(orderNumber);
  };

  useEffect(() => {
    if (preFilledData?.estimateNumber) {
      fetchEstimateDetails(preFilledData.estimateNumber);
    }
  }, [preFilledData]);

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item: "", description: "", qty: "", rate: "", taxRate: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  /* -------------------- VALIDATION -------------------- */

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderNumber) {
      newErrors.orderNumber = "Order number is required";
    }
    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = "Invoice number is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    formData.items.forEach((item, index) => {
      if (!item.item) {
        newErrors[`item_${index}`] = "Required";
      }
      if (!item.qty || item.qty <= 0) {
        newErrors[`qty_${index}`] = "Required";
      }
      if (!item.rate || item.rate <= 0) {
        newErrors[`rate_${index}`] = "Required";
      }
      if (item.taxRate === "" || item.taxRate === undefined) {
        newErrors[`taxRate_${index}`] = "Required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        customerId: formData.customerId,
        invoiceNo: formData.invoiceNumber,
        orderNo: formData.orderNumber,
        date: formData.date,
        state: formData.state,
        items: formData.items.map((item) => {
          return {
            description: item.description,
            item: item.item,
            qty: Number(item.qty),
            rate: Number(item.rate),
            taxRate: Number(item.taxRate),
          };
        }),
      };

      const method = id ? "put" : "post";
      const url = id
        ? `${endPointApi.updateInvoice}/${id}`
        : `${endPointApi.createInvoice}`;

      const res = await api[method](url, payload);

      if (res.data) {
        toast.success(
          id ? "Invoice updated successfully" : "Invoice added successfully",
        );
        navigate("/invoice");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLastInvoiceNumber = async () => {
      try {
        const res = await api.get(`${endPointApi.getLastInvoiceNumber}`);
        const lastNumber = res.data.lastInvoiceNumber || "INV-000";
        const newNumber = generateInvoiceNumber(lastNumber);

        setFormData((prev) => ({
          ...prev,
          invoiceNumber: newNumber,
        }));
      } catch (err) {
        console.error("Failed to fetch last invoice number", err);
      }
    };
    if (!id) fetchLastInvoiceNumber();
  }, [id]);

  const getInventory = async () => {
    try {
      const res = await api.get(`${endPointApi.getAllInventory}`);
      if (res.data?.success) {
        setInventoryData(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getInventory();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`${endPointApi.getAllCustomer}`);
      setCustomers(res.data.data || []);
    } catch {
      toast.error("Failed to load customers");
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      try {
        const res = await api.get(`${endPointApi.getByIdInvoice}/${id}`);
        const data = res.data.data;

        setFormData({
          customerId: data.customerId?.id || "",
          invoiceNumber: data.invoiceNo || "",
          orderNumber: data.orderNo || "",
          date: data.date ? new Date(data.date) : null,
          state: data.state || "",
          items: data.items?.length
            ? data.items.map((item) => ({
                item: item.item?.id || "",
                name: item.item?.name || "",
                description: item.description || "",
                qty: item.qty || 0,
                rate: item.rate || 0,
                taxRate: String(item.taxRate) || "0",
              }))
            : [
                {
                  name: "",
                  item: "",
                  description: "",
                  qty: "",
                  rate: "",
                  taxRate: "",
                },
              ],
        });
      } catch (error) {
        toast.error("Failed to load invoice ❌");
        console.error(error);
      }
    };

    fetchInvoice();
  }, [id]);

  const hasRowError = (index: number) => {
    return Object.keys(errors).some((key) => key.endsWith(`_${index}`));
  };

  const subtotal = formData.items.reduce((sum, item) => {
    const rowTotal = Number(item.qty || 0) * Number(item.rate || 0);
    return sum + rowTotal;
  }, 0);

  const taxSummary = {
    sgst2_5: 0,
    cgst2_5: 0,
    sgst9: 0,
    cgst9: 0,
    igst5: 0,
    igst18: 0,
  };

  formData.items.forEach((item) => {
    const rowTotal = Number(item.qty || 0) * Number(item.rate || 0);
    const tax = Number(item.taxRate || 0);

    if (formData.state === "Gujarat") {
      if (tax === 5) {
        taxSummary.sgst2_5 += rowTotal * 0.025;
        taxSummary.cgst2_5 += rowTotal * 0.025;
      }
      if (tax === 18) {
        taxSummary.sgst9 += rowTotal * 0.09;
        taxSummary.cgst9 += rowTotal * 0.09;
      }
    } else {
      if (tax === 5) taxSummary.igst5 += rowTotal * 0.05;
      if (tax === 18) taxSummary.igst18 += rowTotal * 0.18;
    }
  });

  const grandTotal =
    subtotal +
    taxSummary.sgst2_5 +
    taxSummary.cgst2_5 +
    taxSummary.sgst9 +
    taxSummary.cgst9 +
    taxSummary.igst5 +
    taxSummary.igst18;

  const customerOptions = customers.map((cust) => ({
    value: cust.id,
    label: cust.name,
  }));

  const inventoryOptions = inventoryData.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 dark:bg-[#0f172a]">
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/invoice")}
              className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">
                {id ? "Edit Invoice" : "Add New Invoice"}
              </h1>
              <p className="text-sm text-gray-500">
                {id ? "Modify existing invoice details" : "Create and manage professional invoices for your customers"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1: Basic Details */}
          <ComponentCard title="">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-gray-100">Basic Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
              <div>
                <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5">Order Number</Label>
                <div className="relative group">
                  <Input
                    disabled={isFieldDisabled}
                    name="orderNumber"
                    className={`${errors.orderNumber ? "border-red-500 focus:ring-red-200" : "focus:border-blue-400 focus:ring-blue-100 dark:border-[#2a3550]"} rounded-xl p-2.5 transition-all text-sm pr-10`}
                    value={formData.orderNumber}
                    onChange={handleChange}
                    onKeyDown={handleOrderNumberEnter}
                    placeholder="EST-001"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors cursor-help" title="Press Enter to auto-fill">
                    <Info className="h-4 w-4" />
                  </div>
                </div>
                {errors.orderNumber && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.orderNumber}</p>}
              </div>

              <div className="lg:col-span-1">
                <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">Customer</Label>
                <Select
                  disabled={isFieldDisabled}
                  options={customerOptions}
                  value={formData.customerId}
                  placeholder="Select Customer"
                  className={`${errors.customerId ? "border-red-500 focus:ring-red-200" : "focus:border-blue-400 focus:ring-blue-100 dark:border-[#2a3550]"} rounded-xl transition-all h-[42px]`}
                  showAddButton={true}
                  onAddNew={() => setIsCustomerModalOpen(true)}
                  addButtonText="Add New"
                  onChange={(value) => {
                    const selectedCustomer = customers.find((c) => c.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      customerId: value,
                      state: selectedCustomer?.state || "",
                    }));
                    setErrors((prev) => ({ ...prev, customerId: "", state: "" }));
                  }}
                />
                {errors.customerId && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.customerId}</p>}
              </div>

              <div>
                <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">State</Label>
                <Input
                  name="state"
                  className="rounded-xl p-2.5 bg-gray-50 text-gray-500 border-gray-100 cursor-not-allowed text-sm"
                  value={formData.state || "Auto-filled"}
                  readOnly
                />
                {errors.state && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.state}</p>}
              </div>

              <div>
                <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">Invoice Date</Label>
                <DatePicker
                  disabled={isFieldDisabled}
                  id="invoice-date"
                  placeholder="Today"
                  className={`${errors.date ? "border-red-500" : ""} rounded-xl transition-all dark:border-[#2a3550]`}
                  defaultDate={formData.date ?? undefined}
                  onChange={(selectedDates) => {
                    setFormData((prev) => ({
                      ...prev,
                      date: selectedDates[0],
                    }));
                    setErrors((prev) => ({ ...prev, date: "" }));
                  }}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.date}</p>}
              </div>

              <div>
                <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">Invoice Number</Label>
                <Input
                  name="invoiceNumber"
                  className="rounded-xl p-2.5 bg-gray-50 text-gray-500 border-gray-100 cursor-not-allowed font-medium text-sm"
                  value={formData.invoiceNumber}
                  readOnly
                />
              </div>
            </div>

            <AddCustomerModal
              isOpen={isCustomerModalOpen}
              onClose={() => setIsCustomerModalOpen(false)}
              onSuccess={fetchCustomers}
            />
          </ComponentCard>

          {/* Section 2: Line Items */}
          <ComponentCard title="">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-gray-100">Items & Services</h3>
              </div>
              <button
                disabled={isFieldDisabled}
                onClick={addItem}
                className="flex items-center gap-1.5 dark:bg-blue-500/10 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-sm dark:text-blue-400"
              >
                <Plus className="h-4 w-4" /> Add Line Item
              </button>
            </div>

            {/* Table Header */}
            <div className="hidden grid-cols-[1.5fr_2fr_0.8fr_0.8fr_0.8fr_1fr_40px] gap-4 px-4 py-2 bg-gray-50 rounded-lg mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider lg:grid dark:bg-[#1e2535]">
              <div>Item Name</div>
              <div>Description</div>
              <div className="text-center">Qty</div>
              <div className="text-center">Rate</div>
              <div className="text-center">Tax %</div>
              <div className="text-right">Amount</div>
              <div></div>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => {
                const isRowError = hasRowError(index);
                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr_0.8fr_0.8fr_0.8fr_1fr_40px] gap-4 items-start p-4 lg:p-0 border border-gray-100 dark:border-[#2a3550] lg:border-0 rounded-2xl lg:rounded-none lg:hover:bg-gray-50/30 dark:lg:hover:bg-[#1e2535]/50 transition-all lg:rounded-lg"
                  >
                    {/* Item Select */}
                    <div className="space-y-1">
                      <Label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Item</Label>
                      <Select
                        disabled={isFieldDisabled}
                        options={inventoryOptions}
                        value={item.item}
                        placeholder="Select product"
                        className={`${errors[`item_${index}`] ? "border-red-500" : "border-gray-200 dark:border-[#2a3550]"} rounded-xl text-sm transition-all h-[40px]`}
                        showAddButton={true}
                        onAddNew={() => setIsInventoryModalOpen(true)}
                        addButtonText="Add New"
                        onChange={(value) =>
                          handleItemChange(index, { target: { name: "item", value } })
                        }
                      />
                      {isRowError && (
                        <div className="min-h-[20px]">
                          {errors[`item_${index}`] && (
                            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`item_${index}`]}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <Label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Description</Label>
                      <Input
                        disabled={isFieldDisabled}
                        name="description"
                        placeholder="Item details..."
                        className="border-gray-200 dark:border-[#2a3550] rounded-xl text-sm transition-all p-2.5 h-[40px]"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, e)}
                      />
                      {isRowError && <div className="min-h-[20px]"></div>}
                    </div>

                    {/* Qty */}
                    <div className="space-y-1 text-center">
                      <Label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Qty</Label>
                      <Input
                        disabled={isFieldDisabled}
                        type="number"
                        name="qty"
                        className={`${errors[`qty_${index}`] ? "border-red-500" : "border-gray-200 dark:border-[#2a3550]"} rounded-xl text-sm transition-all text-center h-[40px]`}
                        placeholder="0"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, e)}
                      />
                      {isRowError && (
                        <div className="min-h-[20px]">
                          {errors[`qty_${index}`] && (
                            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`qty_${index}`]}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rate */}
                    <div className="space-y-1 text-center">
                      <Label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Rate</Label>
                      <Input
                        disabled={isFieldDisabled}
                        type="number"
                        name="rate"
                        className={`${errors[`rate_${index}`] ? "border-red-500" : "border-gray-200 dark:border-[#2a3550]"} rounded-xl text-sm transition-all text-center h-[40px]`}
                        placeholder="0.00"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, e)}
                      />
                      {isRowError && (
                        <div className="min-h-[20px]">
                          {errors[`rate_${index}`] && (
                            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`rate_${index}`]}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tax */}
                    <div className="space-y-1 text-center">
                      <Label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Tax %</Label>
                      <Select
                        disabled={isFieldDisabled}
                        value={item.taxRate}
                        placeholder="Tax"
                        className={`${errors[`taxRate_${index}`] ? "border-red-500" : "border-gray-200 dark:border-[#2a3550]"} rounded-xl text-sm transition-all h-[40px]`}
                        showAddButton={true}
                        searchable={false}
                        options={[
                          { value: "0", label: "0% - Exempt" },
                          { value: "5", label: "5% - GST" },
                          { value: "18", label: "18% - GST" },
                        ]}
                        onChange={(value) =>
                          handleItemChange(index, { target: { name: "taxRate", value } })
                        }
                      />
                      {isRowError && (
                        <div className="min-h-[20px]">
                          {errors[`taxRate_${index}`] && (
                            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`taxRate_${index}`]}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Result Total */}
                    <div className="space-y-1 text-right">
                      <Label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Subtotal</Label>
                      <div className="h-[40px] flex items-center justify-end font-bold text-gray-700 dark:bg-[#1e2535]/50 dark:text-gray-300 bg-gray-50/50 rounded-xl px-3 border border-gray-100 dark:border-[#2a3550]">
                        ₹{(Number(item.qty || 0) * Number(item.rate || 0)).toLocaleString()}
                      </div>
                      {isRowError && <div className="min-h-[20px]"></div>}
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-2 lg:pt-0">
                      <button
                        disabled={isFieldDisabled || formData.items.length === 1}
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      {isRowError && <div className="min-h-[20px]"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <AddInventoryModal
              isOpen={isInventoryModalOpen}
              onClose={() => setIsInventoryModalOpen(false)}
              onSuccess={getInventory}
            />
          </ComponentCard>

          {/* Section 3: Summary & Submission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Note Area */}
            <div className="space-y-6">
              <ComponentCard title="">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-gray-50 rounded-lg">
                    <Info className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 font-outfit">Additional Notes</h3>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#1e2535] dark:border-[#2a3550] rounded-2xl border border-gray-100 italic text-sm text-gray-500">
                  Notes can be customized from the organization settings. These will be visible on the generated PDF invoice.
                </div>
              </ComponentCard>
            </div>

            {/* Calculations Area */}
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <Calculator className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 font-outfit">Order Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-600 py-1 dark:text-gray-400">
                  <span>Subtotal Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Gujarat Taxes */}
                {formData.state === "Gujarat" && (
                  <div className="space-y-2 border-y border-gray-50 py-3 my-2 dark:border-[#2a3550]">
                    {taxSummary.sgst9 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">SGST (9%)</span>
                        <span className="font-medium">₹{taxSummary.sgst9.toFixed(2)}</span>
                      </div>
                    )}
                    {taxSummary.cgst9 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">CGST (9%)</span>
                        <span className="font-medium">₹{taxSummary.cgst9.toFixed(2)}</span>
                      </div>
                    )}
                    {taxSummary.sgst2_5 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">SGST (2.5%)</span>
                        <span className="font-medium">₹{taxSummary.sgst2_5.toFixed(2)}</span>
                      </div>
                    )}
                    {taxSummary.cgst2_5 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">CGST (2.5%)</span>
                        <span className="font-medium">₹{taxSummary.cgst2_5.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Outside Gujarat Taxes */}
                {formData.state !== "Gujarat" && formData.state !== "" && (
                  <div className="space-y-2 border-y border-gray-50 py-3 my-2">
                    {taxSummary.igst18 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">IGST (18%)</span>
                        <span className="font-medium">₹{taxSummary.igst18.toFixed(2)}</span>
                      </div>
                    )}
                    {taxSummary.igst5 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">IGST (5%)</span>
                        <span className="font-medium">₹{taxSummary.igst5.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4 dark:border-[#2a3550]">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>

        {/* Global Action Footer */}
        <div className="mt-8 flex items-center justify-between p-4 dark:bg-[#1e2535] dark:border-[#2a3550] bg-white border border-gray-200 rounded-3xl shadow-lg mb-10">
          <div className="hidden md:flex items-center gap-2 pl-4 text-gray-400">
            <Info className="h-4 w-4" />
            <span className="text-sm dark:text-gray-400">Carefully review calculations before proceeding</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/invoice")}
              className="px-8 py-3.5 bg-gray-50 dark:bg-[#252d40] dark:text-gray-300 dark:hover:bg-[#2a3550] dark:border-[#2a3550] text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 flex-1 md:flex-none justify-center border border-gray-100"
            >
              <X className="h-5 w-5" /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || isFieldDisabled}
              className={`${isFieldDisabled ? "bg-gray-300 pointer-events-none shadow-none" : "primary-color hover:shadow-lg shadow-blue-50"} text-white px-10 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              {id ? "Update Invoice" : "Generate Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
