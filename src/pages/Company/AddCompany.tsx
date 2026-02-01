import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { cityOptions, getStateFromCity } from "../../utils/cityStateData";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import Select from "../../components/form/Select";

type CompanyFormData = {
  company_name: string;
  company_logo: File | null;
  gst_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  website: string;
  phone_number: string;
  email: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  branch: string;
};

interface BankDetails {
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  branch?: string;
}

interface CompanyResponse {
  id?: string | number;
  _id?: string | number;
  company_name: string;
  gst_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  website: string;
  phone_number: string;
  email: string;
  company_logo?: string;
  bank_details?: string | BankDetails; // Can be stringified JSON or object
}

const AddCompany = () => {
  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: "",
    company_logo: null,
    gst_number: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    website: "",
    phone_number: "",
    email: "",
    account_name: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    branch: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [errors, setErrors] = useState<
    Partial<Record<keyof CompanyFormData, string>>
  >({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      company_logo: file,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({
        ...prev,
        company_logo: undefined,
      }));
    } else {
      setLogoPreview(existingLogoUrl);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      company_logo: null,
    }));
    setLogoPreview("");
    setExistingLogoUrl("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "phone_number" || name === "pincode") {
      if (!/^\d*$/.test(value)) return;
      if (name === "phone_number" && value.length > 10) return;
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

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CompanyFormData, string>> = {};

    if (!formData.company_name?.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state?.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.gst_number) {
      newErrors.gst_number = "GST number is required";
    } else if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gst_number
      )
    ) {
      newErrors.gst_number = "Enter a valid GST number";
    }

    if (!formData.pincode?.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be 10 digits";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.website?.trim()) {
      newErrors.website = "Website is required";
    } else if (
      !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(formData.website)
    ) {
      newErrors.website = "Invalid website URL";
    }

    if (!isEdit && !formData.company_logo && !existingLogoUrl) {
      newErrors.company_logo = "Company logo is required";
    } else if (formData.company_logo) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(formData.company_logo.type)) {
        newErrors.company_logo = "Only JPG, PNG, or WEBP images are allowed";
      } else if (formData.company_logo.size > maxSize) {
        newErrors.company_logo = "Image size must be less than 2MB";
      }
    }

    if (!formData.account_name.trim()) {
      newErrors.account_name = "Account name is required";
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = "Account number is required";
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = "Bank name is required";
    }

    if (!formData.ifsc_code.trim()) {
      newErrors.ifsc_code = "IFSC code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append("company_name", formData.company_name);
      data.append("gst_number", formData.gst_number);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("country", formData.country || "India");
      data.append("pincode", formData.pincode);
      data.append("website", formData.website);
      data.append("phone_number", formData.phone_number);
      data.append("email", formData.email);
      data.append(
        "bank_details",
        JSON.stringify({
          account_name: formData.account_name,
          account_number: formData.account_number,
          bank_name: formData.bank_name,
          ifsc_code: formData.ifsc_code,
          branch: formData.branch,
        })
      );

      if (formData.company_logo) {
        data.append("company_logo", formData.company_logo);
      }

      if (isEdit && companyId) {
        const res = await api.put(
          `${endPointApi.updateCompany}/${companyId}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (res.data.success) {
          toast.success("Company updated successfully");
        }
      } else {
        const res = await api.post(endPointApi.createCompany, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          toast.success("Company created successfully");
          setIsEdit(true);
          setCompanyId(res.data.data.id);
        }
      }
    } catch (err: unknown) {
      let message = "Something went wrong";

      if (err instanceof AxiosError) {
        const data = err.response?.data as { message?: string };
        if (data?.message) message = data.message;
      }

      toast.error(message);
    }
  };

useEffect(() => {
  const fetchCompany = async (): Promise<void> => {
    try {
      const res = await api.get<{ success: boolean; data: CompanyResponse[] }>(
        endPointApi.getAllCompany
      );

      if (
        res.data.success &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        const company = res.data.data[0];

        // Type-safe bank details handling
        let bank_details: BankDetails = {};
        
        if (company.bank_details) {
          try {
            bank_details =
            typeof company.bank_details === "string"
            ? JSON.parse(company.bank_details)
            : company.bank_details;
          } catch {
            console.warn("Invalid bank_details JSON", company.bank_details);
          }
        }

        setFormData((prev: CompanyFormData) => ({
          ...prev,
          company_name: company.company_name || "",
          gst_number: company.gst_number || "",
          address: company.address || "",
          city: company.city || "",
          state: company.state || "",
          country: company.country || "India",
          pincode: company.pincode || "",
          website: company.website || "",
          phone_number: company.phone_number || "",
          email: company.email || "",
          company_logo: null,

          // Bank details mapping
          account_name: bank_details?.account_name || "",
          account_number: bank_details?.account_number || "",
          bank_name: bank_details?.bank_name || "",
          ifsc_code: bank_details?.ifsc_code || "",
          branch: bank_details?.branch || "",
        }));

        if (company.company_logo) {
          setExistingLogoUrl(company.company_logo);
          setLogoPreview(company.company_logo);
        }

        setIsEdit(true);
        // Fallback for MongoDB (_id) or standard SQL (id)
        setCompanyId(String(company.id || company._id || ""));
      }
    } catch (error) {
      console.error("Failed to fetch company:", error);
    }
  };

  fetchCompany();
}, []);

  return (
    <ComponentCard title={companyId ? "Edit Company" : "Add Company"}>
      <div className="flex gap-10">
        {/* Left Side - Form Fields */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Company Name</Label>
              <Input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Enter company name"
              />
              {errors.company_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company_name}
                </p>
              )}
            </div>

            <div>
              <Label>GST Number</Label>
              <Input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="Enter GST number"
              />
              {errors.gst_number && (
                <p className="text-red-500 text-sm mt-1">{errors.gst_number}</p>
              )}
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                type="number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone_number}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label>Website</Label>
              <Input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Enter website"
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website}</p>
              )}
            </div>

            <div>
              <Label>Pincode</Label>
              <Input
                type="number"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
              />
              {errors.pincode && (
                <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div>
              <Label>State</Label>
              <Input
                type="text"
                name="state"
                value={formData.state}
                placeholder="Enter State"
                className="bg-gray-50"
                readOnly
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <Label>Country</Label>
              <Input
                type="text"
                name="country"
                value={formData.country}
                placeholder="Enter country"
                readOnly
              />
            </div>
          </div>
          <div className="md:col-span-2 mt-6">
            <h3 className="text-lg font-semibold mb-3">Bank Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Account Name</Label>
              <Input
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="Account holder name"
              />
            </div>

            <div>
              <Label>Account Number</Label>
              <Input
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Account number"
              />
            </div>

            <div>
              <Label>Bank Name</Label>
              <Input
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="Bank name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>IFSC Code</Label>
              <Input
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
                placeholder="IFSC code"
              />
            </div>

            <div className="md:col-span-1">
              <Label>Branch</Label>
              <Input
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Branch name"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Logo Display */}
        <div className="w-80">
          <div className="sticky top-4">
            <Label>Company Logo</Label>

            {logoPreview ? (
              <div className="mt-2">
                <div className="relative">
                  <div className="w-full h-64 bg-white border-2 border-gray-300 rounded-lg shadow-sm p-6 flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-700 shadow-md"
                    title="Remove logo"
                  >
                    ×
                  </button>
                </div>

                {/* Change Logo Button */}
                <div className="mt-3">
                  <label className="cursor-pointer inline-block w-full px-4 py-2 text-sm text-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                    Change Logo
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
            )}

            {errors.company_logo && (
              <p className="text-red-500 text-sm mt-1">{errors.company_logo}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 border-t pt-5">
        <button className="px-5 py-2 border rounded hover:bg-gray-100">
          Cancel
        </button>
        <button
          className="px-5 py-2 primary-color text-white rounded"
          onClick={handleSubmit}
        >
          {companyId ? "Update Company" : "Save Company"}
        </button>
      </div>
    </ComponentCard>
  );
};

export default AddCompany;
