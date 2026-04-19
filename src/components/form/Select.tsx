// import React, { useEffect, useState, useRef } from "react";
// import { Plus, ChevronDown, Search } from "lucide-react";

// interface Option {
//   value: string;
//   label: string;
//   email?: string; // Optional for customer display
// }

// interface SelectProps {
//   options: Option[];
//   placeholder?: string;
//   onChange: (value: string) => void;
//   className?: string;
//   defaultValue?: string;
//   value?: string;
//   showAddButton?: boolean; // New prop
//   onAddNew?: () => void; // New prop for add button click
//   addButtonText?: string; // New prop
//   searchable?: boolean;
// }

// const Select: React.FC<SelectProps> = ({
//   options,
//   placeholder = "Select an option",
//   onChange,
//   className = "",
//   defaultValue = "",
//   value = "",
//   showAddButton = false,
//   onAddNew,
//   addButtonText = "Add New",
//   searchable = true,
// }) => {
//   const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const searchInputRef = useRef<HTMLInputElement>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     setSelectedValue(value);
//   }, [value]);

//   useEffect(() => {
//     if (isOpen && searchInputRef.current) {
//       searchInputRef.current.focus();
//     }
//     if (!isOpen) {
//       setSearchQuery("");
//     }
//   }, [isOpen]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSelect = (val: string) => {
//     setSelectedValue(val);
//     onChange(val);
//     setIsOpen(false);
//   };

//   const filteredOptions = options.filter(
//     (option) =>
//       option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       option.email?.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   const selectedOption =
//     options?.find((opt) => opt.value === selectedValue) || null;
//   // If showAddButton is true, use custom dropdown
//   if (showAddButton) {
//     return (
//       <div className="relative" ref={dropdownRef}>
//         <button
//           type="button"
//           onClick={() => setIsOpen(!isOpen)}
//           className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-left flex items-center justify-between ${
//             selectedValue
//               ? "text-gray-800 dark:text-white/90"
//               : "text-gray-400 dark:text-gray-400"
//           } ${className}`}
//         >
//           <span className="truncate">
//             {selectedOption ? selectedOption.label : placeholder}
//           </span>
//           <ChevronDown
//             className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${
//               isOpen ? "rotate-180" : ""
//             }`}
//           />
//         </button>

//         {isOpen && (
//           <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
//             {/* Search Input */}
//             {searchable && (
//               <div className="p-3 border-b border-gray-200 dark:border-gray-700">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <input
//                     ref={searchInputRef}
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search..."
//                     className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//                     onClick={(e) => e.stopPropagation()}
//                   />
//                 </div>
//               </div>
//             )}
//             {/* Add New Button */}
//             {onAddNew && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   onAddNew();
//                   setIsOpen(false);
//                 }}
//                 className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium transition"
//               >
//                 <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
//                   <Plus className="h-3 w-3" />
//                 </div>
//                 <div>
//                   <div className="text-sm font-semibold">{addButtonText}</div>
//                   <div className="text-xs text-blue-500 dark:text-blue-400">
//                     Create a new record
//                   </div>
//                 </div>
//               </button>
//             )}

//             {/* Options List */}
//             <div className="max-h-64 overflow-y-auto">
//               {filteredOptions.length > 0 ? (
//                 filteredOptions.map((option) => (
//                   <button
//                     key={option.value}
//                     type="button"
//                     onClick={() => handleSelect(option.value)}
//                     className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition ${
//                       selectedValue === option.value
//                         ? "bg-blue-50 dark:bg-gray-800"
//                         : ""
//                     }`}
//                   >
//                     <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
//                       {option.label.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="text-sm font-medium text-gray-900 dark:text-white/90 truncate">
//                         {option.label}
//                       </div>
//                       {option.email && (
//                         <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                           {option.email}
//                         </div>
//                       )}
//                     </div>
//                     {selectedValue === option.value && (
//                       <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
//                         <svg
//                           className="h-3 w-3"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       </div>
//                     )}
//                   </button>
//                 ))
//               ) : (
//                 <div className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
//                   {searchQuery
//                     ? `No results found for "${searchQuery}"`
//                     : "No options available"}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // Default select (without custom dropdown)
//   return (
//     <select
//       className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
//         selectedValue
//           ? "text-gray-800 dark:text-white/90"
//           : "text-gray-400 dark:text-gray-400"
//       } ${className}`}
//       value={selectedValue}
//       onChange={(e) => {
//         const val = e.target.value;
//         setSelectedValue(val);
//         onChange(val);
//       }}
//     >
//       <option
//         value=""
//         disabled
//         className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
//       >
//         {placeholder}
//       </option>
//       {options.map((option) => (
//         <option
//           key={option.value}
//           value={option.value}
//           className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
//         >
//           {option.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default Select;
import React, { useEffect, useState, useRef } from "react";
import { Plus, ChevronDown, Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
  email?: string; // Optional for customer display
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  showAddButton?: boolean;
  onAddNew?: () => void;
  addButtonText?: string;
  searchable?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value = "",
  showAddButton = false,
  onAddNew,
  addButtonText = "Add New",
  searchable = true,
  disabled = false,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    if (isOpen && searchInputRef.current && !disabled) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, disabled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    if (disabled) return;
    setSelectedValue(val);
    onChange(val);
    setIsOpen(false);
  };

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedOption =
    options?.find((opt) => opt.value === selectedValue) || null;

  // Always use custom dropdown for consistent premium design
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-left flex items-center justify-between ${
          selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
            : "cursor-pointer"
        } ${className}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          {/* Add New Button */}
          {showAddButton && onAddNew && (
            <button
              type="button"
              onClick={() => {
                onAddNew();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium transition"
            >
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Plus className="h-3 w-3" />
              </div>
              <div>
                <div className="text-sm font-semibold">{addButtonText}</div>
                <div className="text-xs text-blue-500 dark:text-blue-400">
                  Create a new record
                </div>
              </div>
            </button>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition ${
                    selectedValue === option.value
                      ? "bg-blue-50 dark:bg-gray-800"
                      : ""
                  }`}
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    {option.label.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white/90 truncate">
                      {option.label}
                    </div>
                    {option.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {option.email}
                      </div>
                    )}
                  </div>
                  {selectedValue === option.value && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "No options available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;