// import { useState, FormEvent, JSX } from "react";
// import {
//   Mail,
//   Lock,
//   Zap,
//   ArrowRight,
//   Shield,
//   RefreshCw,
//   Eye,
//   EyeOff,
// } from "lucide-react";
// import { api } from "../../utils/axiosInstance";
// import endPointApi from "../../utils/endPointApi";
// import { useNavigate } from "react-router-dom";
// import Input from "../form/input/InputField";

// interface LoginResponse {
//   success: boolean;
//   message: string;
//   data: {
//     user: {
//       id: string;
//       email: string;
//       isVerified: boolean;
//     };
//     tokens: {
//       access: string;
//       refresh: string;
//     };
//   };
// }

// export default function LoginPage(): JSX.Element {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [success, setSuccess] = useState<string>("");

// const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
//   e.preventDefault();
//   e.stopPropagation();
//   setLoading(true);
//   setError("");
//   setSuccess("");

//   try {
//     const response = await api.post(endPointApi.login, { email, password });
//     const res: LoginResponse = response.data;

//     if (res.success) {
//       setSuccess("Login successful! Redirecting...");

//       localStorage.setItem("accessToken", res.data.tokens.access);
//       localStorage.setItem("refreshToken", res.data.tokens.refresh);
//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       setTimeout(() => {
//         // ✅ Use replace to prevent back button going to signin
//         navigate("/", { replace: true });
//       }, 1000);
//     } else {
//       setError(res.message || "Invalid email or password. Please try again.");
//     }
//   } catch (err: any) {
//     setError(
//       err?.response?.data?.message ||
//         "Invalid email or password. Please try again.",
//     );
//     console.error("Error logging in:", err);
//   } finally {
//     setLoading(false);
//   }
// };

//   // ✅ Separate handler for password toggle
//   const handleTogglePassword = (): void => {
//     setShowPassword((prev) => !prev);
//   };

//   return (
//     <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 flex items-center justify-center relative overflow-hidden">
//       {/* Background Decorations */}
//       <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-20 blur-3xl animate-pulse" />
//       <div
//         className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-green-300 to-green-400 rounded-full opacity-15 blur-3xl animate-pulse"
//         style={{ animationDelay: "1s" }}
//       />
//       <div
//         className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 transform rotate-12 opacity-10 rounded-lg animate-bounce"
//         style={{ animationDuration: "3s" }}
//       />
//       <div
//         className="absolute bottom-40 right-32 w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 transform -rotate-12 opacity-10 rounded-lg animate-bounce"
//         style={{ animationDuration: "4s", animationDelay: "1s" }}
//       />

//       <div className="w-full max-w-md px-4 relative z-10">
//         {/* Header */}
//         <div className="text-center mb-4">
//           <h1 className="text-3xl font-bold text-[#3B4A7D] mb-1">
//             Tathastu Energy
//           </h1>
//           <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
//             <Zap className="w-3 h-3 text-[#FDB913]" />
//             Powering a Sustainable Future
//           </p>
//         </div>

//         {/* Main Card */}
//         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//           {/* Card Header */}
//           <div className="bg-gradient-to-r from-[#3B4A7D] to-[#2C3A5F] p-4 text-center">
//             <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FDB913] rounded-full mb-2">
//               <Shield className="w-6 h-6 text-white" />
//             </div>
//             <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
//             <p className="text-blue-100 text-xs">
//               Login to access your solar dashboard
//             </p>
//           </div>

//           {/* Card Body */}
//           <div className="p-6">
//             {/* Error Message */}
//             {error && (
//               <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
//                 <span className="text-red-600 text-xs">{error}</span>
//               </div>
//             )}

//             {/* Success Message */}
//             {success && (
//               <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
//                 <span className="text-green-600 text-xs">{success}</span>
//               </div>
//             )}

//             {/* ✅ onSubmit on form tag - correct approach */}
//             <form onSubmit={handleLogin} noValidate className="space-y-4">

//               {/* Email */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1.5">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <Input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB913] focus:border-transparent transition-all"
//                     placeholder="your.email@example.com"
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1.5">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <Input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB913] focus:border-transparent transition-all"
//                     placeholder="Enter your password"
//                   />
//                   {/* ✅ Plain button with type="button" - no custom Button component */}
//                   <button
//                     type="button"
//                     onClick={handleTogglePassword}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="w-4 h-4" />
//                     ) : (
//                       <Eye className="w-4 h-4" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* ✅ Plain button with type="submit" - triggers form onSubmit */}
//               <button
//                 type="submit"
//                 disabled={loading || !email || !password}
//                 className="w-full bg-gradient-to-r from-[#FDB913] to-[#F7931E] text-white py-2.5 rounded-lg text-sm font-semibold hover:from-[#F7931E] hover:to-[#FDB913] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <>
//                     <RefreshCw className="w-4 h-4 animate-spin" />
//                     Logging in...
//                   </>
//                 ) : (
//                   <>
//                     Login
//                     <ArrowRight className="w-4 h-4" />
//                   </>
//                 )}
//               </button>

//             </form>
//           </div>

