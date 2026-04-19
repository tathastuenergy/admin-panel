import React from 'react';
import { MoreVertical, Table, FileText } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

interface Props {
  data: any[];
  columns: { header: string; key: string; width: number }[];
  filename: string;
  title: string;
}

const ExportButton = ({ data, columns, filename, title }: Props) => {
  return (
    <div className="relative group">
      <button className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 shadow-sm text-gray-600">
        <MoreVertical size={20} />
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        <div className="flex flex-col">
          <button
            onClick={() => exportToExcel(data, columns, filename)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors border-b border-gray-50"
          >
            <Table size={18} className="text-green-600" /> Download Excel
          </button>
          <button
            onClick={() => exportToPDF(data, columns, filename, title)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors"
          >
            <FileText size={18} className="text-red-600" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButton;