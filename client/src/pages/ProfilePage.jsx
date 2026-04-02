// client/src/pages/ProfilePage.jsx
// User can update name, email, currency, monthly budget, theme, and password

import { useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import toast from "react-hot-toast";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name:          user?.name          || "",
    email:         user?.email         || "",
    currency:      user?.currency      || "USD",
    monthlyBudget: user?.monthlyBudget || "",
    theme:         user?.theme         || "light",
    password:      "",
    confirmPassword: "",
  });

  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.name.trim())               errs.name  = "Name is required";
    if (!formData.email)                     errs.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Invalid email";
    if (formData.monthlyBudget && Number(formData.monthlyBudget) < 0) {
      errs.monthlyBudget = "Budget cannot be negative";
    }
    // Password fields are optional — only validate if user typed something
    if (formData.password && formData.password.length < 6) {
      errs.password = "Min 6 characters";
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Only send password if user actually filled it in
      const payload = {
        name:          formData.name,
        email:         formData.email,
        currency:      formData.currency,
        monthlyBudget: Number(formData.monthlyBudget),
        theme:         formData.theme,
        ...(formData.password && { password: formData.password }),
      };

      const { data } = await api.put("/auth/profile", payload);

      // Sync updated info back into AuthContext + localStorage
      updateUser(data);
      toast.success("Profile updated!");

      // Clear password fields after save
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  // ─── Reusable input ───────────────────────────────────────────────────────
  const Field = ({ name, label, type = "text", placeholder, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {children ?? (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors[name]
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600"
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
        />
      )}
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Update your personal info and preferences
        </p>
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white dark:bg-gray-800
                      rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900
                        flex items-center justify-center text-2xl font-bold
                        text-blue-600 dark:text-blue-300 flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Personal info ── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border
                            border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Personal info
          </h2>
          <Field name="name"  label="Full name" placeholder="John Doe" />
          <Field name="email" label="Email"     placeholder="you@example.com" type="email" />
        </section>

        {/* ── Preferences ── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border
                            border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Preferences
          </h2>

          {/* Currency dropdown */}
          <Field name="currency" label="Currency">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300
                         dark:border-gray-600 bg-white dark:bg-gray-700
                         text-gray-900 dark:text-white focus:outline-none
                         focus:ring-2 focus:ring-blue-500 transition"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          {/* Monthly budget */}
          <Field
            name="monthlyBudget"
            label="Monthly budget limit"
            type="number"
            placeholder="e.g. 2000"
          />

          
        </section>

        {/* ── Change password ── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border
                            border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Change password
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Leave blank to keep your current password
            </p>
          </div>
          <Field name="password"        label="New password"     type="password" placeholder="Min 6 characters" />
          <Field name="confirmPassword" label="Confirm password" type="password" placeholder="Repeat new password" />
        </section>

        {/* ── Save button ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                     text-white font-semibold rounded-lg transition-colors
                     flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;