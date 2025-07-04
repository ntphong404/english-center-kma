import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import React from "react";

interface CustomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function CustomDialog({ open, onOpenChange, title, children, maxWidth = "max-w-2xl" }: CustomDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`border-1 border-cyan-400 rounded-2xl shadow-xl w-full mx-auto my-8 p-0 ${maxWidth} max-h-[80vh] flex flex-col`}>
                <div className="relative">
                    <DialogHeader className="bg-gradient-to-r from-[#3b70c6] to-[#872ace] text-white rounded-t-md shadow p-[15px] sticky top-0 z-10">
                        <DialogTitle>{title}</DialogTitle>
                        <button
                            className="absolute right-3 top-[3px] text-white bg-white/10 hover:bg-white/30 rounded-full p-1 transition-colors"
                            onClick={() => onOpenChange(false)}
                            aria-label="Đóng"
                            type="button"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </DialogHeader>
                </div>
                <div className="p-4 overflow-y-auto flex-1">{children}</div>
            </DialogContent>
        </Dialog>
    );
} 