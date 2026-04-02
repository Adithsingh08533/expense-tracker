// client/src/pages/LoginPage.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

const Field = ({ name, label, type = "text", placeholder, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <input
      type={type} name={name} value={value}
      onChange={onChange} placeholder={placeholder}
      className={`input ${error ? "border-red-500 focus:ring-red-500" : ""}`}
    />
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const { login, loading }      = useAuth();
  const navigate                = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.email)                      errs.email    = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email    = "Invalid email";
    if (!formData.password)                   errs.password = "Password is required";
    if (formData.password.length < 6)         errs.password = "Min 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600
                      to-purple-700 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center
                          justify-center text-4xl mx-auto mb-6 backdrop-blur-sm">
            💰
          </div>
          <h1 className="text-4xl font-bold mb-4">ExpenseIQ</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Smart expense tracking with AI-powered insights to help you
            spend wisely and save more.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-10 text-left">
            {["📊 Visual analytics","🎯 Budget alerts",
              "✨ AI insights","📥 Export reports"].map((f) => (
              <div key={f} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-sm font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center
                            justify-center text-2xl mx-auto mb-3 shadow-lg">
              💰
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ExpenseIQ</h1>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
              Sign in to your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field name="email"    label="Email"    type="email"
                placeholder="you@example.com" value={formData.email}
                onChange={handleChange} error={errors.email} />
              <Field name="password" label="Password" type="password"
                placeholder="••••••••" value={formData.password}
                onChange={handleChange} error={errors.password} />

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white
                                     border-t-transparent rounded-full" />
                    Signing in...
                  </>
                ) : "Sign in"}
              </button>
            </form>

            <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
              No account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;