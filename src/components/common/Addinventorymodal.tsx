import { useState, ChangeEvent } from "react";
import { toast } from "react-toastify";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";

// Types and Interfaces
interface Inventory {
  id: string;
  name: string;
  unit: string;
  hsn: string;
  tax: string;
  purchase: string;
}

interface FormData {
  name: string;
  unit: string;
  hsn: string;
  tax: string;
  purchase: string;
}

interface FormErrors {
  name?: string;
  unit?: string;
  hsn?: string;
  tax?: string;
  purchase?: string;
}

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (inventory: Inventory) => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    unit: "",
    hsn: "",
    tax: "",
    purchase: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name === "hsn") {
      // Convert to string and limit to 8 digits
      const val = value.toString().replace(/\D/g, "").slice(0, 8);

      setFormData((prev) => ({
        ...prev,
        hsn: val,
      }));

      setErrors((prev) => ({
        ...prev,
        hsn: "",
      }));
      return;
    }

    if (name === "purchase") {
      // Allow only numbers and decimal point
      if (value && !/^\d*\.?\d*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value.trimStart() : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSelectChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      tax: val,
    }));

    setErrors((prev) => ({
      ...prev,
      tax: "",
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Inventory name is required";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }

    if (!formData.hsn.trim()) {
      newErrors.hsn = "HSN is required";
    } else if (!/^\d{8}$/.test(formData.hsn)) {
      newErrors.hsn = "HSN must be exactly 8 digits";
    }

    if (!formData.tax.trim()) {
      newErrors.tax = "Tax is required";
    }

    if (!formData.purchase.trim()) {
      newErrors.purchase = "Purchase price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      const res = await api.post(endPointApi.createInventory, formData);

      if (res.data?.success) {
        toast.success("Inventory added successfully");

        // Call onSuccess callback if provided
        if (onSuccess && res.data.data) {
          onSuccess(res.data.data);
        }

        // Reset form
        setFormData({
          name: "",
          unit: "",
          hsn: "",
          tax: "",
          purchase: "",
        });

        onClose();
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.message;

      // Handle duplicate name error
      if (
        errorMessage &&
        errorMessage.toLowerCase().includes("already exists")
      ) {
        setErrors((prev) => ({
          ...prev,
          name: errorMessage,
        }));
      } else {
        toast.error(errorMessage || "Failed to add inventory");
      }
      console.error("Error adding inventory:", error);
    }
  };

  const handleClose = (): void => {
    setFormData({
      name: "",
      unit: "",
      hsn: "",
      tax: "",
      purchase: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Add New Inventory</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-10 overflow-visible flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Inventory Name */}
            <div className="lg:col-span-2">
              <Label>Inventory Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter inventory name"
                className={
                  errors.name ? "border-red-500 focus:ring-red-200" : ""
                }
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <Label>Unit</Label>
              <Input
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., Nos, Kg, Pcs"
                className={
                  errors.unit ? "border-red-500 focus:ring-red-200" : ""
                }
              />
              {errors.unit && (
                <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
              )}
            </div>

            {/* HSN */}
            <div>
              <Label>HSN Code</Label>
              <Input
                type="number"
                name="hsn"
                value={formData.hsn}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="8-digit HSN"
                className={
                  errors.hsn ? "border-red-500 focus:ring-red-200" : ""
                }
              />
              {errors.hsn && (
                <p className="text-red-500 text-xs mt-1">{errors.hsn}</p>
              )}
            </div>

            {/* Tax */}
            <div>
              <Label>Tax</Label>
              <Select
                value={formData.tax}
                placeholder="Tax %"
                searchable={false}
                showAddButton={true}
                className={
                  errors.tax ? "border-red-500 focus:ring-red-200" : ""
                }
                options={[
                  { value: "5", label: "5%" },
                  { value: "18", label: "18%" },
                ]}
                onChange={handleSelectChange}
              />
              {errors.tax && (
                <p className="text-red-500 text-xs mt-1">{errors.tax}</p>
              )}
            </div>

            {/* Purchase Price */}
            <div>
              <Label>Purchase Price</Label>
              <Input
                type="text"
                name="purchase"
                value={formData.purchase}
                onChange={handleChange}
                placeholder="Enter price"
                className={
                  errors.purchase ? "border-red-500 focus:ring-red-200" : ""
                }
              />
              {errors.purchase && (
                <p className="text-red-500 text-xs mt-1">{errors.purchase}</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md"
          >
            Save Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryModal;
