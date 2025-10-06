import React from 'react';
import { motion } from 'framer-motion';

export interface Column<T> {
  header: string;
  accessor: keyof T | string; // Allow string for nested accessors
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: any }> {
  columns: Column<T>[];
  data: T[];
}

const DataTable = <T extends { id: any }>({ columns, data }: DataTableProps<T>) => {
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <motion.tr 
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {columns.map((col) => (
                <td key={String(col.accessor)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {col.render ? col.render(item) : getNestedValue(item, col.accessor as string)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
