import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    itemLabel = "items"
}: TablePaginationProps) {
    return (
        <div className="flex justify-between items-center mt-4 py-2">
            <div className="text-sm text-gray-500">
                Tổng số: {totalItems} {itemLabel}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                    {Math.max(1, currentPage + 1)} / {Math.max(1, totalPages)}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(Math.max(1, totalPages) - 1, currentPage + 1))}
                    disabled={currentPage >= Math.max(1, totalPages) - 1}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
} 