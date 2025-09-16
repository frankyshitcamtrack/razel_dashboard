// DataTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchData } from "../../api/api";
import type { PaginatedResponse, PaginationParams } from "../../api/api";
import Pagination from "../pagination";
import { exportData } from "../../utils/exportData";
import { useVehiclesGroupData } from "../../hooks/useVehiclesGroupData";

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
    const { data: vehicleGroups, isLoading: groupLoading } = useVehiclesGroupData();

    type ExportFormat = "excel" | "csv" | "pdf";

    const [data, setData] = useState<PaginatedResponse<any>>({
        data: [],
        pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10
        },
    });
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState<ExportFormat | null>(null);
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
                { header: "ID", accessor: "ids" },
                { header: "Date", accessor: "dates", format: formatDateFR },
                { header: "Véhicule", accessor: "vehicle_name" },
                { header: "Nombre de speedings", accessor: "nbrsp" },
                { header: "Nombre de Hash braking", accessor: "nbrhb" },
                { header: "Nombre de Hash Acceleration", accessor: "nbha" },
                { header: "Groupe du Véhicule", accessor: "group_name" },
            ];
        }

        return [
            { header: "ID", accessor: "ids" },
            { header: "Véhicule", accessor: "vehicle_name" },
            { header: "Date", accessor: "dates", format: formatDateFR },
            { header: "Durée totale", accessor: "dureetotal", format: (v: string) => v || "-" },
            { header: "Durée en mouvement", accessor: "dureel", format: (v: string) => v || "-" },
            { header: "Arrêt moteur", accessor: "arretmoteurtournant", format: (v: string) => v || "-" },
            {
                header: "Distance (km)",
                accessor: "distancekm",
                format: (v: number) => (typeof v === "number" ? v.toFixed(2) : v ?? 0),
            },
            {
                header: "Vitesse max",
                accessor: "vmax",
                format: (v: number) => (v != null && !Number.isNaN(v) ? `${v} km/h` : "-"),
            },
            {
                header: "Utilisation (%)",
                accessor: "percentuse",
                format: (v: number) => (v != null && !Number.isNaN(v) ? `${v.toFixed(1)}%` : "-"),
            },
            {
                header: "Consommation totale",
                accessor: "consototal",
                format: (v: number) => (v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00"),
            },
            {
                header: "Conso/100km",
                accessor: "conso100km",
                format: (v: number) => (v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00"),
            },
            {
                header: "Conso/h",
                accessor: "consolitperhour",
                format: (v: number) => (v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00"),
            },
            { header: "Groupe du Véhicule", accessor: "group_name" },
        ];
    }, [dataType]);

    const getRowId = (row: any) =>
        dataType === "list_heuremoteur" ? row.ids ?? row.id : row.id ?? row.ids;

    useEffect(() => {
        const abortController = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchData(dataType, filters, abortController.signal);
                if (!abortController.signal.aborted) {
                    setData(result);
                }
            } catch (e: any) {
                if (!abortController.signal.aborted && e.name !== 'AbortError') {
                    setError(e?.message ?? "Erreur inconnue");
                    console.error("Erreur fetchData:", e);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            abortController.abort();
        };
    }, [dataType, filters]);

    const updateFilters = (patch: Partial<PaginationParams>, resetPage = true) =>
        setFilters((prev) => ({
            ...prev,
            ...(resetPage ? { page: 1 } : {}),
            ...patch
        }));

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
        updateFilters({ date1: iso, date2: endDate }, true);
    };

    const handleEndDateChange = (val: string) => {
        const iso = val ? new Date(val).toISOString().split("T")[0] : undefined;
        setEndDate(iso);
        updateFilters({ date1: startDate, date2: iso }, true);
    };

    const handleVehicleGroupChange = (val: string) => {
        const v = val.trim();
        updateFilters({ vehicleGroupId: v === "" ? undefined : Number(v) }, true);
    };

    const renderCell = (row: any, col: ColumnDef) => {
        const value = row[col.accessor as string];
        return col.format ? col.format(value, row) : value ?? "-";
    };

    const handleExport = async (format: ExportFormat) => {
        try {
            setExportLoading(format);


            const exportFilters = {
                ...filters,
                date1: filters.date1,
                date2: filters.date2,
                vehicleGroupId: filters.vehicleGroupId,
                vehicleId: filters.vehicleId
            };


            const exportParams = {
                ...exportFilters,

            };

            const response = await fetchData(dataType, exportParams);

            if (!response.data || response.data.length === 0) {
                throw new Error('Aucune donnée à exporter avec les filtres actuels');
            }


            const fileName = generateExportFileName(dataType, filters);

            await exportData(format, response.data, dataType, {
                fileName,
                includeDateInFileName: false
            });

        } catch (error) {
            console.error(`Erreur lors de l'export ${format}:`, error);
            setError(`Erreur lors de l'export: ${error}`);
        } finally {
            setExportLoading(null);
        }
    };


    const generateExportFileName = (dataType: DataType, filters: PaginationParams): string => {
        const baseName = dataType === 'list_exceptions' ? 'exceptions' : 'heures_moteur';

        const parts = [baseName];


        if (filters.date1 && filters.date2) {
            const startDate = new Date(filters.date1).toLocaleDateString('fr-FR').replace(/\//g, '-');
            const endDate = new Date(filters.date2).toLocaleDateString('fr-FR').replace(/\//g, '-');
            parts.push(`du_${startDate}_au_${endDate}`);
        } else if (filters.date1) {
            const startDate = new Date(filters.date1).toLocaleDateString('fr-FR').replace(/\//g, '-');
            parts.push(`a_partir_du_${startDate}`);
        } else if (filters.date2) {
            const endDate = new Date(filters.date2).toLocaleDateString('fr-FR').replace(/\//g, '-');
            parts.push(`jusqu_au_${endDate}`);
        }


        if (filters.vehicleGroupId) {
            const groupName = vehicleGroups?.find(g => g.ids === filters.vehicleGroupId)?.names || filters.vehicleGroupId;
            parts.push(`groupe_${groupName.toString().replace(/\s+/g, '_')}`);
        }


        parts.push(new Date().toISOString().split('T')[0].replace(/-/g, ''));

        return parts.join('_');
    };

    const page = data?.pagination?.currentPage ?? filters.page ?? 1;
    const limit = data?.pagination?.itemsPerPage ?? filters.limit ?? 10;
    const totalItems = data?.pagination?.totalItems ?? 0;
    const safeTotalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));

    useEffect(() => {
        if (page > safeTotalPages && safeTotalPages > 0) {
            setFilters((prev) => ({ ...prev, page: safeTotalPages }));
        } else if (page < 1) {
            setFilters((prev) => ({ ...prev, page: 1 }));
        }
    }, [safeTotalPages, page]);

    const getExportButtonText = (format: ExportFormat) => {
        if (exportLoading === format) return "Export...";
        return format.toUpperCase();
    };

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
                            <select
                                name="vcleGroupId"
                                value={filters.vehicleGroupId ?? ""}
                                onChange={(e) => handleVehicleGroupChange(e.target.value)}
                                className="w-64 py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                disabled={groupLoading}
                            >
                                <option value="">Tous les groupes</option>
                                {groupLoading ? (
                                    <option disabled>Chargement...</option>
                                ) : (
                                    vehicleGroups?.map(group => (
                                        <option key={group.ids} value={group.ids ?? ""}>
                                            {group.names}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Boutons (droite) */}
                    <div className="flex items-center gap-2 md:justify-end shrink-0">
                        {(['excel', 'csv', 'pdf'] as ExportFormat[]).map((format) => (
                            <button
                                key={format}
                                onClick={() => handleExport(format)}
                                disabled={exportLoading !== null}
                                className={`h-10 inline-flex items-center gap-2 px-4 rounded-md ${exportLoading === format
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : format === 'excel'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : format === 'csv'
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    } text-white`}
                            >
                                <span>{getExportButtonText(format)}</span>
                                {exportLoading !== format && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="float-right text-red-800 hover:text-red-900"
                    >
                        ×
                    </button>
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
                                    <div className="flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                        <span className="ml-2">Chargement des données...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-6 text-center text-gray-500">
                                    {filters.date1 || filters.date2 || filters.vehicleGroupId
                                        ? "Aucune donnée correspondant aux filtres"
                                        : "Aucune donnée disponible"
                                    }
                                </td>
                            </tr>
                        ) : (
                            data.data.map((item: any) => (
                                <tr key={getRowId(item)} className="hover:bg-gray-50">
                                    {columns.map((col) => (
                                        <td
                                            key={`${getRowId(item)}-${String(col.accessor)}`}
                                            className="px-6 py-3 whitespace-nowrap truncate"
                                            title={String(item[col.accessor as string] || '')}
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
            {!loading && data.data.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                            Affichage de{" "}
                            {totalItems === 0 ? 0 : (page - 1) * limit + 1}{" "}
                            à{" "}
                            {Math.min(page * limit, totalItems)}{" "}
                            sur {totalItems} éléments
                        </span>

                        <label htmlFor="limit" className="text-sm text-gray-600">/ page</label>
                        <select
                            id="limit"
                            value={filters.limit}
                            onChange={handleLimitChange}
                            className="border rounded px-2 py-1 text-sm"
                            disabled={loading}
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
                        onPageChange={handlePageChange}
                        disabled={loading}
                    />
                </div>
            )}
        </div>
    );
};

export default DataTable;