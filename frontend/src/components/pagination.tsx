export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        // Convertir en affichage basé sur 1
        const displayCurrentPage = currentPage
        const displayTotalPages = totalPages;

        if (displayTotalPages <= maxVisible) {
            for (let i = 1; i <= displayTotalPages; i++) pages.push(i);
        } else {
            const leftOffset = Math.floor(maxVisible / 2);
            const rightOffset = Math.ceil(maxVisible / 2) - 1;

            let start = displayCurrentPage - leftOffset;
            let end = displayCurrentPage + rightOffset;

            if (start < 1) {
                start = 1;
                end = maxVisible;
            } else if (end > displayTotalPages) {
                start = displayTotalPages - (maxVisible - 1);
                end = displayTotalPages;
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }

        return pages;
    };

    if (totalPages <= 1) {
        return <div className="text-sm text-gray-500">Page 1/1</div>;
    }

    return (
        <nav className="flex items-center gap-1">
            <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                &lt;
            </button>

            {getPageNumbers().map((displayPage) => (
                <button
                    key={displayPage}
                    onClick={() => onPageChange(displayPage - 1)} // Convertir en index basé sur 0
                    className={`px-3 py-1 rounded border ${currentPage === displayPage - 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    {displayPage}
                </button>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                &gt;
            </button>
        </nav>
    );
};