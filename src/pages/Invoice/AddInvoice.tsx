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
import { Trash2 } from "lucide-react";
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

  console.log("preFilledData", preFilledData);
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

      // update current field
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };

      // when item is selected, auto-fill tax
      if (name === "item") {
        const selectedItem = inventoryData.find((inv) => inv.id === value);

        if (selectedItem) {
          updatedItems[index].taxRate = String(selectedItem.tax); // auto set tax
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

      // Special case: if selecting an item also fills the taxRate, clear tax error too
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

  // Remove any other duplicate declaration

  // const handleOrderNumberEnter = async (e) => {
  //   if (e.key !== "Enter") return;
  //   e.preventDefault();

  //   const orderNumber = formData.orderNumber.trim();
  //   if (!orderNumber) return;

  //   const res = await api.get(`${endPointApi.estimateByNumber}/${orderNumber}`);
  //   const estimate = res.data.data;
  //   if (!estimate) {
  //     toast.error("No estimate found");

  //     // Clear the order number field if no match
  //     setFormData((prev) => ({
  //       ...prev,
  //       orderNumber: "",
  //     }));
  //     return;
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       customerId: estimate.customerId?.id || prev.customerId,
  //       state: estimate.customerId?.state || prev.state,
  //       date: estimate.date ? new Date(estimate.date) : prev.date,
  //       items:
  //         estimate.items?.map((i) => ({
  //           item: i.item?.id || "",
  //           description: i.description || "",
  //           qty: i.qty || 0,
  //           rate: i.rate || 0,
  //           taxRate: i.taxRate || 0,
  //         })) || prev.items,
  //     }));
  //   }
  // };
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
        newErrors[`item_${index}`] = "Item name required";
      }

      if (!item.qty || item.qty <= 0) {
        newErrors[`qty_${index}`] = "Quantity is required";
      }
      if (!item.rate || item.rate <= 0) {
        newErrors[`rate_${index}`] = "Rate is required";
      }
      if (!item.taxRate) {
        newErrors[`taxRate_${index}`] = "Tax is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true); // loader ON

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
            item: item.item, // still just the ID
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
      setLoading(false); // loader OFF
    }
  };

  useEffect(() => {
    // Example: last saved invoice number
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
    fetchLastInvoiceNumber();
  }, []);

  const getInventory = async () => {
    try {
      // setLoading(true);

      const res = await api.get(`${endPointApi.getAllInventory}`);

      if (res.data?.success) {
        setInventoryData(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // setLoading(false);
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

  //   getById
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
                taxRate: String(item.taxRate) || 0,
              }))
            : [
                {
                  name: "",
                  item: "",
                  description: "",
                  qty: 0,
                  rate: 0,
                  taxRate: 0,
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

  const subtotal = formData.items.reduce((sum, item) => {
    const rowTotal = Number(item.qty || 0) * Number(item.rate || 0);
    return sum + rowTotal;
  }, 0);

  // Initialize tax summary
  const taxSummary = {
    sgst2_5: 0,
    cgst2_5: 0,
    sgst9: 0,
    cgst9: 0,
    igst2_5: 0,
    igst9: 0,
  };

  formData.items.forEach((item) => {
    const rowTotal = Number(item.qty || 0) * Number(item.rate || 0);
    const tax = Number(item.taxRate || 0);

    if (formData.state === "Gujarat") {
      // SGST + CGST for Gujarat
      if (tax === 5) {
        taxSummary.sgst2_5 += rowTotal * 0.025;
        taxSummary.cgst2_5 += rowTotal * 0.025;
      }
      if (tax === 18) {
        taxSummary.sgst9 += rowTotal * 0.09;
        taxSummary.cgst9 += rowTotal * 0.09;
      }
    } else {
      // IGST for outside Gujarat
      if (tax === 5) taxSummary.igst2_5 += rowTotal * 0.05;
      if (tax === 18) taxSummary.igst9 += rowTotal * 0.18;
    }
  });

  // Grand total
  const grandTotal =
    subtotal +
    taxSummary.sgst2_5 +
    taxSummary.cgst2_5 +
    taxSummary.sgst9 +
    taxSummary.cgst9 +
    taxSummary.igst2_5 +
    taxSummary.igst9;

  const customerOptions = customers.map((cust) => ({
    value: cust.id,
    label: cust.name,
  }));

  const inventoryOptions = inventoryData.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const hasRowError = (index: number) => {
    return Object.keys(errors).some((key) => key.endsWith(`_${index}`));
  };

  return (
    <ComponentCard title={id ? "Edit Invoice" : "Add Invoice"}>
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>Order Number</Label>
          <Input
            disabled={isFieldDisabled}
            name="orderNumber"
            className={
              errors.orderNumber ? "border-red-500 focus:ring-red-200" : ""
            }
            value={formData.orderNumber}
            onChange={handleChange}
            onKeyDown={handleOrderNumberEnter}
            placeholder="Order No."
          />
          {errors.orderNumber && (
            <p className="text-red-500 text-sm">{errors.orderNumber}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Customer Name</Label>
          </div>
          <Select
            disabled={isFieldDisabled}
            options={customerOptions}
            value={formData.customerId}
            placeholder="Select Customer"
            className={
              errors.customerId ? "border-red-500 focus:ring-red-200" : ""
            }
            showAddButton={true}
            onAddNew={() => setIsCustomerModalOpen(true)}
            addButtonText="Add New Customer"
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
          <AddCustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSuccess={fetchCustomers}
          />
          {errors.customerId && (
            <p className="text-red-500 text-sm">{errors.customerId}</p>
          )}
        </div>

        <div>
          <Label>State</Label>
          <Input
            name="state"
            className={errors.state ? "border-red-500 focus:ring-red-200" : ""}
            value={formData.state}
            onChange={handleChange}
            disabled
          />
          {errors.state && (
            <p className="text-red-500 text-sm">{errors.state}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <Label>Date</Label>
          <DatePicker
            disabled={isFieldDisabled}
            id="invoice-date"
            placeholder="Select date"
            className={errors.date ? "border-red-500 focus:ring-red-200" : ""}
            defaultDate={formData.date ?? undefined}
            onChange={(selectedDates) => {
              setFormData((prev) => ({
                ...prev,
                date: selectedDates[0], // IMPORTANT
              }));
              setErrors((prev) => ({ ...prev, date: "" }));
            }}
          />
          {errors.date && <p className="text-red-500">{errors.date}</p>}
        </div>
        <div>
          <Label>Invoice Number</Label>
          <Input
            name="invoiceNumber"
            className={
              errors.invoiceNumber ? "border-red-500 focus:ring-red-200" : ""
            }
            value={formData.invoiceNumber}
            onChange={handleChange}
            placeholder="INV-901"
            disabled
          />
          {errors.invoiceNumber && (
            <p className="text-red-500">{errors.invoiceNumber}</p>
          )}
        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-6">
        {formData.items.map((item, index) => {
          const isRowError = hasRowError(index);
          return (
            <div
              key={index}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 mb-3 items-center"
            >
              {/* Item */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    disabled={isFieldDisabled}
                    options={inventoryOptions}
                    value={item.item}
                    placeholder="Select Item"
                    className={
                      errors[`item_${index}`]
                        ? "border-red-500 focus:ring-red-200"
                        : ""
                    }
                    showAddButton={true}
                    onAddNew={() => setIsInventoryModalOpen(true)}
                    addButtonText="Add New Inventory"
                    onChange={(value) =>
                      handleItemChange(index, {
                        target: { name: "item", value },
                      })
                    }
                  />
                  {isRowError && ( // 2. Spacer appears if ANY error in row exists
                    <div className="min-h-[20px]">
                      {errors[`item_${index}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`item_${index}`]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Add Inventory Modal */}
              <AddInventoryModal
                isOpen={isInventoryModalOpen}
                onClose={() => setIsInventoryModalOpen(false)}
                onSuccess={getInventory}
              />
              {/* Description */}
              <div>
                <Input
                  disabled={isFieldDisabled}
                  name="description"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                />
                {isRowError && <div className="min-h-[20px]"></div>}
              </div>

              {/* Qty */}
              <div>
                <Input
                  disabled={isFieldDisabled}
                  type="number"
                  name="qty"
                  className={
                    errors[`qty_${index}`]
                      ? "border-red-500 focus:ring-red-200"
                      : ""
                  }
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, e)}
                />
                {isRowError && (
                  <div className="min-h-[20px]">
                    {errors[`qty_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`qty_${index}`]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Rate */}
              <div>
                <Input
                  disabled={isFieldDisabled}
                  type="number"
                  name="rate"
                  className={
                    errors[`rate_${index}`]
                      ? "border-red-500 focus:ring-red-200"
                      : ""
                  }
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, e)}
                />
                {isRowError && (
                  <div className="min-h-[20px]">
                    {errors[`rate_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`rate_${index}`]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Tax */}
              <div>
                <Select
                  disabled={isFieldDisabled}
                  value={item.taxRate}
                  placeholder="Tax %"
                  showAddButton={true}
                  className={
                    errors[`taxRate_${index}`]
                      ? "border-red-500 focus:ring-red-200"
                      : ""
                  }
                  options={[
                    { value: "5", label: "5%" },
                    { value: "18", label: "18%" },
                  ]}
                  onChange={(value) =>
                    handleItemChange(index, {
                      target: { name: "taxRate", value },
                    })
                  }
                />
                {isRowError && (
                  <div className="min-h-[20px]">
                    {errors[`taxRate_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`taxRate_${index}`]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Total */}
              <div>
                <Input
                  disabled={isFieldDisabled}
                  name="total"
                  placeholder="Total"
                  value={
                    item.qty && item.rate
                      ? Number(item.qty) * Number(item.rate)
                      : ""
                  }
                  readOnly
                />
                {isRowError && <div className="min-h-[20px]"></div>}
              </div>

              {/* Delete */}
              <div className="flex justify-center">
                <button
                  disabled={isFieldDisabled}
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {isRowError && <div className="min-h-[20px]"></div>}
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-4 max-w-full">
          {/* Left Side: Add Item Button */}
          <div className="flex items-start">
            <button
              disabled={isFieldDisabled}
              onClick={addItem}
              className="primary-color-text"
            >
              + Add Item
            </button>
          </div>

          {/* Right Side: Subtotal & Tax Grid */}
          <div className="border-t pt-4 grid grid-cols-2 gap-y-2 text-sm justify-items-end">
            <span className="justify-self-start">Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>

            {/* For Gujarat */}
            {formData.state === "Gujarat" && (
              <>
                {taxSummary.sgst9 > 0 && (
                  <>
                    <span className="justify-self-start">SGST @ 9%</span>
                    <span>{taxSummary.sgst9.toFixed(2)}</span>
                  </>
                )}
                {taxSummary.cgst9 > 0 && (
                  <>
                    <span className="justify-self-start">CGST @ 9%</span>
                    <span>{taxSummary.cgst9.toFixed(2)}</span>
                  </>
                )}
                {taxSummary.sgst2_5 > 0 && (
                  <>
                    <span className="justify-self-start">SGST @ 2.5%</span>
                    <span>{taxSummary.sgst2_5.toFixed(2)}</span>
                  </>
                )}
                {taxSummary.cgst2_5 > 0 && (
                  <>
                    <span className="justify-self-start">CGST @ 2.5%</span>
                    <span>{taxSummary.cgst2_5.toFixed(2)}</span>
                  </>
                )}
              </>
            )}

            {/* For Outside Gujarat */}
            {formData.state !== "Gujarat" && (
              <>
                {taxSummary.igst9 > 0 && (
                  <>
                    <span className="justify-self-start">IGST @ 18%</span>
                    <span>{taxSummary.igst9.toFixed(2)}</span>
                  </>
                )}
                {taxSummary.igst2_5 > 0 && (
                  <>
                    <span className="justify-self-start">IGST @ 5%</span>
                    <span>{taxSummary.igst2_5.toFixed(2)}</span>
                  </>
                )}
              </>
            )}

            <span className="font-bold justify-self-start border-t pt-2">
              TOTAL
            </span>
            <span className="font-bold text-lg border-t pt-2">
              {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={() => navigate("/invoice")}
          className="border px-5 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || isFieldDisabled}
          className={`${isFieldDisabled ? "bg-gray-400 cursor-not-allowed" : "primary-color"} text-white px-5 py-2 rounded`}
        >
          {loading ? "Please wait" : "Save Invoice"}
        </button>
      </div>
    </ComponentCard>
  );
};

export default AddInvoice;
