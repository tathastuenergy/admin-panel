// @ts-nocheck
import React, { useEffect, useState } from "react";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ComponentCard from "../../components/common/ComponentCard";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import { generateEstimateNumber } from "../../utils/helper";
import DatePicker from "../../components/form/date-picker";
import { Trash2 } from "lucide-react";
import Select from "../../components/form/Select";
import AddCustomerModal from "../../components/common/AddCustomerModal";
import Loader from "../../components/common/Loader";

const AddEstimate = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    customerId: "",
    estimateNumber: "",
    date: new Date(),
    state: "",
    items: [
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
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Example: last saved estimate number
    const fetchLastEstimateNumber = async () => {
      try {
        const res = await api.get(`${endPointApi.getLastEstimateNumber}`);
        const lastNumber = res.data.lastEstimateNumber || "TE2526000";
        const newNumber = generateEstimateNumber(lastNumber);

        setFormData((prev) => ({
          ...prev,
          estimateNumber: newNumber,
        }));
      } catch (err) {
        console.error("Failed to fetch last estimate number", err);
      }
    };
    fetchLastEstimateNumber();
  }, []);

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

  const handleItemChange = (index: number, e: any) => {
    const { name, value } = e.target;

    setFormData((prev: any) => {
      const updatedItems = [...prev.items];

      // update current field
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };

      // when item is selected, auto-fill tax
      if (name === "item") {
        const selectedItem = inventoryData.find((inv: any) => inv.id === value);

        if (selectedItem) {
          updatedItems[index].taxRate = selectedItem.tax; // auto set tax
        }
      }

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  //   getById Estimate
  useEffect(() => {
    if (!id) return;

    const fetchEstimate = async () => {
      try {
        const res = await api.get(`${endPointApi.getByIdEstimate}/${id}`);

        const data = res.data.data;

        setFormData({
          customerId: data.customerId?.id || "",
          estimateNumber: data.estimateNumber || "",
          date: data.date ? new Date(data.date) : null,
          state: data.state || "",
          items: data.items?.length
            ? data.items.map((item) => ({
                item: item.item?.id || "",
                name: item.item?.name || "",
                description: item.description || "",
                qty: item.qty || 0,
                rate: item.rate || 0,
                taxRate: item.taxRate || 0,
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
        toast.error("Failed to load estimate ❌");
        console.error(error);
      }
    };

    fetchEstimate();
  }, [id]);

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

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item: "", name: "", description: "", qty: "", rate: "", taxRate: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`${endPointApi.getAllCustomer}`);

      setCustomers(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load customers");
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (!formData.estimateNumber.trim()) {
      newErrors.estimateNumber = "Estimate number is required";
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
        newErrors[`qty_${index}`] = "Quantity must be greater than 0";
      }
      if (!item.rate || item.rate <= 0) {
        newErrors[`rate_${index}`] = "Rate must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true); // loader ON
    try {
      // 🔁 Frontend → Backend payload mapping
      const payload = {
        customerId: formData.customerId,
        estimateNumber: formData.estimateNumber,
        date: formData.date,
        state: formData.state,
        items: formData.items.map((item) => {
          const selectedItem = inventoryData.find((p) => p.id === item.item);
          return {
            description:
              (selectedItem?.name || "") +
              (item.description ? ` - ${item.description}` : ""),
            item: item.item, // still just the ID
            qty: Number(item.qty),
            rate: Number(item.rate),
            taxRate: Number(item.taxRate),
          };
        }),
      };

      const method = id ? "put" : "post";
      const url = id
        ? `${endPointApi.updateEstimate}/${id}`
        : `${endPointApi.createEstimate}`;

      const res = await api[method](url, payload);

      if (res.data) {
        toast.success(
          id ? "Estimate updated successfully" : "Estimate added successfully",
        );
        navigate("/estimate");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
    setLoading(false); // loader OFF
  }
  };

  const subtotal = formData.items.reduce((sum, item) => {
    const rowTotal = Number(item.qty || 0) * Number(item.rate || 0);
    return sum + rowTotal;
  }, 0);

  // Initialize tax summary
  let taxSummary = {
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

  return (
    <ComponentCard title={id ? "Edit Estimate" : "Add Estimate"}>
      {loading && <Loader src="/loader.mp4" fullScreen />}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center justify-between">
            <Label>Customer Name</Label>
          </div>
          {/* <Select
            options={customerOptions}
            value={formData.customerId}
            placeholder="Select Customer"
            showAddButton={true}
            onAddNew={() => navigate("/customer/add")}
            addButtonText="Add New Customer"
            onChange={(value) => {
              const selectedCustomer = customers.find((c) => c.id === value);

              setFormData((prev) => ({
                ...prev,
                customerId: value, // store ID
                state: selectedCustomer?.state || "",
              }));
            }}
          /> */}

          <Select
            options={customerOptions}
            value={formData.customerId}
            placeholder="Select Customer"
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
            }}
          />

          {/* Add the Modal */}
          <AddCustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSuccess={fetchCustomers}
          />
          {errors.customerId && (
            <p className="text-red-500">{errors.customerId}</p>
          )}
        </div>

        <div>
          <Label>Estimate Number</Label>
          <Input
            name="estimateNumber"
            value={formData.estimateNumber}
            onChange={handleChange}
            placeholder="EST-001"
          />
          {errors.estimateNumber && (
            <p className="text-red-500">{errors.estimateNumber}</p>
          )}
        </div>

        <div>
          <DatePicker
            id="estimate-date"
            label="Estimate Date"
            placeholder="Select date"
            defaultDate={formData.date}
            onChange={(selectedDates) => {
              setFormData((prev) => ({
                ...prev,
                date: selectedDates[0], // IMPORTANT
              }));
            }}
          />
          {errors.date && <p className="text-red-500">{errors.date}</p>}
        </div>

        <div>
          <Label>State</Label>
          <Input
            name="state"
            value={formData.state}
            onChange={handleChange}
            disabled
          />
          {errors.state && <p className="text-red-500">{errors.state}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="mt-6">
        {formData.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 mb-3 items-center"
          >
            {/* Item */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={inventoryOptions}
                  value={item.item}
                  placeholder="Select Item"
                  showAddButton={true}
                  onAddNew={() => navigate("/inventory/add")}
                  addButtonText="Add New Inventory"
                  onChange={(value) =>
                    handleItemChange(index, {
                      target: { name: "item", value },
                    } as any)
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Input
                name="description"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, e)}
              />
            </div>

            {/* Qty */}
            <div>
              <Input
                type="number"
                name="qty"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => handleItemChange(index, e)}
              />
            </div>

            {/* Rate */}
            <div>
              <Input
                type="number"
                name="rate"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => handleItemChange(index, e)}
              />
            </div>

            {/* Tax */}
            <div>
              <Select
                value={item.taxRate}
                placeholder="Tax %"
                options={[
                  { value: "5", label: "5%" },
                  { value: "18", label: "18%" },
                ]}
                onChange={(value) =>
                  handleItemChange(index, {
                    target: { name: "taxRate", value },
                  } as any)
                }
              />
            </div>

            {/* Total */}
            <div>
              <Input
                name="total"
                placeholder="Total"
                value={
                  item.qty && item.rate
                    ? Number(item.qty) * Number(item.rate)
                    : ""
                }
                readOnly
              />
            </div>

            {/* Delete */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4 max-w-full">
          {/* Left Side: Add Item Button */}
          <div className="flex items-start">
            <button onClick={addItem} className="primary-color-text">
              {/* <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90"> */}
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

      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={() => navigate("/estimate")}
          className="border px-5 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="primary-color text-white px-5 py-2 rounded"
        >
           {loading ? "Please wait" : "Save Estimate"}
          
        </button>
      </div>
    </ComponentCard>
  );
};

export default AddEstimate;
