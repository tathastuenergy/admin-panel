// @ts-nocheck
import React, { useState, useEffect } from "react";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { toast } from "react-toastify";
import endPointApi from "../../utils/endPointApi";
import { api } from "../../utils/axiosInstance";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import { cityOptions, getStateFromCity } from "../../utils/cityStateData";

const AddCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const initialFormState = {
    name: "",
    mobile: "",
    email: "",
    gst_number: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Reset form whenever modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const handleCityChange = (value: string) => {
    const state = getStateFromCity(value);
    setFormData((prev) => ({
      ...prev,
      city: value,
      state,
      country: "India",
    }));
    setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers
    if (name === "mobile" || name === "pincode") {
      if (!/^\d*$/.test(value)) return;

      // Limit length
      if (name === "mobile" && value.length > 10) return;
      if (name === "pincode" && value.length > 6) return;
    }

    // GST Number - alphanumeric only, max 15 chars
    if (name === "gst_number") {
      if (value.length > 15) return; // Max 15 characters
      if (!/^[a-zA-Z0-9]*$/.test(value)) return; // Only letters and numbers
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gst_number" ? value.toUpperCase() : value, // ✅
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required";
    }

    // Mobile
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    // GST
    if (!formData.gst_number) {
      newErrors.gst_number = "GST number is required";
    } else if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gst_number,
      )
    ) {
      newErrors.gst_number = "Enter a valid GST number";
    }

    // if (!formData.email) {
    //   newErrors.email = "Email is required";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   newErrors.email = "Enter a valid email address";
    // }

    if (!formData.address) {
      newErrors.address = "Address is required";
    }

    // City
    if (!formData.city) {
      newErrors.city = "Please select a city";
    }

    // Pincode
    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Strictly POST method
      const res = await api.post(endPointApi.createCustomer, formData);

      if (res.data?.success) {
        toast.success("Customer added successfully");
        onSuccess(); // Refresh list in parent
        onClose(); // Close modal
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add customer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Add New Customer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-2">
              <Label>Customer Name</Label>
              <Input
                name="name"
                className={
                  errors.name ? "border-red-500 focus:ring-red-200" : ""
                }
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                name="mobile"
                className={
                  errors.mobile ? "border-red-500 focus:ring-red-200" : ""
                }
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                placeholder="10 digits"
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
              />
            </div>

            <div className="lg:col-span-2">
              <Label>GST Number</Label>
              <Input
                name="gst_number"
                className={
                  errors.gst_number ? "border-red-500 focus:ring-red-200" : ""
                }
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
              />
              {errors.gst_number && (
                <p className="text-red-500 text-xs mt-1">{errors.gst_number}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <Label>Address</Label>
              <TextArea
                name="address"
                className={
                  errors.address ? "border-red-500 focus:ring-red-200" : ""
                }
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address..."
              />
              {errors.address && (
                <p className="text-red-500 text-xs">{errors.address}</p>
              )}
            </div>

            <div>
              <Label>City</Label>
              <Select
                className={
                  errors.city ? "border-red-500 focus:ring-red-200" : ""
                }
                options={cityOptions}
                value={formData.city}
                onChange={handleCityChange}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <Label>State</Label>
              <Input
                name="state"
                value={formData.state}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <Label>Country</Label>
              <Input
                name="country"
                value={formData.country}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <Label>Pincode</Label>
              <Input
                name="pincode"
                className={
                  errors.pincode ? "border-red-500 focus:ring-red-200" : ""
                }
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                placeholder="6 digits"
              />
              {errors.pincode && (
                <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md"
          >
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
