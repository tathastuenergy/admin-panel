// @ts-nocheck
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
import { Package, Hash, IndianRupee, Layers, Percent, ArrowLeft, Save, X, Info } from "lucide-react";

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
    if (!formData.name.trim()) newErrors.name = "Inventory is required";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    if (!formData.hsn.trim()) {
      newErrors.hsn = "HSN is required";
    } else if (!/^\d{8}$/.test(formData.hsn)) {
      newErrors.hsn = "HSN must be exactly 8 digits";
    }
    if (!formData.tax.trim()) newErrors.tax = "Tax is required";
    if (!formData.purchase.trim()) newErrors.purchase = "Purchase is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const method = id ? "put" : "post";
      const url = id ? `${endPointApi.updateInventory}/${id}` : `${endPointApi.createInventory}`;
      const res = await api[method](url, formData);
      if (res.data?.success) {
        toast.success(id ? "Inventory updated successfully" : "Inventory added successfully");
        navigate("/inventory");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.toLowerCase().includes("already exists")) {
          setErrors((prev) => ({ ...prev, name: message }));
          return;
        }
        toast.error(message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0f172a] p-4 md:p-6">
      {loading && <Loader src="/loader.mp4" fullScreen />}
      
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/inventory")}
              className="p-2.5 bg-white dark:bg-[#1e2535] dark:border-[#2a3550] border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">
                {id ? "Edit Item Inventory" : "Add New Item"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {id ? "Modify existing inventory specifications" : "Register new products or services into the inventory system"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-white">Product Information</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">Inventory Name</Label>
                  <Input
                    disabled={isFieldDisabled}
                    className={`${errors.name ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 transition-all w-full`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Wireless Mouse"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">HSN Code</Label>
                    <div className="relative">
                      <Input
                        disabled={isFieldDisabled}
                        className={`${errors.hsn ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full font-mono`}
                        name="hsn"
                        value={formData.hsn}
                        onChange={handleChange}
                        placeholder="8-digit code"
                      />
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.hsn && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.hsn}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">Tax Category</Label>
                    <div className="relative">
                      <Select
                        disabled={isFieldDisabled}
                        value={formData.tax}
                        placeholder="Select Tax %"
                        className={`${errors.tax ? "border-red-500" : "border-gray-200"} rounded-xl w-full h-[42px]`}
                        searchable={false}
                        options={[
                          { value: "0", label: "0% - Exempt" },
                          { value: "5", label: "5% - GST" },
                          { value: "18", label: "18% - GST" },
                        ]}
                        onChange={handleSelectChange}
                      />
                    </div>
                    {errors.tax && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.tax}</p>}
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Pricing Details */}
          <div className="space-y-6">
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-white">Pricing & Units</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">Measurement Unit</Label>
                  <div className="relative">
                    <Input
                      disabled={isFieldDisabled}
                      className={`${errors.unit ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="e.g. PCS, NOS, BOX"
                    />
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.unit && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.unit}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5 dark:text-gray-300">Purchase Rate (Base)</Label>
                  <div className="relative">
                    <Input
                      disabled={isFieldDisabled}
                      className={`${errors.purchase ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full font-bold text-gray-700`}
                      name="purchase"
                      value={formData.purchase}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.purchase && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.purchase}</p>}
                </div>
              </div>
            </ComponentCard>

            <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  The HSN code and Tax rate will be automatically applied whenever this item is selected in an Invoice or Estimate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-8 flex items-center justify-between p-4 bg-white dark:bg-[#1e2535] dark:border-[#2a3550] border border-gray-200 rounded-3xl shadow-sm mb-10">
          <div className="hidden md:flex items-center gap-2 pl-4 text-gray-400">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium dark:text-gray-400">Verify all fields before creating record</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/inventory")}
              className="px-8 py-3 dark:bg-[#252d40] dark:text-gray-300 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 flex-1 md:flex-none justify-center border border-gray-100"
            >
              <X className="h-5 w-5" /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || isFieldDisabled}
              className={`${isFieldDisabled ? "bg-gray-300 pointer-events-none shadow-none" : "primary-color hover:shadow-lg shadow-blue-50"} text-white px-10 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              {id ? "Update Item" : "Save Inventory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventory;
