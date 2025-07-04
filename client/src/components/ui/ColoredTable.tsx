import React from "react";

interface Column {
    title: string;
    sortable?: boolean;
    sortField?: string;
    className?: string;
    headerClassName?: string;
}

interface ColoredTableProps {
    columns?: Column[];
    headers?: string[];
    data: any[];
    renderRow?: (row: any, idx: number) => React.ReactNode[];
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (field: string) => void;
    pageSize?: number;
    emptyMessage?: string;
    totalItems?: number;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

import { ArrowDownNarrowWide, ArrowUpWideNarrow } from "lucide-react";

export default function ColoredTable({
    columns,
    headers,
    data,
    renderRow,
    sortField,
    sortOrder,
    onSort,
    pageSize = 6,
    emptyMessage,
    totalItems,
    currentPage,
    totalPages,
    onPageChange,
}: ColoredTableProps) {
    const hasColumns = !!columns && columns.length > 0;
    return (
        <div className="border rounded-md shadow-lg overflow-hidden mt-3 mb-3">
            <table className="w-full">
                <thead>
                    <tr className="bg-gradient-to-r from-[#3b70c6] to-[#872ace] text-white font-bold">
                        {hasColumns
                            ? columns!.map((col, idx) => (
                                <th key={col.title + idx} className={`px-6 py-4 ${col.headerClassName || ""}`}>
                                    <div className="flex items-center gap-1 text-white">
                                        <span>{col.title}</span>
                                        {col.sortable && col.sortField && onSort && (
                                            <button type="button" onClick={() => onSort(col.sortField!)} className="ml-1">
                                                {sortField === col.sortField ? (
                                                    sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                                ) : (
                                                    <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))
                            : headers?.map((h, idx) => (
                                <th key={h + idx} className="px-6 py-4">{h}</th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && emptyMessage ? (
                        <tr>
                            <td colSpan={hasColumns ? columns!.length : headers?.length || 1} className="text-center py-8 text-gray-500">{emptyMessage}</td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr key={row.id || row.userId || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition`}>
                                {(renderRow ? renderRow(row, idx) : row).map((cell: any, i: number) => (
                                    <td key={i} className="px-6 py-4">{cell}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {/* Optional: Pagination below table if props được truyền */}
            {typeof totalPages === 'number' && totalPages > 1 && onPageChange && (
                <div className="flex justify-end mt-2">
                    {/* Simple pagination, bạn có thể thay bằng TablePagination nếu muốn */}
                    <button
                        className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => onPageChange(Math.max((currentPage || 0) - 1, 0))}
                        disabled={currentPage === 0}
                    >
                        &lt;
                    </button>
                    <span className="px-2">Trang {(currentPage || 0) + 1} / {totalPages}</span>
                    <button
                        className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => onPageChange(Math.min((currentPage || 0) + 1, (totalPages || 1) - 1))}
                        disabled={currentPage === (totalPages || 1) - 1}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
} 