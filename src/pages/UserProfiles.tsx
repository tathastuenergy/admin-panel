import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useEffect, useState } from "react";
import endPointApi from "../utils/endPointApi";
import { api } from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Select from "../components/form/Select";
import { cityOptions, getStateFromCity } from "../utils/cityStateData";
import TextArea from "../components/form/input/TextArea";
import Loader from "../components/common/Loader";
import { useForm } from "./Context/FormContext";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  Hash, 
  UploadCloud, 
  X, 
  Save, 
  AlertCircle,
  Banknote,
  Navigation
} from "lucide-react";

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
  company_logo?: {
    url: string;
    public_id: string;
  };
  bank_details?: string | BankDetails;
}

export default function UserProfiles() {
  const { isFormEnabled } = useForm();

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
  const [loading, setLoading] = useState(false);

  const isEnabledFromSettings = isFormEnabled("profile");
  const isProfileEnabled = companyId ? isEnabledFromSettings : true;
  const [errors, setErrors] = useState<
    Partial<Record<keyof CompanyFormData, string>>
  >({});

  useEffect(() => {
    if (!isProfileEnabled) {
      setErrors({});
    }
  }, [isProfileEnabled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isProfileEnabled) return;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, company_logo: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, company_logo: undefined }));
    } else {
      setLogoPreview(existingLogoUrl);
    }
  };

  const handleRemoveLogo = () => {
    if (!isProfileEnabled) return;
    setFormData((prev) => ({ ...prev, company_logo: null }));
    setLogoPreview("");
    setExistingLogoUrl("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!isProfileEnabled) return;
    const { name, value } = e.target;
    if (name === "phone_number" || name === "pincode") {
      if (!/^\d*$/.test(value)) return;
      if (name === "phone_number" && value.length > 10) return;
      if (name === "pincode" && value.length > 6) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCityChange = (value: string) => {
    if (!isProfileEnabled) return;
    const state = getStateFromCity(value);
    setFormData((prev) => ({ ...prev, city: value, state, country: "India" }));
    setErrors((prev) => ({ ...prev, city: "", state: "" }));
  };

  const validateForm = () => {
    if (!isProfileEnabled) {
      toast.warning("Please enable profile editing from Settings page");
      return false;
    }
    const newErrors: Partial<Record<keyof CompanyFormData, string>> = {};

    if (!formData.company_name?.trim()) newErrors.company_name = "Required";
    if (!formData.address?.trim()) newErrors.address = "Required";
    if (!formData.city?.trim()) newErrors.city = "Required";
    if (!formData.state?.trim()) newErrors.state = "Required";
    
    if (!formData.gst_number) {
      newErrors.gst_number = "Required";
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_number)) {
      newErrors.gst_number = "Invalid GST format";
    }

    if (!formData.pincode?.trim()) {
      newErrors.pincode = "Required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Must be 6 digits";
    }

    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = "Required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Must be 10 digits";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (formData.website?.trim() && !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = "Invalid website URL";
    }

    if (!isEdit && !formData.company_logo && !existingLogoUrl) {
      newErrors.company_logo = "Logo is required";
    }

    if (!formData.account_name.trim()) newErrors.account_name = "Required";
    if (!formData.account_number.trim()) newErrors.account_number = "Required";
    if (!formData.bank_name.trim()) newErrors.bank_name = "Required";
    if (!formData.branch.trim()) newErrors.branch = "Required";
    if (!formData.ifsc_code.trim()) newErrors.ifsc_code = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
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
      data.append("bank_details", JSON.stringify({
        account_name: formData.account_name,
        account_number: formData.account_number,
        bank_name: formData.bank_name,
        ifsc_code: formData.ifsc_code,
        branch: formData.branch,
      }));
      if (formData.company_logo) data.append("company_logo", formData.company_logo);

      const res = isEdit && companyId 
        ? await api.put(`${endPointApi.updateCompany}/${companyId}`, data, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.post(endPointApi.createCompany, data, { headers: { "Content-Type": "multipart/form-data" } });

      if (res.data.success) {
        toast.success(isEdit ? "Profile updated successfully" : "Profile created successfully");
        if (!isEdit) {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCompany = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: CompanyResponse[] }>(endPointApi.getAllCompany);
        if (res.data.success && res.data.data.length > 0) {
          const company = res.data.data[0];
          let bank_details: BankDetails = {};
          if (company.bank_details) {
            try {
              bank_details = typeof company.bank_details === "string" ? JSON.parse(company.bank_details) : company.bank_details;
            } catch { console.warn("Invalid bank_details JSON", company.bank_details); }
          }
          setFormData((prev) => ({
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
            account_name: bank_details?.account_name || "",
            account_number: bank_details?.account_number || "",
            bank_name: bank_details?.bank_name || "",
            ifsc_code: bank_details?.ifsc_code || "",
            branch: bank_details?.branch || "",
          }));
          if (company.company_logo?.url) {
            setExistingLogoUrl(company.company_logo?.url);
            setLogoPreview(company.company_logo.url);
          }
          setIsEdit(true);
          setCompanyId(String(company.id || company._id || ""));
        }
      } catch (error) { console.error("Failed to fetch company:", error);
      } finally { setLoading(false); }
    };
    fetchCompany();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6">
      <PageMeta title="Edit Company Profile | Admin Dashboard" description="Professional profile management for your business" />
      
      <div className="max-w-6xl mx-auto">
        <PageBreadcrumb pageTitle="Company Profile" />

        {loading && <Loader src="/loader.mp4" fullScreen />}

        {/* Status Banner */}
        {!isProfileEnabled && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-semibold uppercase tracking-wider mb-0.5">Profile Editing Restricted</p>
              <p className="text-xs text-amber-700">Please enable profile editing from the <span className="font-bold underline cursor-pointer">Settings</span> page to make any changes.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Areas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Business Identity */}
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 font-outfit">Business Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5">Company Name</Label>
                  <div className="relative">
                    <Input
                      disabled={!isProfileEnabled}
                      className={`${errors.company_name ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corporation"
                    />
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.company_name && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.company_name}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5">GST Number</Label>
                  <div className="relative">
                    <Input
                      disabled={!isProfileEnabled}
                      className={`${errors.gst_number ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full font-mono uppercase`}
                      name="gst_number"
                      value={formData.gst_number}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                    />
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.gst_number && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.gst_number}</p>}
                </div>
              </div>
            </ComponentCard>

            {/* Section 2: Contact Information */}
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 font-outfit">Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5">Phone Number</Label>
                  <div className="relative">
                    <Input
                      disabled={!isProfileEnabled}
                      className={`${errors.phone_number ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="9876543210"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.phone_number && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.phone_number}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5">Email Address</Label>
                  <div className="relative">
                    <Input
                      disabled={!isProfileEnabled}
                      type="email"
                      className={`${errors.email ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@company.com"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.email && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.email}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5">Website</Label>
                  <div className="relative">
                    <Input
                      disabled={!isProfileEnabled}
                      className={`${errors.website ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="www.company.com"
                    />
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.website && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.website}</p>}
                </div>
              </div>
            </ComponentCard>

            {/* Section 3: Location Details */}
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 font-outfit">Physical Location</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-gray-700 font-semibold mb-1.5">Registered Address</Label>
                  <TextArea
                    disabled={!isProfileEnabled}
                    className={`${errors.address ? "border-red-500" : "border-gray-200"} rounded-xl p-3 transition-all w-full min-h-[80px]`}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full business address..."
                  />
                  {errors.address && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">City</Label>
                    <Select
                      disabled={!isProfileEnabled}
                      options={cityOptions}
                      value={formData.city}
                      onChange={handleCityChange}
                      placeholder="Select City"
                      className={`${errors.city ? "border-red-500" : "border-gray-200"} rounded-xl h-[42px]`}
                    />
                    {errors.city && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">State</Label>
                    <div className="relative">
                      <Input
                        disabled={true}
                        className="rounded-xl p-2.5 pl-10 bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed w-full"
                        value={formData.state}
                        placeholder="Select City first..."
                      />
                      <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">Pincode</Label>
                    <div className="relative">
                      <Input
                        disabled={!isProfileEnabled}
                        className={`${errors.pincode ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="380001"
                      />
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.pincode && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </ComponentCard>

            {/* Section 4: Banking Information */}
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 font-outfit">Banking Details</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">Account Holder Name</Label>
                    <div className="relative">
                      <Input
                        disabled={!isProfileEnabled}
                        className={`${errors.account_name ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                        name="account_name"
                        value={formData.account_name}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                      <AlertCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.account_name && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.account_name}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">Account Number</Label>
                    <div className="relative">
                      <Input
                        disabled={!isProfileEnabled}
                        className={`${errors.account_number ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full font-mono`}
                        name="account_number"
                        value={formData.account_number}
                        onChange={handleChange}
                        placeholder="0000000000000000"
                      />
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.account_number && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.account_number}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">Bank Name</Label>
                    <div className="relative">
                      <Input
                        disabled={!isProfileEnabled}
                        className={`${errors.bank_name ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        placeholder="HDFC Bank"
                      />
                      <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.bank_name && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.bank_name}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">IFSC Code</Label>
                    <div className="relative">
                      <Input
                        disabled={!isProfileEnabled}
                        className={`${errors.ifsc_code ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full font-mono uppercase`}
                        name="ifsc_code"
                        value={formData.ifsc_code}
                        onChange={handleChange}
                        placeholder="HDFC0001234"
                      />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[10px] text-gray-400">#IFSC</span>
                    </div>
                    {errors.ifsc_code && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.ifsc_code}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold mb-1.5">Branch Name</Label>
                    <div className="relative">
                      <Input
                        disabled={!isProfileEnabled}
                        className={`${errors.branch ? "border-red-500" : "border-gray-200"} rounded-xl p-2.5 pl-10 transition-all w-full`}
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        placeholder="Downtown Branch"
                      />
                      <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.branch && <p className="text-red-500 text-[10px] mt-1.5 font-medium ml-1">{errors.branch}</p>}
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Sidebar Area: Logo & Actions */}
          <div className="space-y-6">
            <ComponentCard title="">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-1.5 bg-rose-50 rounded-lg">
                  <UploadCloud className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 font-outfit">Company Logo</h3>
              </div>

              <div className="space-y-4">
                <div 
                  className={`
                    relative group border-2 border-dashed rounded-3xl p-4 transition-all duration-300
                    ${logoPreview ? "border-blue-100 bg-blue-50/20" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"}
                  `}
                >
                  {logoPreview ? (
                    <div className="relative aspect-square w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center p-6">
                      <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                      {!isProfileEnabled ? null : (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Upload Brand Logo</p>
                      <p className="text-xs text-gray-400">PNG, JPG or WEBP (Max 2MB)</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={!isProfileEnabled}
                  />
                </div>

                {errors.company_logo && <p className="text-red-500 text-xs text-center font-medium">{errors.company_logo}</p>}

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">Branding Tip</p>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    A high-resolution transparent PNG logo works best for your digital invoices and estimates.
                  </p>
                </div>
              </div>
            </ComponentCard>

            <div className="p-1 px-1 mt-6">
               <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isProfileEnabled}
                  className={`
                    w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all
                    ${!isProfileEnabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "primary-color text-white shadow-lg shadow-blue-100 hover:opacity-95"}
                  `}
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {isEdit ? "Update Profile" : "Create Profile"}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-4">
                  Changes will be reflected across all generated documents
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
