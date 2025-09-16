import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false
}) => {
    const maxVisiblePages = 5;

    if (totalPages <= 1) {
        return (
            <div className="text-sm text-gray-500">
                Page 1 / 1
            </div>
        );
    }

    // Calcul des pages à afficher
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajuster si on est trop près de la fin
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    const showLeftEllipsis = startPage > 2;
    const showRightEllipsis = endPage < totalPages - 1;

    const goToPage = (page: number) => {
        if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    // Raccourcis clavier
    const handleKeyDown = (event: React.KeyboardEvent, page: number) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goToPage(page);
        }
    };

    return (
        <nav className="flex items-center gap-1" aria-label="Pagination">
            {/* Bouton "Précédent" */}
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={disabled || currentPage === 1}
                className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[40px] flex items-center justify-center"
                aria-label="Page précédente"
                onKeyDown={(e) => handleKeyDown(e, currentPage - 1)}
            >
                <ArrowLeftIcon className="w-4 h-4" />
            </button>

            {/* Première page */}
            {startPage > 1 && (
                <>
                    <button
                        onClick={() => goToPage(1)}
                        disabled={disabled}
                        className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[40px]"
                        onKeyDown={(e) => handleKeyDown(e, 1)}
                    >
                        1
                    </button>
                    {showLeftEllipsis && (
                        <span className="px-2 text-gray-500 select-none flex items-center">…</span>
                    )}
                </>
            )}

            {/* Pages centrales */}
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => goToPage(page)}
                    disabled={disabled}
                    className={`px-3 py-2 rounded text-sm font-medium transition min-w-[40px] ${page === currentPage
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-current={page === currentPage ? "page" : undefined}
                    onKeyDown={(e) => handleKeyDown(e, page)}
                >
                    {page}
                </button>
            ))}

            {/* Dernière page */}
            {endPage < totalPages && (
                <>
                    {showRightEllipsis && (
                        <span className="px-2 text-gray-500 select-none flex items-center">…</span>
                    )}
                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={disabled}
                        className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[40px]"
                        onKeyDown={(e) => handleKeyDown(e, totalPages)}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Bouton "Suivant" */}
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={disabled || currentPage === totalPages}
                className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[40px] flex items-center justify-center"
                aria-label="Page suivante"
                onKeyDown={(e) => handleKeyDown(e, currentPage + 1)}
            >
                <ArrowRightIcon className="w-4 h-4" />
            </button>

            {/* Affichage informatif (optionnel) */}
            <span className="ml-2 text-sm text-gray-600 hidden md:block">
                Page {currentPage} sur {totalPages}
            </span>
        </nav>
    );
};

export default Pagination;