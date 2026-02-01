import { ICellRendererParams } from "ag-grid-community";

// Status badge renderer
export interface StatusConfig {
  [key: string]: string;
}

export const defaultStatusColors: StatusConfig = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  online: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cash: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export const StatusBadgeRenderer = (
  props: ICellRendererParams,
  customColors?: StatusConfig,
) => {
  const colors = { ...defaultStatusColors, ...customColors };
  const value = props.value?.toLowerCase() || "";
  const colorClass = colors[value] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
    >
      {props.value?.charAt(0).toUpperCase() + props.value?.slice(1)}
    </span>
  );
};

// Currency renderer (Indian Rupee)
export const CurrencyRenderer = (props: ICellRendererParams) => {
  if (props.value == null) return null;
  return (
    <span>
      ₹{props.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
    </span>
  );
};

// Date renderer
export const DateRenderer = (props: ICellRendererParams) => {
  if (!props.value) return null;
  const date = new Date(props.value);
  return <span>{date.toLocaleDateString("en-IN")}</span>;
};

// Boolean renderer (Yes/No)
export const BooleanRenderer = (props: ICellRendererParams) => {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        props.value
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {props.value ? "Yes" : "No"}
    </span>
  );
};

// Action buttons renderer factory
export const createActionRenderer = (
  actions: {
    label: string;
    onClick: (data: unknown) => void;
    variant?: string;
  }[],
) => {
  return (props: ICellRendererParams) => {
    return (
      <div className="flex items-center gap-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => action.onClick(props.data)}
            className={`px-2 py-1 text-xs rounded ${
              action.variant === "danger"
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : action.variant === "primary"
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };
};
