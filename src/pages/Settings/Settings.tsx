import ComponentCard from "../../components/common/ComponentCard";
import Switch from "../../components/form/switch/Switch";
import { useForm } from "../Context/FormContext";

const Settings = () => {
  const { formStates, setFormEnabled, setAllFormsEnabled } = useForm();

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <ComponentCard title="Master Control">
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Enable All Forms
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toggle all form editing at once
            </p>
          </div>
          <Switch
            label=""
            checked={Object.values(formStates).every(Boolean)}
            onChange={(checked) => setAllFormsEnabled(checked)}
          />
        </div>
      </ComponentCard>

      {/* Individual Form Toggles */}
      <ComponentCard title="Individual Form Controls">
        <div className="space-y-4">
          {/* Profile Form */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Profile Form
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Company profile editing
                </p>
              </div>
            </div>
            <Switch
              label=""
              checked={formStates.profile}
              onChange={(checked) => setFormEnabled("profile", checked)}
            />
          </div>

          {/* Estimate Form */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Estimate Form
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Edit estimates
                </p>
              </div>
            </div>
            <Switch
              label=""
              checked={formStates.estimate}
              onChange={(checked) => setFormEnabled("estimate", checked)}
            />
          </div>

          {/* Invoice Form */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Invoice Form
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Edit invoices
                </p>
              </div>
            </div>
            <Switch
              label=""
              checked={formStates.invoice}
              onChange={(checked) => setFormEnabled("invoice", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-600 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Customer Form
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Edit customers
                </p>
              </div>
            </div>
            <Switch
              label=""
              checked={formStates.customer}
              onChange={(checked) => setFormEnabled("customer", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Inventory Form
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage inventory items
                </p>
              </div>
            </div>
            <Switch
              label=""
              checked={formStates.inventory}
              onChange={(checked) => setFormEnabled("inventory", checked)}
            />
          </div>

          {/* Payment Form */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Payment Form
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Record and edit payments
                </p>
              </div>
            </div>
            <Switch
              label=""
              checked={formStates.payment}
              onChange={(checked) => setFormEnabled("payment", checked)}
            />
          </div>
        </div>
      </ComponentCard>

      {/* Status Summary */}
      <ComponentCard title="Current Status">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusCard
            title="Profile"
            enabled={formStates.profile}
            color="purple"
          />
          <StatusCard
            title="Estimate"
            enabled={formStates.estimate}
            color="blue"
          />
          <StatusCard
            title="Invoice"
            enabled={formStates.invoice}
            color="green"
          />
          <StatusCard
            title="Customer"
            enabled={formStates.customer}
            color="orange"
          />
          <StatusCard
            title="Inventory"
            enabled={formStates.inventory}
            color="red"
          />
          <StatusCard
            title="Payment"
            enabled={formStates.payment}
            color="cyan"
          />
        </div>
      </ComponentCard>
    </div>
  );
};

// Helper component for status cards
const StatusCard = ({
  title,
  enabled,
  color,
}: {
  title: string;
  enabled: boolean;
  color: string;
}) => {
  const colorClasses = {
    purple: enabled
      ? "bg-purple-100 dark:bg-purple-900/30"
      : "bg-gray-100 dark:bg-gray-800",
    blue: enabled
      ? "bg-blue-100 dark:bg-blue-900/30"
      : "bg-gray-100 dark:bg-gray-800",
    green: enabled
      ? "bg-green-100 dark:bg-green-900/30"
      : "bg-gray-100 dark:bg-gray-800",
    orange: enabled
      ? "bg-orange-100 dark:bg-orange-900/30"
      : "bg-gray-100 dark:bg-gray-800",
    red: enabled
      ? "bg-red-100 dark:bg-red-900/30"
      : "bg-gray-100 dark:bg-gray-800",
    cyan: enabled
      ? "bg-cyan-100 dark:bg-cyan-900/30"
      : "bg-gray-100 dark:bg-gray-800",
  };

  return (
    <div
      className={`p-4 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} transition-colors`}
    >
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </p>
      <p
        className={`text-xs mt-1 font-semibold ${
          enabled
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {enabled ? "✓ Enabled" : "✗ Disabled"}
      </p>
    </div>
  );
};

export default Settings;
