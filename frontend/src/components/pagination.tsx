import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) => {
    const maxVisible = 5;

    if (totalPages <= 1) {
        return <div className="text-sm text-gray-500">Page 1 / 1</div>;
    }

    const leftOffset = Math.floor(maxVisible / 2);
    const rightOffset = Math.ceil(maxVisible / 2) - 1;
    let start = currentPage - leftOffset;
    let end = currentPage + rightOffset;

    if (start < 1) {
        start = 1;
        end = Math.min(maxVisible, totalPages);
    } else if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, totalPages - (maxVisible - 1));
    }

    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const showLeftEllipsis = start > 1;
    const showRightEllipsis = end < totalPages;

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <nav className="flex items-center gap-1" aria-label="Pagination">
            {/* Bouton "Précédent" */}
            <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 transition-colors"
                aria-label="Page précédente"
            >
                <ArrowLeftIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>

            {/* Première page */}
            {showLeftEllipsis && (
                <>
                    <button
                        type="button"
                        onClick={() => goToPage(1)}
                        className="w-10 h-10 flex items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        1
                    </button>
                    <span className="px-1 text-gray-500 select-none">…</span>
                </>
            )}

            {/* Pages centrales */}
            {pages.map((page) => {
                const isActive = page === currentPage;
                return (
                    <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded text-sm font-medium transition-colors ${isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Dernière page */}
            {showRightEllipsis && (
                <>
                    <span className="px-1 text-gray-500 select-none">…</span>
                    <button
                        type="button"
                        onClick={() => goToPage(totalPages)}
                        className="w-10 h-10 flex items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Bouton "Suivant" */}
            <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 transition-colors"
                aria-label="Page suivante"
            >
                <ArrowRightIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
        </nav>
    );
};
export default Pagination;