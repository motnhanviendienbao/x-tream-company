import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import AppRoutes from "../../../constants/AppRoutes";
import { login } from "../../../services/authService";

type LoginForm = {
  username: string;
  password: string;
};

type AuthError = "INVALID" | "LOCKED" | null;

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<AuthError>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: "onBlur",
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    const result = login(data.username.trim(), data.password);
    if (result.status === "SUCCESS") {
      setAuthError(null);
      navigate(AppRoutes.DASHBOARD);
      return;
    }
    setAuthError(result.status);
  };

  // Khi đang có lỗi đăng nhập (sai mật khẩu / bị khóa) thì cả 2 ô đều viền đỏ.
  const usernameInvalid = !!errors.username || authError !== null;
  const passwordInvalid = !!errors.password || authError !== null;

  const inputClass = (invalid: boolean) =>
    [
      "h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400",
      invalid
        ? "border-[#E11D48] focus:border-[#E11D48]"
        : "border-[#D1D5DB] focus:border-slate-800",
    ].join(" ");

  const usernameReg = register("username", {
    required: "This field is required.",
  });
  const passwordReg = register("password", {
    required: "This field is required.",
  });

  const clearAuthError = () => {
    if (authError) setAuthError(null);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#EDEDED] px-4">
      <div className="w-[340px] rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-[17px] font-bold text-slate-900">User Login</h1>

        {authError && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-[#FDECEC] px-3 py-2">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-[#B42318]" />
            <p className="text-[13px] font-semibold leading-snug text-[#B42318]">
              {authError === "LOCKED" ? (
                <>
                  Too many attempts.
                  <br />
                  Please try again later after 5 minutes.
                </>
              ) : (
                "Invalid username or password. Try again."
              )}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
          {/* Username */}
          <label className="mb-1 block text-[13px] font-semibold text-slate-700">
            Username
          </label>
          <input
            type="text"
            className={inputClass(usernameInvalid)}
            {...usernameReg}
            onChange={(e) => {
              usernameReg.onChange(e);
              clearAuthError();
            }}
          />
          {errors.username && (
            <p className="mt-1 text-[12px] text-[#DC2626]">
              {errors.username.message}
            </p>
          )}

          {/* Password */}
          <label className="mb-1 mt-4 block text-[13px] font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`${inputClass(passwordInvalid)} pr-10`}
              {...passwordReg}
              onChange={(e) => {
                passwordReg.onChange(e);
                clearAuthError();
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-[12px] text-[#DC2626]">
              {errors.password.message}
            </p>
          )}

          {/* Forgot password */}
          <div className="mt-4 flex items-center gap-1.5">
            <span className="cursor-pointer text-[13px] text-slate-600 underline">
              Forgot your password?
            </span>
            <Tooltip
              title="Contact your admin to reset password"
              placement="bottom"
              color="#1f2937"
            >
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#6B7280] text-[11px] font-serif italic leading-none text-white">
                i
              </span>
            </Tooltip>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-5 h-11 w-full rounded-md bg-[#0F172A] text-sm font-medium text-white transition-colors hover:bg-[#1E293B]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
