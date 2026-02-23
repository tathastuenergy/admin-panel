// import { useState } from "react";
// import { Link } from "react-router";
// import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
// import Label from "../form/Label";
// import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";

// export default function SignUpForm() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   return (
//     <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
//       <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
//         <Link
//           to="/"
//           className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
//         >
//           <ChevronLeftIcon className="size-5" />
//           Back to dashboard
//         </Link>
//       </div>
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign Up
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Enter your email and password to sign up!
//             </p>
//           </div>
//           <div>
//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
//               <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
//                 <svg
//                   width="20"
//                   height="20"
//                   viewBox="0 0 20 20"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
//                     fill="#4285F4"
//                   />
//                   <path
//                     d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
//                     fill="#34A853"
//                   />
//                   <path
//                     d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
//                     fill="#FBBC05"
//                   />
//                   <path
//                     d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
//                     fill="#EB4335"
//                   />
//                 </svg>
//                 Sign up with Google
//               </button>
//               <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
//                 <svg
//                   width="21"
//                   className="fill-current"
//                   height="20"
//                   viewBox="0 0 21 20"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
//                 </svg>
//                 Sign up with X
//               </button>
//             </div>
//             <div className="relative py-3 sm:py-5">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
//                   Or
//                 </span>
//               </div>
//             </div>
//             <form>
//               <div className="space-y-5">
//                 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//                   {/* <!-- First Name --> */}
//                   <div className="sm:col-span-1">
//                     <Label>
//                       First Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="fname"
//                       name="fname"
//                       placeholder="Enter your first name"
//                     />
//                   </div>
//                   {/* <!-- Last Name --> */}
//                   <div className="sm:col-span-1">
//                     <Label>
//                       Last Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="lname"
//                       name="lname"
//                       placeholder="Enter your last name"
//                     />
//                   </div>
//                 </div>
//                 {/* <!-- Email --> */}
//                 <div>
//                   <Label>
//                     Email<span className="text-error-500">*</span>
//                   </Label>
//                   <Input
//                     type="email"
//                     id="email"
//                     name="email"
//                     placeholder="Enter your email"
//                   />
//                 </div>
//                 {/* <!-- Password --> */}
//                 <div>
//                   <Label>
//                     Password<span className="text-error-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       placeholder="Enter your password"
//                       type={showPassword ? "text" : "password"}
//                     />
//                     <span
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
//                     >
//                       {showPassword ? (
//                         <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
//                       ) : (
//                         <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
//                       )}
//                     </span>
//                   </div>
//                 </div>
//                 {/* <!-- Checkbox --> */}
//                 <div className="flex items-center gap-3">
//                   <Checkbox
//                     className="w-5 h-5"
//                     checked={isChecked}
//                     onChange={setIsChecked}
//                   />
//                   <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
//                     By creating an account means you agree to the{" "}
//                     <span className="text-gray-800 dark:text-white/90">
//                       Terms and Conditions,
//                     </span>{" "}
//                     and our{" "}
//                     <span className="text-gray-800 dark:text-white">
//                       Privacy Policy
//                     </span>
//                   </p>
//                 </div>
//                 {/* <!-- Button --> */}
//                 <div>
//                   <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
//                     Sign Up
//                   </button>
//                 </div>
//               </div>
//             </form>

//             <div className="mt-5">
//               <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
//                 Already have an account? {""}
//                 <Link
//                   to="/signin"
//                   className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
//                 >
//                   Sign In
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, FormEvent, JSX } from "react";
import {
  Sun,
  Mail,
  Lock,
  Zap,
  ArrowRight,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
  };
}

export default function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  // Handle Register
  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet requirements");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(endPointApi.register, {
        email,
        password,
      });
      const res: RegisterResponse = response.data;

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
      console.error("Error registering:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome to Tathastu Energy. Redirecting to login...
          </p>
          <div className="flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#FDB913] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-green-300 to-green-400 rounded-full opacity-15 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div
        className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 transform rotate-12 opacity-10 rounded-lg animate-bounce"
        style={{ animationDuration: "3s" }}
      ></div>
      <div
        className="absolute bottom-40 right-32 w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 transform -rotate-12 opacity-10 rounded-lg animate-bounce"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      ></div>

      <div className="w-full max-w-md px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3 shadow-lg animate-pulse">
            <Sun className="w-10 h-10 text-white" />
          </div> */}
          <h1 className="text-3xl font-bold text-[#3B4A7D] mb-1">
            Tathastu Energy
          </h1>
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-[#FDB913]" />
            Powering a Sustainable Future
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#3B4A7D] to-[#2C3A5F] p-3 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FDB913] rounded-full mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Create Account
            </h2>
            <p className="text-blue-100 text-xs">
              Join us in the solar revolution
            </p>
          </div>

          {/* Card Body */}
          <div className="p-5">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-600 text-xs">{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB913] focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB913] focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div
                      className={`text-xs flex items-center gap-1 ${
                        passwordRequirements.minLength
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          passwordRequirements.minLength
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      At least 6 characters
                    </div>
                    <div
                      className={`text-xs flex items-center gap-1 ${
                        passwordRequirements.hasLetter
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          passwordRequirements.hasLetter
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      Contains letters
                    </div>
                    <div
                      className={`text-xs flex items-center gap-1 ${
                        passwordRequirements.hasNumber
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          passwordRequirements.hasNumber
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      Contains numbers
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB913] focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full bg-gradient-to-r from-[#FDB913] to-[#F7931E] text-white py-2.5 rounded-lg text-sm font-semibold hover:from-[#F7931E] hover:to-[#FDB913] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-[#3B4A7D] hover:text-[#2C3A5F] font-medium"
                >
                  Login
                </Link>
              </p>
            </div>

            {/* <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-yellow-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-yellow-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div> */}
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 px-6 py-2.5 border-t border-gray-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Shield className="w-3 h-3 text-[#6EC177]" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-3 space-y-1">
          <p className="text-xs text-gray-600">
            Need help?{" "}
            <a
              href="mailto:support@tathastuentergy.com"
              className="text-[#3B4A7D] hover:text-[#2C3A5F] font-medium"
            >
              Contact us
            </a>
          </p>
          <p className="text-xs text-gray-400">© 2026 Tathastu Energy</p>
        </div>

        {/* Stats */}
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