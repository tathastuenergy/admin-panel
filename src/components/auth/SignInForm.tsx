import { useState, FormEvent, JSX } from "react";
import {
  Sun,
  Mail,
  Lock,
  Zap,
  ArrowRight,
  Shield,
  RefreshCw,
} from "lucide-react";
import { api } from "../../utils/axiosInstance";
import endPointApi from "../../utils/endPointApi";
import { useNavigate } from "react-router";

// Types and Interfaces
type Step = "email" | "otp";

interface OtpResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    expiresIn: number;
    remainingResends: number;
  };
}

interface VerifyResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      isVerified: boolean;
      createdAt?: string;
    };
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

export default function SignInForm(): JSX.Element {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number>(300); // 5 minutes
  const [remainingResends, setRemainingResends] = useState<number>(3);

  // Handle email submission
  const handleSendOtp = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(endPointApi.login, { email });
      const res: OtpResponse = response.data;

      console.log('res.data.remainingResends', res.data.remainingResends)
      if (res.success) {
        setUserId(res.data.userId);
        setRemainingResends(res.data.remainingResends);
        setRemainingTime(res.data.expiresIn);

        setSuccess("OTP sent successfully! Check your email.");
        setStep("otp");
        startTimer(res.data.expiresIn);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to send OTP. Please try again.",
      );
      console.error("Error sending OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string): void => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`,
      ) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(endPointApi.verifyOtp, {
        userId,
        otp: otpCode,
      });

      const res: VerifyResponse = response.data;

      if (res.success) {
        setSuccess("Login successful! Redirecting...");

        navigate('/')
        // ✅ Save tokens (example: localStorage)
        localStorage.setItem("accessToken", res.data.tokens.access);
        localStorage.setItem("refreshToken", res.data.tokens.refresh);

        // ✅ Optional: store user
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setTimeout(() => {
          // navigate("/dashboard");
          console.log("Logged in user:", res.data.user);
        }, 1000);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Invalid OTP. Please try again.",
      );
      console.error("Error verifying OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
const handleResendOtp = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.post(endPointApi.resendOtp, {
      userId,
    });

    const { expiresIn, remainingResends } = response.data.data;

    setRemainingResends(remainingResends);
    setRemainingTime(expiresIn);
    startTimer(expiresIn);

    setSuccess("OTP resent successfully");
  } catch (err: any) {
    setError(err?.response?.data?.message || "Resend failed");
  } finally {
    setLoading(false);
  }
};

  // Timer countdown
  const startTimer = (seconds: number): void => {
    if (!seconds || isNaN(seconds)) return;

    let timeLeft = seconds;
    const interval = setInterval(() => {
      timeLeft--;
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-orange-300 to-yellow-300 rounded-full opacity-15 blur-3xl animate-pulse"
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
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3 shadow-lg animate-pulse">
            <Sun className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-1">
            Tathastu Energy
          </h1>
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            Powering a Sustainable Future
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-2">
              {step === "email" ? (
                <Mail className="w-6 h-6 text-gray-900" />
              ) : (
                <Shield className="w-6 h-6 text-gray-900" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              {step === "email" ? "Welcome Back" : "Verify OTP"}
            </h2>
            <p className="text-gray-300 text-xs">
              {step === "email"
                ? "Login to access your solar dashboard"
                : "Enter the code sent to your email"}
            </p>
          </div>

          <div className={userId ? "p-4" : "p-6"}>
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

            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <div className="flex gap-1.5 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !digit && index > 0) {
                            document
                              .getElementById(`otp-${index - 1}`)
                              ?.focus();
                          }
                        }}
                        className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Lock className="w-3 h-3" />
                    <span>
                      Expires:{" "}
                      <span className="font-semibold text-orange-600">
                        {formatTime(remainingTime)}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || remainingResends <= 0}
                    className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend ({remainingResends})
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Verify & Login
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 text-xs font-medium transition-colors"
                >
                  ← Change Email
                </button>
              </form>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-2.5 border-t border-gray-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Shield className="w-3 h-3 text-yellow-600" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-3 space-y-1">
          <p className="text-xs text-gray-600">
            Need help?{" "}
            <a
              href="mailto:support@tathastuentergy.com"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Contact us
            </a>
          </p>
          <p className="text-xs text-gray-400">© 2026 Tathastu Energy</p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
            <div className="text-lg font-bold text-yellow-600">500+</div>
            <div className="text-xs text-gray-600">Installations</div>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
            <div className="text-lg font-bold text-green-600">5MW</div>
            <div className="text-xs text-gray-600">Generated</div>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-2 text-center border border-white/60">
            <div className="text-lg font-bold text-blue-600">2000T</div>
            <div className="text-xs text-gray-600">CO₂ Saved</div>
          </div>
        </div>
      </div>
    </div>
  );
}
