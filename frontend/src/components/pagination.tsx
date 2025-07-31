import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
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
    if (endPage - startPage + 1 < maxVisiblePages && endPage < totalPages) {
        endPage = Math.min(totalPages, endPage + (maxVisiblePages - (endPage - startPage + 1)));
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    const showLeftEllipsis = startPage > 1;
    const showRightEllipsis = endPage < totalPages;

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <nav className="flex items-center gap-1" aria-label="Pagination">
            {/* Bouton "Précédent" */}
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Page précédente"
            >
                <ArrowLeftIcon className="w-2 h-2" />
            </button>

            {/* Première page */}
            {startPage > 1 && (
                <>
                    <button
                        onClick={() => goToPage(1)}
                        className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        1
                    </button>
                    {showLeftEllipsis && (
                        <span className="px-2 text-gray-500 select-none">…</span>
                    )}
                </>
            )}

            {/* Pages centrales */}
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${page === currentPage
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                    aria-current={page === currentPage ? "page" : undefined}
                >
                    {page}
                </button>
            ))}

            {/* Dernière page */}
            {endPage < totalPages && (
                <>
                    {showRightEllipsis && (
                        <span className="px-2 text-gray-500 select-none">…</span>
                    )}
                    <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Bouton "Suivant" */}
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Page suivante"
            >
                <ArrowRightIcon className="w-2 h-2" />
            </button>
        </nav>
    );
};

export default Pagination;