//           {/* Card Footer */}
//           <div className="bg-gray-50 px-6 py-2.5 border-t border-gray-200">
//             <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
//               <Shield className="w-3 h-3 text-[#6EC177]" />
//               <span>Secured with 256-bit encryption</span>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-3 space-y-1">
//           <p className="text-xs text-gray-600">
//             Need help?{" "}
//             <a
//               href="mailto:support@tathastuentergy.com"
//               className="text-[#3B4A7D] hover:text-[#2C3A5F] font-medium"
//             >
//               Contact us
//             </a>
//           </p>
//           <p className="text-xs text-gray-400">© 2026 Tathastu Energy</p>
//         </div>

//         {/* Stats */}
//         <div className="mt-3 grid grid-cols-3 gap-2">
//           <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
//             <div className="text-lg font-bold text-[#3B4A7D]">500+</div>
//             <div className="text-xs text-gray-600">Installations</div>
//           </div>
//           <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
//             <div className="text-lg font-bold text-[#6EC177]">5MW</div>
//             <div className="text-xs text-gray-600">Generated</div>
//           </div>
//           <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
//             <div className="text-lg font-bold text-[#FDB913]">2000T</div>
//             <div className="text-xs text-gray-600">CO₂ Saved</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, FormEvent, JSX } from "react";
import {
  Mail,
  Lock,
  Zap,
  ArrowRight,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { useNavigate } from "react-router-dom";
import Input from "../form/input/InputField";
import axios from "axios"; // Added for type checking

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      isVerified: boolean;
    };
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(endPointApi.login, { email, password });
      const res: LoginResponse = response.data;

      if (res.success) {
        setSuccess("Login successful! Redirecting...");

        // Store auth data
        localStorage.setItem("accessToken", res.data.tokens.access);
        localStorage.setItem("refreshToken", res.data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Use a slight delay for UX so user sees the success message
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } else {
        setError(res.message || "Invalid email or password.");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid email or password.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Error logging in:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-20 blur-3xl animate-pulse" />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-green-300 to-green-400 rounded-full opacity-15 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-[#3B4A7D] mb-1">
            Tathastu Energy
          </h1>
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-[#FDB913]" />
            Powering a Sustainable Future
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#3B4A7D] to-[#2C3A5F] p-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FDB913] rounded-full mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-blue-100 text-xs">
              Login to access your solar dashboard
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-600 text-xs">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-600 text-xs">{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB913] focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB913] focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    disabled={loading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-[#FDB913] to-[#F7931E] text-white py-2.5 rounded-lg text-sm font-semibold hover:from-[#F7931E] hover:to-[#FDB913] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-6 py-2.5 border-t border-gray-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Shield className="w-3 h-3 text-[#6EC177]" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-3 space-y-1">
          <p className="text-xs text-gray-600">
            Need help?{" "}
            <a
              href="mailto:support@tathastuenergy.com"
              className="text-[#3B4A7D] hover:text-[#2C3A5F] font-medium transition-colors"
            >
              Contact us
            </a>
          </p>
          <p className="text-xs text-gray-400">© 2026 Tathastu Energy</p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
            <div className="text-lg font-bold text-[#3B4A7D]">500+</div>
            <div className="text-xs text-gray-600">Installations</div>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
            <div className="text-lg font-bold text-[#6EC177]">5MW</div>
            <div className="text-xs text-gray-600">Generated</div>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
            <div className="text-lg font-bold text-[#FDB913]">2000T</div>
            <div className="text-xs text-gray-600">CO₂ Saved</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const SignInForm = () => {
//   const [data, setData] = useState([]);
//   const [columns, setColumns] = useState([]);

//   // Excel File Read
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (evt) => {
//       const binaryStr = evt.target.result;
//       const workbook = XLSX.read(binaryStr, { type: "binary" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);

//       setData(jsonData);
//       setColumns(Object.keys(jsonData[0] || {}));
//     };

//     reader.readAsBinaryString(file);
//   };

//   // PDF Generate
//   const generatePDF = () => {
//     const doc = new jsPDF();

//     doc.setFont("helvetica");
//     doc.setFontSize(14);
//     doc.text("Name List", 14, 15);

//     autoTable(doc, {
//       startY: 20,
//       head: [columns],
//       body: data.map((row) => columns.map((col) => row[col])),
//       theme: "grid",
//       styles: {
//         fontSize: 10,
//         textColor: [0, 0, 0], // Black text
//         lineColor: [0, 0, 0], // Black border
//         lineWidth: 0.2,
//       },
//       headStyles: {
//         fillColor: [255, 255, 255], // White header
//         textColor: [0, 0, 0],
//         fontStyle: "bold",
//       },
//     });

//     doc.save("report.pdf");
//   };

//   return (
//     <div style={{ padding: "30px", fontFamily: "Arial" }}>
//       <h2>Excel to PDF Converter</h2>

//       <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

//       {data.length > 0 && (
//         <>
//           <button
//             onClick={generatePDF}
//             style={{
//               marginTop: "20px",
//               padding: "10px 20px",
//               backgroundColor: "black",
//               color: "white",
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             Download PDF
//           </button>

//           <div style={{ marginTop: "30px", overflowX: "auto" }}>
//             <table
//               border="1"
//               cellPadding="8"
//               style={{
//                 borderCollapse: "collapse",
//                 width: "100%",
//                 textAlign: "center",
//               }}
//             >
//               <thead>
//                 <tr>
//                   {columns.map((col, index) => (
//                     <th key={index}>{col}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.map((row, rowIndex) => (
//                   <tr key={rowIndex}>
//                     {columns.map((col, colIndex) => (
//                       <td key={colIndex}>{row[col]}</td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default SignInForm;