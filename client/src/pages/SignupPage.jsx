// Purpose: Signup page with validation + clean reusable field
// Frontend

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

// ✅ Move Field OUTSIDE component (fixes error)
const Field = ({ name, label, type = "text", placeholder, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg border ${
        error
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 dark:border-gray-600"
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (formData.name.trim().length < 2) errs.name = "Name too short";
    if (!formData.email) errs.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Invalid email";
    if (!formData.password) errs.password = "Password is required";
    if (formData.password.length < 6) errs.password = "Min 6 characters";
    if (!formData.confirmPassword) errs.confirmPassword = "Confirm password required";
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await signup(formData.name, formData.email, formData.password);

    if (res.success) {
      toast.success("Account created!");
      navigate("/");
    } else {
      toast.error(res.message);
    }
  };

  // Input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field name="name" label="Name" value={formData.name} onChange={handleChange} error={errors.name} />
          <Field name="email" label="Email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
          <Field name="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
          <Field name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

          <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;