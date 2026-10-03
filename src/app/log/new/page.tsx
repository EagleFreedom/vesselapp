"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Property = {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  year_built: number | null;
  property_type: string | null;
  created_at: string;
};

type FormState = {
  service_type: string;
  service_provider: string;
  service_date: string;
  cost: string;
  service_description: string;
};

const initialForm: FormState = {
  service_type: "Roof",
  service_provider: "",
  service_date: "",
  cost: "",
  service_description: "",
};

export default function NewLogPage() {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error) {
        setProperty(data as Property);
      }
    };

    loadProperty();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!property) return;

    setSubmitting(true);

    const { error } = await supabase.from("service_logs").insert({
      property_id: property.id,
      service_type: form.service_type,
      service_provider: form.service_provider,
      service_date: form.service_date,
      cost: form.cost ? Number(form.cost) : 0,
      service_description: form.service_description,
    });

    if (!error) {
      router.push("/");
    }

    setSubmitting(false);
  };

  if (!property) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              New service
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Add maintenance entry</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            Back to log
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Service type</span>
              <select
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500"
              >
                <option value="Roof">Roof</option>
                <option value="HVAC">HVAC</option>
                <option value="Water Heater">Water Heater</option>
                <option value="Electrical">Electrical</option>
                <option value="General">General</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Provider</span>
              <input
                value={form.service_provider}
                onChange={(e) => setForm({ ...form, service_provider: e.target.value })}
                placeholder="e.g. Summit Roofing Co."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Service date</span>
              <input
                type="date"
                value={form.service_date}
                onChange={(e) => setForm({ ...form, service_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Cost</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={form.service_description}
              onChange={(e) => setForm({ ...form, service_description: e.target.value })}
              rows={5}
              placeholder="Describe what was serviced or repaired."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Save entry"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
