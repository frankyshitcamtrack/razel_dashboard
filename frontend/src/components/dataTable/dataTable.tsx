// DataTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchData } from "../../api/api";
import type { PaginatedResponse, PaginationParams } from "../../api/api";
import { Pagination } from "../pagination";
import { exportData } from "../../utils/exportData";

type DataType = "list_exceptions" | "list_heuremoteur";

type ColumnDef<T = any> = {
    header: string;
    accessor: keyof T | string;
    format?: (val: any, row?: T) => React.ReactNode;
    width?: number;
};

const formatDateFR = (val?: string) =>
    val ? new Date(val).toLocaleDateString("fr-FR") : "-";

const DataTable: React.FC<{ dataType: DataType }> = ({ dataType }) => {
    type ExportFormat = "excel" | "csv" | "pdf";

    const [data, setData] = useState<PaginatedResponse<any>>({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);

    const [filters, setFilters] = useState<PaginationParams>({
        page: 1,
        limit: 10,
    });

    const columns: ColumnDef[] = useMemo(() => {
        if (dataType === "list_exceptions") {
            return [
                { header: "ID", accessor: "ids", width: 80 },
                { header: "Date", accessor: "dates", format: formatDateFR, width: 120 },
                { header: "Véhicule ID", accessor: "vcleid", width: 120 },
                { header: "Nombre de speedings", accessor: "nbrsp", width: 160 },
                { header: "Nombre de Hash braking", accessor: "nbrhb", width: 180 },
                { header: "Nombre de Hash Acceleration", accessor: "nbha", width: 200 },
                { header: "Groupe de Véhicule", accessor: "groupid", width: 160 },
            ];
        }

        return [
            { header: "ID", accessor: "ids", width: 80 },
            { header: "Véhicule", accessor: "vcleid", width: 100 },
            { header: "Date", accessor: "dates", format: formatDateFR, width: 120 },
            { header: "Durée totale", accessor: "dureetotal", format: (v: string) => v || "-", width: 120 },
            { header: "Durée en mouvement", accessor: "dureel", format: (v: string) => v || "-", width: 140 },
            { header: "Arrêt moteur", accessor: "arretmoteurtournant", format: (v: string) => v || "-", width: 140 },
            {
                header: "Distance (km)",
                accessor: "distancekm",
                format: (v: number) => (typeof v === "number" ? v.toFixed(2) : v ?? 0),
                width: 120,
            },
            {
                header: "Vitesse max",
                accessor: "vmax",
                format: (v: number) => (v != null && !Number.isNaN(v) ? `${v} km/h` : "-"),
                width: 120,
            },
            {
                header: "Utilisation (%)",
                accessor: "percentuse",
                format: (v: number) => (v != null && !Number.isNaN(v) ? `${v.toFixed(1)}%` : "-"),
                width: 140,
            },
            {
                header: "Consommation totale",
                accessor: "consototal",
                format: (v: number) => (v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00"),
                width: 160,
            },
            {
                header: "Conso/100km",
                accessor: "conso100km",
                format: (v: number) => (v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00"),
                width: 140,
            },
            {
                header: "Conso/h",
                accessor: "consolitperhour",
                format: (v: number) => (v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00"),
                width: 120,
            },
            { header: "Groupe", accessor: "groupid", width: 120 },
        ];
    }, [dataType]);

    const getRowId = (row: any) =>
        dataType === "list_heuremoteur" ? row.ids ?? row.id : row.id ?? row.ids;


    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchData(dataType, filters);
                if (!cancelled) setData(result);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Erreur inconnue");
                console.error("Erreur fetchData:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [dataType, filters]);


    const updateFilters = (patch: Partial<PaginationParams>, resetPage = true) =>
        setFilters((prev) => ({ ...prev, ...(resetPage ? { page: 1 } : {}), ...patch }));

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const limit = Number(e.target.value);
        updateFilters({ limit }, true);
    };

    const handleStartDateChange = (val: string) => {
        const iso = val ? new Date(val).toISOString().split("T")[0] : undefined;
        setStartDate(iso);
        updateFilters({ dateFrom: iso, dateTo: endDate }, true);
    };

    const handleEndDateChange = (val: string) => {
        const iso = val ? new Date(val).toISOString().split("T")[0] : undefined;
        setEndDate(iso);
        updateFilters({ dateFrom: startDate, dateTo: iso }, true);
    };

    const handleVehicleChange = (val: string) => {
        const v = val.trim();
        updateFilters({ vehicleId: v === "" ? undefined : Number(v) }, true);
    };

    const renderCell = (row: any, col: ColumnDef) => {
        const value = row[col.accessor as string];
        return col.format ? col.format(value, row) : value ?? "-";
    };

    const handleExport = async (format: ExportFormat) => {
        try {
            const response = await fetchData(dataType, filters);
            await exportData(
                format,
                response.data,
                dataType,
                `${dataType}_${new Date().toISOString().split("T")[0]}`
            );
        } catch (error) {
            console.error(`Erreur lors de l'export ${format}:`, error);
        }
    };


    const page = data.pagination.page ?? filters.page ?? 1;
    const limit = data.pagination.limit ?? filters.limit ?? 10;
    const safeTotalPages =
        data.pagination.totalPages && data.pagination.totalPages > 0
            ? data.pagination.totalPages
            : Math.max(1, Math.ceil((data.pagination.total ?? 0) / limit));


    useEffect(() => {
        if (page > safeTotalPages) {
            setFilters((prev) => ({ ...prev, page: safeTotalPages }));
        } else if (page < 1) {
            setFilters((prev) => ({ ...prev, page: 1 }));
        }

    }, [safeTotalPages]);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                    {/* Filtres (gauche) */}
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex items-center gap-2">
                            <label htmlFor="dateFrom" className="text-sm font-medium">Date début :</label>
                            <input
                                id="dateFrom"
                                type="date"
                                value={startDate ?? ""}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="h-10 w-44 border rounded-md px-3"
                            />
                            <span className="text-sm">à</span>
                            <label htmlFor="dateTo" className="sr-only">Date fin</label>
                            <input
                                id="dateTo"
                                type="date"
                                value={endDate ?? ""}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                className="h-10 w-44 border rounded-md px-3"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="vehicle" className="text-sm font-medium">Véhicule ID :</label>
                            <input
                                id="vehicle"
                                type="number"
                                inputMode="numeric"
                                placeholder="ex: 42"
                                onChange={(e) => handleVehicleChange(e.target.value)}
                                className="h-10 w-28 border rounded-md px-3"
                            />
                        </div>
                    </div>

                    {/* Boutons (droite) */}
                    <div className="flex items-center gap-2 md:justify-end shrink-0">
                        <button
                            onClick={() => handleExport('excel')}
                            className="h-10 inline-flex items-center gap-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            <span>Excel</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => handleExport('csv')}
                            className="h-10 inline-flex items-center gap-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <span>CSV</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>

                        <button
                            onClick={() => handleExport('pdf')}
                            className="h-10 inline-flex items-center gap-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            <span>PDF</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>



            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                    {error}
                </div>
            )}

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.accessor)}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    style={col.width ? { width: col.width } : undefined}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-6 text-center text-gray-500">
                                    Chargement…
                                </td>
                            </tr>
                        ) : data.data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-6 text-center text-gray-500">
                                    Aucune donnée disponible
                                </td>
                            </tr>
                        ) : (
                            data.data.map((item: any) => (
                                <tr key={getRowId(item)}>
                                    {columns.map((col) => (
                                        <td
                                            key={`${getRowId(item)}-${String(col.accessor)}`}
                                            className="px-6 py-3 whitespace-nowrap truncate"
                                        >
                                            {renderCell(item, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                        Affichage de{" "}
                        {data.pagination.total === 0 ? 0 : (page - 1) * limit + 1}{" "}
                        à{" "}
                        {Math.min(page * limit, data.pagination.total)}{" "}
                        sur {data.pagination.total} éléments
                    </span>

                    <label htmlFor="limit" className="text-sm text-gray-600">/ page</label>
                    <select
                        id="limit"
                        value={filters.limit}
                        onChange={handleLimitChange}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        {[10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={safeTotalPages}
                    onPageChange={(p) => handlePageChange(p)}
                />
            </div>
        </div>
    );
};

export default DataTable;
