import React, { useEffect, useMemo, useState } from "react";
import { fetchData } from "../../api/api";
import type { PaginatedResponse, PaginationParams } from "../../api/api";
import { Pagination } from "../pagination";

type DataType = "list_exceptions" | "list_heuremoteur";

type ColumnDef<T = any> = {
    header: string;
    accessor: keyof T | string; // string pour rester souple
    format?: (val: any, row?: T) => React.ReactNode;
    width?: number;
};

const formatDateFR = (val?: string) =>
    val ? new Date(val).toLocaleDateString("fr-FR") : "-";

const DataTable: React.FC<{ dataType: DataType }> = ({ dataType }) => {
    const [data, setData] = useState<PaginatedResponse<any>>({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // états locaux pour ne pas “écraser” une borne quand l’autre change
    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);

    const [filters, setFilters] = useState<PaginationParams>({
        page: 1,
        limit: 10,
    });

    const columns: ColumnDef[] = useMemo(() => {
        if (dataType === "list_exceptions") {
            return [
                { header: "ID", accessor: "id", width: 80 },
                { header: "Date", accessor: "dates", format: formatDateFR, width: 120 },
                { header: "Véhicule ID", accessor: "vcleid", width: 120 },
                { header: "Nombre de speedings", accessor: "nbrsp", width: 160 },
                { header: "Nombre de Hash braking", accessor: "nbrhb", width: 180 },
                { header: "Nombre de Hash Acceleration", accessor: "nbrha", width: 200 },
                { header: "Groupe de Véhicule", accessor: "groupid", width: 160 },
            ];
        }
        // list_heuremoteur
        return [
            { header: "ID", accessor: "ids", width: 80 },
            { header: "Véhicule", accessor: "vcleid", width: 100 },
            { header: "Date", accessor: "dates", format: formatDateFR, width: 120 },
            {
                header: "Durée totale",
                accessor: "dureetotal",
                format: (v: string) => v || "-",
                width: 120,
            },
            {
                header: "Durée en mouvement",
                accessor: "dureel",
                format: (v: string) => v || "-",
                width: 140,
            },
            {
                header: "Arrêt moteur",
                accessor: "arretmoteurtournant",
                format: (v: string) => v || "-",
                width: 140,
            },
            {
                header: "Distance (km)",
                accessor: "distancekm",
                format: (v: number) =>
                    typeof v === "number" ? v.toFixed(2) : (v ?? 0),
                width: 120,
            },
            {
                header: "Vitesse max",
                accessor: "vmax",
                format: (v: number) =>
                    v != null && !Number.isNaN(v) ? `${v} km/h` : "-",
                width: 120,
            },
            {
                header: "Utilisation (%)",
                accessor: "percentuse",
                format: (v: number) =>
                    v != null && !Number.isNaN(v) ? `${v.toFixed(1)}%` : "-",
                width: 140,
            },
            {
                header: "Consommation totale",
                accessor: "consototal",
                format: (v: number) =>
                    v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00",
                width: 160,
            },
            {
                header: "Conso/100km",
                accessor: "conso100km",
                format: (v: number) =>
                    v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00",
                width: 140,
            },
            {
                header: "Conso/h",
                accessor: "consolitperhour",
                format: (v: number) =>
                    v != null && !Number.isNaN(v) ? v.toFixed(2) : "0.00",
                width: 120,
            },
            { header: "Groupe", accessor: "groupid", width: 120 },
        ];
    }, [dataType]);

    // Id de ligne cohérent selon le type
    const getRowId = (row: any) =>
        dataType === "list_heuremoteur" ? row.ids ?? row.id : row.id ?? row.ids;

    // Chargement des données
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

    // Helpers de mise à jour des filtres
    const updateFilters = (patch: Partial<PaginationParams>, resetPage = true) =>
        setFilters((prev) => ({ ...prev, ...(resetPage ? { page: 1 } : {}), ...patch }));

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const limit = Number(e.target.value);
        updateFilters({ limit }, true);
    };

    // Dates : on garde en local et on pousse le format AAAA-MM-JJ dans les filters
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
        updateFilters(
            { vehicleId: v === "" ? undefined : Number(v) },
            true
        );
    };

    const renderCell = (row: any, col: ColumnDef) => {
        const value = row[col.accessor as string];
        return col.format ? col.format(value, row) : value ?? "-";
    };

    return (
        <div className="bg-white rounded-lg shadow p-6" >
            <div className="flex flex-wrap gap-4 mb-6 items-end" >
                <div className="flex items-center gap-2" >
                    <label htmlFor="dateFrom" className="text-sm font-medium" >Date début: </label>
                    < input
                        id="dateFrom"
                        type="date"
                        value={startDate ?? ""
                        }
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    <span>à </span>
                    < label htmlFor="dateTo" className="sr-only" >
                        Date fin
                    </label>
                    < input
                        id="dateTo"
                        type="date"
                        value={endDate ?? ""}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                </div>

                < div className="flex items-center gap-2" >
                    <label htmlFor="vehicle" className="text-sm font-medium" >
                        Véhicule ID:
                    </label>
                    < input
                        id="vehicle"
                        type="number"
                        inputMode="numeric"
                        placeholder="ex: 42"
                        onChange={(e) => handleVehicleChange(e.target.value)}
                        className="border rounded px-3 py-2 w-28"
                    />
                </div>
            </div>

            {/* Erreur */}
            {
                error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" >
                        {error}
                    </div>
                )
            }

            {/* Tableau */}
            <div className="overflow-x-auto" >
                <table className="min-w-full table-fixed divide-y divide-gray-200" >
                    <thead className="bg-gray-50" >
                        <tr>
                            {
                                columns.map((col) => (
                                    <th
                                        key={String(col.accessor)
                                        }
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        style={col.width ? { width: col.width } : undefined}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                        </tr>
                    </thead>
                    < tbody className="bg-white divide-y divide-gray-200" >
                        {
                            loading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-6 text-center text-gray-500"
                                    >
                                        Chargement…
                                    </td>
                                </tr>
                            ) : data.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-6 text-center text-gray-500"
                                    >
                                        Aucune donnée disponible
                                    </td>
                                </tr>
                            ) : (
                                data.data.map((item: any) => (
                                    <tr key={getRowId(item)} >
                                        {
                                            columns.map((col) => (
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4" >
                <div className="flex items-center gap-2" >
                    <span className="text-sm text-gray-700" >
                        Affichage de{" "}
                        {
                            data.pagination.total === 0
                                ? 0
                                : (data.pagination.page - 1) * data.pagination.limit + 1
                        } {" "}
                        à{" "}
                        {
                            Math.min(
                                data.pagination.page * data.pagination.limit,
                                data.pagination.total
                            )
                        } {" "}
                        sur {data.pagination.total} éléments
                    </span>

                    < label htmlFor="limit" className="text-sm text-gray-600" >
                        / page
                    </label>
                    < select
                        id="limit"
                        value={filters.limit}
                        onChange={handleLimitChange}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        {
                            [10, 20, 50, 100].map((size) => (
                                <option key={size} value={size} >
                                    {size}
                                </option>
                            ))
                        }
                    </select>
                </div>

                {/*    < div className="flex flex-wrap gap-1" >
                    {
                        Array.from(
                            { length: data.pagination.totalPages || 0 },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded border text-sm ${filters.page === page
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                </div> */}
                <Pagination
                    currentPage={data.pagination.page}
                    totalPages={Math.ceil(data.pagination.total / data.pagination.totalPages)}
                    onPageChange={(page) => handlePageChange(page)}
                />
            </div>
        </div>
    );
};

export default DataTable;
