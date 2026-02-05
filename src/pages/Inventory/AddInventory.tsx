import { useEffect, useState } from "react";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ComponentCard from "../../components/common/ComponentCard";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import Select from "../../components/form/Select";
import Loader from "../../components/common/Loader";
import { useForm } from "../Context/FormContext";

type FormErrors = {
  name?: string;
  unit?: string;
  hsn?: string;
  tax?: string;
  purchase?: string;
};

const AddInventory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isFormEnabled } = useForm();
  const isEnabledFromSettings = isFormEnabled("inventory");
  const isFieldDisabled = id ? !isEnabledFromSettings : false;

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    hsn: "",
    tax: "",
    purchase: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
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
  useEffect(() => {
    if (id) {
      getInventoryById();
    }
  }, [id]);

  const getInventoryById = async () => {
    try {
      const res = await api.get(`${endPointApi.getByIdInventory}/${id}`);

      if (res.data) {
        const customer = res.data.data;

        setFormData({
          name: customer.name || "",
          unit: customer.unit || "",
          hsn: customer.hsn || "",
          tax: customer.tax || "",
          purchase: customer.purchase || "",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validateForm = () => {
    let newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Inventory is required";
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
      newErrors.purchase = "Purchase is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true); // loader ON

    try {
      const method = id ? "put" : "post";
      const url = id
        ? `${endPointApi.updateInventory}/${id}`
        : `${endPointApi.createInventory}`;

      const res = await api[method](url, formData);

      if (res.data?.success) {
        toast.success(
          id
            ? "Inventory updated successfully"
            : "Inventory added successfully",
        );
        navigate("/inventory");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        const message = error.response.data.message;

        // 🔥 Handle duplicate name
        if (message.toLowerCase().includes("already exists")) {
          setErrors((prev) => ({
            ...prev,
            name: message,
          }));
          return;
        }

        toast.error(message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false); // loader OFF
    }
  };

  return (
    <ComponentCard title={id ? "Edit Inventory" : "Add Inventory"}>
      {loading && <Loader src="/loader.mp4" fullScreen />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Name */}
        <div>
          <Label>Inventory Name</Label>
          <Input
            disabled={isFieldDisabled}
            type="text"
            name="name"
            className={errors.name ? "border-red-500 focus:ring-red-200" : ""}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter inventory"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* unit */}
        <div>
          <Label>Unit</Label>
          <Input
            disabled={isFieldDisabled}
            type="text"
            name="unit"
            className={errors.unit ? "border-red-500 focus:ring-red-200" : ""}
            value={formData.unit}
            onChange={handleChange}
            // inputMode="numeric"
            placeholder="Enter unit"
          />
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
          )}
        </div>

        {/* HSN */}
        <div>
          <Label>HSN</Label>
          <Input
            disabled={isFieldDisabled}
            type="number"
            name="hsn"
            className={errors.hsn ? "border-red-500 focus:ring-red-200" : ""}
            value={formData.hsn}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="Enter 8-digit HSN"
          />
          {errors.hsn && (
            <p className="text-red-500 text-sm mt-1">{errors.hsn}</p>
          )}
        </div>

        {/* Tax */}
        <div>
          <Label>Tax</Label>
          <Select
            disabled={isFieldDisabled}
            value={formData.tax}
            placeholder="Tax %"
            showAddButton={true}
            className={errors.tax ? "border-red-500 focus:ring-red-200" : ""}
            options={[
              { value: "5", label: "5%" },
              { value: "18", label: "18%" },
            ]}
            onChange={handleSelectChange}
          />
          {errors.tax && (
            <p className="text-red-500 text-sm mt-1">{errors.tax}</p>
          )}
        </div>
        {/* purchase */}
        <div>
          <Label>Purchase</Label>
          <Input
            disabled={isFieldDisabled}
            type="text"
            name="purchase"
            className={
              errors.purchase ? "border-red-500 focus:ring-red-200" : ""
            }
            value={formData.purchase}
            onChange={handleChange}
            placeholder="Enter purchase"
          />
          {errors.purchase && (
            <p className="text-red-500 text-sm mt-1">{errors.purchase}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-8 border-t pt-5">
        <button
          className="px-5 py-2 border rounded hover:bg-gray-100"
          onClick={() => navigate("/inventory")}
        >
          Cancel
        </button>
        <button
          disabled={loading || isFieldDisabled}
          className={`${isFieldDisabled ? "bg-gray-400 cursor-not-allowed" : "primary-color"} text-white px-5 py-2 rounded`}
          onClick={handleSubmit}
        >
          {loading ? "Please wait" : "Save Inventory"}
        </button>
      </div>
    </ComponentCard>
  );
};

export default AddInventory;
