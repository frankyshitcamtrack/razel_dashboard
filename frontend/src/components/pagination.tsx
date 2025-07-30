export const Pagination = ({
    currentPage,   // 1-based
    totalPages,    // >= 1
    onPageChange,  // reçoit une page 1-based
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) => {
    const maxVisible = 5; // taille du groupe (5)

    if (totalPages <= 1) {
        return <div className="text-sm text-gray-500">Page 1/1</div>;
    }

    // Calcule la fenêtre [start, end] en 1-based
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

    const goto = (p: number) => {
        if (p < 1 || p > totalPages || p === currentPage) return;
        onPageChange(p);
    };

    return (
        <nav className="flex items-center gap-1">
            {/* Précédent */}
            <button
                onClick={() => goto(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Page précédente"
            >
                &lt;
            </button>

            {/* Première + ellipse gauche */}
            {showLeftEllipsis && (
                <>
                    <button
                        onClick={() => goto(1)}
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                    >
                        1
                    </button>
                    <span className="px-2 text-gray-500 select-none">…</span>
                </>
            )}

            {/* Fenêtre de pages */}
            {pages.map((p) => {
                const active = p === currentPage;
                return (
                    <button
                        key={p}
                        onClick={() => goto(p)}
                        className={`px-3 py-1 rounded border text-sm ${active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-100"
                            }`}
                        aria-current={active ? "page" : undefined}
                    >
                        {p}
                    </button>
                );
            })}

            {/* ellipse droite + Dernière */}
            {showRightEllipsis && (
                <>
                    <span className="px-2 text-gray-500 select-none">…</span>
                    <button
                        onClick={() => goto(totalPages)}
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Suivant */}
            <button
                onClick={() => goto(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Page suivante"
            >
                &gt;
            </button>
        </nav>
    );
};
