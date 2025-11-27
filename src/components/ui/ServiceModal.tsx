"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: {
        title: string;
        icon: React.ReactNode;
        description: string;
        details?: string;
    } | null;
}

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && service && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-8">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={24} className="text-slate-500" />
                            </button>

                            <div className="mt-8">
                                <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                                    {service.icon}
                                </div>

                                <h2 className="text-3xl font-bold text-slate-900 mb-6">{service.title}</h2>

                                <div className="space-y-6 text-slate-600 leading-relaxed">
                                    <p className="text-lg font-medium text-slate-700">
                                        {service.description}
                                    </p>
                                    {service.details && (
                                        <div className="prose prose-slate">
                                            <p>{service.details}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
