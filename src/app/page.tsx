import {
  Bell,
  CalendarDays,
  ChevronRight,
  Droplets,
  Home,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Property = {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  year_built: number | null;
  property_type: string | null;
  created_at: string;
};

type ServiceLog = {
  id: string;
  property_id: string;
  service_type: string;
  service_provider: string | null;
  service_date: string | null;
  cost: number | null;
  service_description: string | null;
};

function formatCurrency(value: number | null) {
  if (value === null) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string | null) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HomePage() {
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .limit(1)
    .maybeSingle();

  let serviceLogs: ServiceLog[] = [];

  if (property?.id) {
    const { data, error } = await supabase
      .from("service_logs")
      .select("*")
      .eq("property_id", property.id)
      .order("service_date", { ascending: false });

    if (!error) {
      serviceLogs = data ?? [];
    }
  }

  const systemCards = [
    { name: "Roof", age: "9 yrs", status: "Good", icon: ShieldCheck, tone: "green" },
    { name: "HVAC", age: "7 yrs", status: "Serviced", icon: Sparkles, tone: "blue" },
    { name: "Water Heater", age: "6 yrs", status: "Normal", icon: Droplets, tone: "cyan" },
    { name: "Electrical", age: "Pending", status: "Review", icon: Wrench, tone: "amber" },
  ];

  const timelineEntries = serviceLogs.map((entry, index) => ({
    id: entry.id,
    type: entry.service_type,
    date: formatDate(entry.service_date),
    provider: entry.service_provider ?? "Provider",
    cost: formatCurrency(entry.cost),
    description: entry.service_description ?? "No description provided.",
    tone: ["blue", "green", "cyan"][index % 3],
  }));

  if (propertyError || !property) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">No property found</h1>
          <p className="mt-3 text-slate-600">
            There isn’t a property row available for this user yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Vessel
              </p>
              <h1 className="text-lg font-semibold">Home Health Overview</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Bell className="h-4 w-4" />
              Alerts
            </button>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Transfer Home
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-lg">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Property record
                </p>
                <h2 className="mt-2 text-3xl font-semibold">{property.address}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  {property.city}, {property.state}
                </p>
              </div>
              <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-200">
                Healthy
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Age</p>
                <p className="mt-3 text-2xl font-semibold">
                  {property.year_built ? `${new Date().getFullYear() - property.year_built} yrs` : "N/A"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Last Service</p>
                <p className="mt-3 text-2xl font-semibold">
                  {timelineEntries[0]?.date ?? "No service"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Warranty</p>
                <p className="mt-3 text-2xl font-semibold">{timelineEntries.length} docs</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Home status
              </p>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                On track
              </span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-4xl font-semibold">87%</span>
                <span className="text-sm text-slate-500">This year</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[87%] rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Routine maintenance</span>
                <span className="font-medium text-slate-900">{timelineEntries.length} updates</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Overdue items</span>
                <span className="font-medium text-amber-600">
                  {timelineEntries.length > 0 ? "0 review" : "1 review"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Documents stored</span>
                <span className="font-medium text-slate-900">
                  {timelineEntries.length + 2} files
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Core systems</h3>
            <button className="text-sm font-medium text-blue-700">View all</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {systemCards.map(({ name, age, status, icon: Icon, tone }) => (
              <div
                key={name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      tone === "green"
                        ? "bg-emerald-100 text-emerald-700"
                        : tone === "blue"
                          ? "bg-blue-100 text-blue-700"
                          : tone === "cyan"
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {status}
                  </span>
                </div>

                <p className="text-sm text-slate-500">{name}</p>
                <p className="mt-2 text-2xl font-semibold">{age}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Service timeline
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Maintenance log</h3>
            </div>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add entry
            </button>
          </div>

          <div className="space-y-4">
            {timelineEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No maintenance records yet.
              </div>
            ) : (
              timelineEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${
                          entry.tone === "blue"
                            ? "bg-blue-100 text-blue-700"
                            : entry.tone === "green"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        <CalendarDays className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{entry.type}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-600">
                            {entry.provider}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{entry.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-900">{entry.cost}</span>
                      <button className="flex items-center gap-1 text-sm font-medium text-blue-700">
                        View receipt <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{entry.description}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
