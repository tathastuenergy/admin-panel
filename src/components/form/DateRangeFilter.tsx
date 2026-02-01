import { useState } from "react";
import DatePicker from "./date-picker";

type Option = {
  value: string;
  label: string;
};

interface DateRangeFilterProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  onChange: (value: string, start?: string, end?: string) => void;
  alwaysShowCalendar?: boolean;
  className?: string;
}

function DateRangeFilter({
  options,
  value,
  placeholder,
  onChange,
  className = "",
  alwaysShowCalendar = false,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pendingValue, setPendingValue] = useState<string>("");

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDateRangeAsDates = (val: string): [Date, Date] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (val) {
      case "this_month":
        return [new Date(year, month, 1), new Date(year, month + 1, 0)];

      case "last_month":
        return [new Date(year, month - 1, 1), new Date(year, month, 0)];

      case "this_year":
        return [new Date(year, 0, 1), new Date(year, 11, 31)];

      case "last_year":
        return [new Date(year - 1, 0, 1), new Date(year - 1, 11, 31)];

      default:
        return [today, today];
    }
  };

  const formatYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const handleSelect = (val: string) => {
    setPendingValue(val);

    if (val === "custom") {
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
      setOpen(true);
      return;
    }

    const [start, end] = getDateRangeAsDates(val);

    if (alwaysShowCalendar) {
      setStartDate(start);
      setEndDate(end);
      setOpen(true);
    } else {
      onChange(val, formatDate(start), formatDate(end));
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onChange(pendingValue, formatDate(startDate), formatDate(endDate));
      setOpen(false);
      setPendingValue("");
    }
  };

  return (
    <div className="relative">
      <select
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        value
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
        value={value}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">{placeholder || "Select Range"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {open && (
        <div className="absolute z-50 mt-2 bg-white shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-4 w-full min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {options.find((o) => o.value === pendingValue)?.label ||
                "Select Dates"}
            </h3>
            <button
              onClick={() => {
                setOpen(false);
                setPendingValue("");
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <DatePicker
                id="start-date"
                placeholder="Select date"
                defaultDate={startDate ?? undefined}
                onChange={(selectedDates) => {
                  setStartDate(selectedDates[0] ?? null);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <DatePicker
                id="end-date"
                placeholder="Select date"
                defaultDate={endDate ?? undefined}
                minDate={startDate ?? undefined}
                onChange={(selectedDates) => {
                  setEndDate(selectedDates[0] ?? null);
                }}
              />
            </div>

            {startDate && endDate && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                {formatYYYYMMDD(new Date(startDate))} -{" "}
                {formatYYYYMMDD(new Date(endDate))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangeFilter;
