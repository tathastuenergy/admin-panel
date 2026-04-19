// @ts-nocheck
import React, { useEffect, useState } from "react";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ComponentCard from "../../components/common/ComponentCard";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import { cityOptions, getStateFromCity } from "../../utils/cityStateData";
import Loader from "../../components/common/Loader";
import { useForm } from "../Context/FormContext";
import { Contact2, MapPin, User2, ArrowLeft, Save, X, Info } from "lucide-react";

const AddCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isFormEnabled } = useForm();
  const isEnabledFromSettings = isFormEnabled("customer");
  const isFieldDisabled = id ? !isEnabledFromSettings : false;

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gst_number: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleCityChange = (value: string) => {
    const state = getStateFromCity(value);
    setFormData((prev) => ({
      ...prev,
      city: value,
      state,
      country: "India",
    }));
    setErrors((prev: any) => ({
      ...prev,
      city: "",
      state: "",
    }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "mobile" || name === "pincode") {
      if (!/^\d*$/.test(value)) return;
      if (name === "mobile" && value.length > 10) return;
      if (name === "pincode" && value.length > 6) return;
    }
    if (name === "gst_number") {
      if (value.length > 15) return;
      if (!/^[a-zA-Z0-9]*$/.test(value)) return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gst_number" ? value.toUpperCase() : value,
    }));
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  useEffect(() => {
    if (id) {
      getCustomerById();
    }
  }, [id]);

  const getCustomerById = async () => {
    try {
      const res = await api.get(`${endPointApi.getByIdCustomer}/${id}`);
      if (res.data) {
        const customer = res.data;
        setFormData({
          name: customer.name || "",
          mobile: customer.mobile || "",
          email: customer.email || "",
          gst_number: customer.gst_number || "",
          address: customer.address || "",
          city: customer.city || "",
          state: customer.state || "",
          country: customer.country || "",
          pincode: customer.pincode || "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load customer details");
    }
  };

  const validateForm = () => {
    let newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.mobile) {
      newErrors.mobile = "Required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Invalid 10-digit number";
    }
    if (!formData.gst_number) {
      newErrors.gst_number = "Required";
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_number)) {
      newErrors.gst_number = "Invalid GSTIN";
    }
    if (!formData.address) newErrors.address = "Required";
    if (!formData.city) newErrors.city = "Required";
    if (!formData.pincode) {
      newErrors.pincode = "Required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Invalid 6-digit code";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const method = id ? "put" : "post";
      const url = id ? `${endPointApi.updateCustomer}/${id}` : `${endPointApi.createCustomer}`;
      const res = await api[method](url, formData);
      if (res.data?.success) {
        toast.success(id ? "Customer updated successfully" : "Customer added successfully");
        navigate("/customer");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0f172a] p-4 md:p-6">
      {loading && <Loader src="/loader.mp4" fullScreen />}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/customer")}
            className="p-2.5 bg-white dark:bg-[#1e2535] border border-gray-200 dark:border-[#2a3550] rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-[#252d40] transition-all text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">
              {id ? "Edit Customer Profile" : "Add New Customer"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {id ? "Update the customer's vital information" : "Registers a new customer profile into the central system"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <User2 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 font-outfit">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5">Customer Name</Label>
                  <Input
                    disabled={isFieldDisabled}
                    className={`${errors.name ? "border-red-500" : ""} rounded-xl p-2.5 transition-all w-full`}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5">GST Number</Label>
                  <Input
                    disabled={isFieldDisabled}
                    className={`${errors.gst_number ? "border-red-500" : ""} rounded-xl p-2.5 text-sm uppercase font-medium w-full`}
                    type="text"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                  />
                  {errors.gst_number && <p className="text-red-500 text-xs mt-1.5">{errors.gst_number}</p>}
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <Contact2 className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-gray-100">Contact Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5">Mobile Number</Label>
                  <Input
                    disabled={isFieldDisabled}
                    className={`${errors.mobile ? "border-red-500" : ""} rounded-xl p-2.5 w-full`}
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="10-digit number"
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1.5">{errors.mobile}</p>}
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5">Email Address</Label>
                  <Input
                    disabled={isFieldDisabled}
                    className="rounded-xl p-2.5 border-gray-200 w-full"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
            </ComponentCard>
          </div>

          <div className="space-y-6">
            <ComponentCard title="" className="h-full">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-[#2a3550]">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-outfit dark:text-gray-100
                ">Address Details</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5">Street Address</Label>
                  <TextArea
                    disabled={isFieldDisabled}
                    className={`${errors.address ? "border-red-500" : "border-gray-200"} rounded-xl p-3 min-h-[100px] w-full`}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full street address"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.address}</p>}
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5">City</Label>
                  <Select
                    disabled={isFieldDisabled}
                    className={`${errors.city ? "border-red-500" : ""} rounded-xl w-full h-[42px]`}
                    showAddButton={true}
                    options={cityOptions}
                    value={formData.city}
                    onChange={handleCityChange}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5 text-xs uppercase tracking-tight">State</Label>
                    <Input
                      disabled={true}
                      className="rounded-xl p-2.5 bg-gray-50 text-gray-500 border-gray-100 w-full text-xs"
                      value={formData.state || "Auto-detected"}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5 text-xs uppercase tracking-tight">Pincode</Label>
                    <Input
                      disabled={isFieldDisabled}
                      className={`${errors.pincode ? "border-red-500" : ""} rounded-xl p-2.5 w-full text-xs`}
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit"
                    />
                  </div>
                </div>
                {errors.pincode && <p className="text-red-500 text-xs -mt-3">{errors.pincode}</p>}
              </div>
            </ComponentCard>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between p-4 bg-white dark:bg-[#1e2535] border border-gray-200 dark:border-[#2a3550] rounded-3xl shadow-sm mb-10">
          <div className="hidden md:flex items-center gap-2 pl-4 text-gray-400">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium dark:text-gray-400">Please verify values before saving</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/customer")}
              className="px-8 py-3 bg-gray-50 dark:bg-[#252d40] text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-[#2a3550] transition-all flex items-center gap-2 flex-1 md:flex-none justify-center border border-gray-100 dark:border-[#2a3550]"
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
              {id ? "Update Profile" : "Save Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
