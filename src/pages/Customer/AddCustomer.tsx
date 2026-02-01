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

const AddCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCityChange = (value: string) => {
    const state = getStateFromCity(value);

    setFormData((prev) => ({
      ...prev,
      city: value,
      state,
      country: "India",
    }));

    setErrors((prev) => ({
      ...prev,
      city: "",
      state: "",
    }));
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
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
      alert("Failed to load customer ❌");
    }
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
        formData.gst_number
      )
    ) {
      newErrors.gst_number = "Enter a valid GST number";
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
    setLoading(true); // loader ON

    try {
      const method = id ? "put" : "post";
      const url = id
        ? `${endPointApi.updateCustomer}/${id}`
        : `${endPointApi.createCustomer}`;

      const res = await api[method](url, formData);

      if (res.data?.success) {
        toast.success(
          id ? "Customer updated successfully" : "Customer added successfully"
        );
        navigate("/customer");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }finally {
    setLoading(false); // loader OFF 
  }
  };

  return (
    <ComponentCard title="Add Customer">
      {loading && <Loader src="/loader.mp4" fullScreen />}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Customer Name */}
        <div>
          <Label>Customer Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter customer full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <Label>Mobile Number</Label>
          <Input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
            placeholder="Enter 10-digit mobile number"
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label>Email Address</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        {/* GST */}
        <div>
          <Label>GST Number</Label>
          <Input
            type="text"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleChange}
            placeholder="Enter GSTIN (if applicable)"
          />
          {errors.gst_number && (
            <p className="text-red-500 text-sm mt-1">{errors.gst_number}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2 md:row-span-2 h-full">
          <Label>Address</Label>
          <TextArea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </div>

        {/* City */}
        <div>
          <Label>City</Label>
          <Select
            options={cityOptions}
            value={formData.city}
            onChange={handleCityChange}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <Label>State</Label>
          <Input
            type="text"
            name="state"
            value={formData.state}
            placeholder="Auto-filled based on city"
            readOnly
          />
        </div>

        {/* Country */}
        <div>
          <Label>Country</Label>
          <Input
            type="text"
            name="country"
            value={formData.country}
            placeholder="Auto-filled based on city"
            readOnly
          />
        </div>

        {/* Pincode */}
        <div>
          <Label>Pincode</Label>
          <Input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            maxLength={6}
            inputMode="numeric"
            placeholder="Enter area pincode"
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-8 border-t pt-5">
        <button
          className="px-5 py-2 border rounded hover:bg-gray-100"
          onClick={() => navigate("/customer")}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 primary-color text-white rounded "
        >
           {loading ? "Please wait" : "Save Customer"}

        </button>
      </div>
    </ComponentCard>
  );
};

export default AddCustomer;
