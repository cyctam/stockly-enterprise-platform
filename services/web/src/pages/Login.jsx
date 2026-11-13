import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardBody, CardHeader } from "../components/ui/Card";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");

    setTimeout(() => {
      setStatus("success");
      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-8 bg-slate-900 text-white shadow-card">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
            Endfield Ltd
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Supply Chain Dashboard
          </h1>
          <p className="mt-4 text-sm text-slate-200">
            Monitor inventory health, purchasing, and inbound stock in one unified
            operations hub built for modern industrial supply chains.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              "Live inventory visibility across warehouses",
              "Automated low-stock alerts and procurement tracking",
              "Daily inflow performance and vendor reliability",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg bg-white/10 px-4 py-3"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 mt-2" />
                <p className="text-sm text-slate-100">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Warehouses", value: "6" },
              { label: "Active Materials", value: "128" },
              { label: "Open Requests", value: "14" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-white/10 px-3 py-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader
            title="Operations Access"
            subtitle="Sign in to manage inventory and procurement workflows."
          />
          <CardBody>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Work email"
                type="email"
                placeholder="ops.supervisor@endfield.com"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange("password")}
                required
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  checked={form.remember}
                  onChange={handleChange("remember")}
                />
                Remember me for this device
              </label>

              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Signing in..." : "Sign in"}
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Demo access enabled</span>
                <button
                  type="button"
                  className="text-slate-700 hover:text-slate-900 font-medium"
                  onClick={() => navigate("/dashboard")}
                >
                  Enter demo mode →
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
