const pool = require('../config/db')


async function gettransitbase() {
    const result = await pool.query('SELECT * FROM transitbase');
    return result.rows;
}


async function getAllDashboards(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId = null,
        weekDaysThisWeek
    } = params;

    try {
        const [dureeParBase, toursParBase, historiqueTransit, dureeTransitMax] = await Promise.all([
            getDureeParBase(params),
            getToursParBase(params),
            getHistoriqueTransit(params),
            getDureeTransitMax(params)
        ]);

        return {
            DureeParBase: dureeParBase.data,
            ToursParBase: toursParBase.data,
            HistoriqueTransit: historiqueTransit.data,
            DureeTransitMax: dureeTransitMax.data
        };
    } catch (error) {
        console.error('Erreur getAllDashboards:', error);
        throw error;
    }
}

//duree par base
async function getDureeParBase(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId = null,
        weekDaysThisWeek
    } = params;

    let query = `
        SELECT 
            v.names as vehicle_name,
            b.names as base_name,
            tb.baseinit as base_id,
            tb.dates,  
            SUM(tb.dureebase1) as duree_totale
        FROM transitbase tb
        LEFT JOIN vehicles v ON tb.vcleid = v.ids
        LEFT JOIN bases b ON tb.baseinit = b.ids
    `;

    const values = [];
    const whereClauses = [];
    let paramIndex = 1;

    // Filtrage par dates
    if (dateFrom && dateTo) {
        whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        values.push(dateFrom, dateTo);
        paramIndex += 2;
    } else if (dateFrom) {
        whereClauses.push(`tb.dates >= $${paramIndex}`);
        values.push(dateFrom);
        paramIndex += 1;
    } else if (dateTo) {
        whereClauses.push(`tb.dates <= $${paramIndex}`);
        values.push(dateTo);
        paramIndex += 1;
    }

    // Filtrage par véhicule(s)
    if (vehicleId) {
        if (Array.isArray(vehicleId)) {
            if (vehicleId.length === 0) {
                throw new Error("Le tableau vehicleId ne peut pas être vide");
            }
            whereClauses.push(`tb.vcleid = ANY($${paramIndex})`);
            values.push(vehicleId);
            paramIndex += 1;
        } else {
            whereClauses.push(`tb.vcleid = $${paramIndex}`);
            values.push(vehicleId);
            paramIndex += 1;
        }
    }

    // Filtrage par jours de la semaine
    if (weekDaysThisWeek && Array.isArray(weekDaysThisWeek) && weekDaysThisWeek.length > 0) {
        if (!weekDaysThisWeek.every(d => d >= 1 && d <= 7)) {
            throw new Error("Les jours doivent être entre 1 (lundi) et 7 (dimanche)");
        }

        const postgresDays = weekDaysThisWeek.map(dayNum => dayNum === 7 ? 0 : dayNum);

        let weekStart, weekEnd;
        if (!dateFrom && !dateTo) {
            const today = new Date();
            const dayOfWeek = today.getDay();

            weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            weekStart.setHours(0, 0, 0, 0);

            weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            values.push(weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]);
            paramIndex += 2;
        }

        const dayConditions = postgresDays.map((_, index) => {
            return `EXTRACT(DOW FROM tb.dates) = $${paramIndex + index}`;
        });

        values.push(...postgresDays);
        whereClauses.push(`(${dayConditions.join(' OR ')})`);
        paramIndex += postgresDays.length;
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' GROUP BY v.names, b.names, tb.baseinit, tb.dates ORDER BY tb.dates DESC, duree_totale DESC';

    try {
        const result = await pool.query({
            text: query,
            values: values
        });

        return {
            data: result.rows,
            total: result.rows.length
        };
    } catch (error) {
        console.error('Erreur getDureeParBase:', error);
        throw error;
    }
}

//tours per base
async function getToursParBase(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId = null,
        weekDaysThisWeek
    } = params;

    let query = `
        SELECT 
            v.names as vehicle_name,
            b.names as base_name,
            tb.baseinit as base_id,
            tb.dates,  
            COUNT(tb.ids) as nombre_tours
        FROM transitbase tb
        LEFT JOIN vehicles v ON tb.vcleid = v.ids
        LEFT JOIN bases b ON tb.baseinit = b.ids
    `;

    const values = [];
    const whereClauses = [];
    let paramIndex = 1;

    // Filtrage par dates
    if (dateFrom && dateTo) {
        whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        values.push(dateFrom, dateTo);
        paramIndex += 2;
    } else if (dateFrom) {
        whereClauses.push(`tb.dates >= $${paramIndex}`);
        values.push(dateFrom);
        paramIndex += 1;
    } else if (dateTo) {
        whereClauses.push(`tb.dates <= $${paramIndex}`);
        values.push(dateTo);
        paramIndex += 1;
    }

    // Filtrage par véhicule(s)
    if (vehicleId) {
        if (Array.isArray(vehicleId)) {
            if (vehicleId.length === 0) {
                throw new Error("Le tableau vehicleId ne peut pas être vide");
            }
            whereClauses.push(`tb.vcleid = ANY($${paramIndex})`);
            values.push(vehicleId);
            paramIndex += 1;
        } else {
            whereClauses.push(`tb.vcleid = $${paramIndex}`);
            values.push(vehicleId);
            paramIndex += 1;
        }
    }

    // Filtrage par jours de la semaine
    if (weekDaysThisWeek && Array.isArray(weekDaysThisWeek) && weekDaysThisWeek.length > 0) {
        if (!weekDaysThisWeek.every(d => d >= 1 && d <= 7)) {
            throw new Error("Les jours doivent être entre 1 (lundi) et 7 (dimanche)");
        }

        const postgresDays = weekDaysThisWeek.map(dayNum => dayNum === 7 ? 0 : dayNum);

        let weekStart, weekEnd;
        if (!dateFrom && !dateTo) {
            const today = new Date();
            const dayOfWeek = today.getDay();

            weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            weekStart.setHours(0, 0, 0, 0);

            weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            values.push(weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]);
            paramIndex += 2;
        }

        const dayConditions = postgresDays.map((_, index) => {
            return `EXTRACT(DOW FROM tb.dates) = $${paramIndex + index}`;
        });

        values.push(...postgresDays);
        whereClauses.push(`(${dayConditions.join(' OR ')})`);
        paramIndex += postgresDays.length;
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' GROUP BY v.names, b.names, tb.baseinit, tb.dates ORDER BY tb.dates DESC, nombre_tours DESC';

    try {
        const result = await pool.query({
            text: query,
            values: values
        });

        return {
            data: result.rows,
            total: result.rows.length
        };
    } catch (error) {
        console.error('Erreur getToursParBase:', error);
        throw error;
    }
}

//historique transit
async function getHistoriqueTransit(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId = null,
        weekDaysThisWeek
    } = params;

    let query = `
        SELECT 
            v.names as vehicle_name,
            b1.names as base_depart,
            b2.names as base_arrivee,
            tb.baseinit as base_depart_id,
            tb.basend as base_arrivee_id,
            tb.datexitbase1 as date_depart,
            tb.datenterbase2 as date_arrivee,
            tb.dureebase1 as duree_base_depart,
            tb.dureetransit as duree_transit,
            tb.dates
        FROM transitbase tb
        LEFT JOIN vehicles v ON tb.vcleid = v.ids
        LEFT JOIN bases b1 ON tb.baseinit = b1.ids
        LEFT JOIN bases b2 ON tb.basend = b2.ids
    `;

    const values = [];
    const whereClauses = [];
    let paramIndex = 1;

    // Filtrage par dates
    if (dateFrom && dateTo) {
        whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        values.push(dateFrom, dateTo);
        paramIndex += 2;
    } else if (dateFrom) {
        whereClauses.push(`tb.dates >= $${paramIndex}`);
        values.push(dateFrom);
        paramIndex += 1;
    } else if (dateTo) {
        whereClauses.push(`tb.dates <= $${paramIndex}`);
        values.push(dateTo);
        paramIndex += 1;
    }

    // Filtrage par véhicule(s)
    if (vehicleId) {
        if (Array.isArray(vehicleId)) {
            if (vehicleId.length === 0) {
                throw new Error("Le tableau vehicleId ne peut pas être vide");
            }
            whereClauses.push(`tb.vcleid = ANY($${paramIndex})`);
            values.push(vehicleId);
            paramIndex += 1;
        } else {
            whereClauses.push(`tb.vcleid = $${paramIndex}`);
            values.push(vehicleId);
            paramIndex += 1;
        }
    }

    // Filtrage par jours de la semaine
    if (weekDaysThisWeek && Array.isArray(weekDaysThisWeek) && weekDaysThisWeek.length > 0) {
        if (!weekDaysThisWeek.every(d => d >= 1 && d <= 7)) {
            throw new Error("Les jours doivent être entre 1 (lundi) et 7 (dimanche)");
        }

        const postgresDays = weekDaysThisWeek.map(dayNum => dayNum === 7 ? 0 : dayNum);

        let weekStart, weekEnd;
        if (!dateFrom && !dateTo) {
            const today = new Date();
            const dayOfWeek = today.getDay();

            weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            weekStart.setHours(0, 0, 0, 0);

            weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            values.push(weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]);
            paramIndex += 2;
        }

        const dayConditions = postgresDays.map((_, index) => {
            return `EXTRACT(DOW FROM tb.dates) = $${paramIndex + index}`;
        });

        values.push(...postgresDays);
        whereClauses.push(`(${dayConditions.join(' OR ')})`);
        paramIndex += postgresDays.length;
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY tb.dates DESC, tb.datexitbase1 DESC';

    try {
        const result = await pool.query({
            text: query,
            values: values
        });

        return {
            data: result.rows,
            total: result.rows.length
        };
    } catch (error) {
        console.error('Erreur getHistoriqueTransit:', error);
        throw error;
    }
}

async function getDureeTransitMax(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId = null,
        weekDaysThisWeek
    } = params;

    let query = `
        SELECT DISTINCT ON (tb.vcleid, tb.baseinit)
            v.names as vehicle_name,
            b.names as base_name,
            tb.baseinit as base_id,
            tb.dureetransit as duree_transit_max,
            tb.dates
        FROM transitbase tb
        LEFT JOIN vehicles v ON tb.vcleid = v.ids
        LEFT JOIN bases b ON tb.baseinit = b.ids
    `;

    const values = [];
    const whereClauses = [];
    let paramIndex = 1;

    // Filtrage par dates
    if (dateFrom && dateTo) {
        whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        values.push(dateFrom, dateTo);
        paramIndex += 2;
    } else if (dateFrom) {
        whereClauses.push(`tb.dates >= $${paramIndex}`);
        values.push(dateFrom);
        paramIndex += 1;
    } else if (dateTo) {
        whereClauses.push(`tb.dates <= $${paramIndex}`);
        values.push(dateTo);
        paramIndex += 1;
    }

    // Filtrage par véhicule(s)
    if (vehicleId) {
        if (Array.isArray(vehicleId)) {
            if (vehicleId.length === 0) {
                throw new Error("Le tableau vehicleId ne peut pas être vide");
            }
            whereClauses.push(`tb.vcleid = ANY($${paramIndex})`);
            values.push(vehicleId);
            paramIndex += 1;
        } else {
            whereClauses.push(`tb.vcleid = $${paramIndex}`);
            values.push(vehicleId);
            paramIndex += 1;
        }
    }

    // Filtrage par jours de la semaine
    if (weekDaysThisWeek && Array.isArray(weekDaysThisWeek) && weekDaysThisWeek.length > 0) {
        if (!weekDaysThisWeek.every(d => d >= 1 && d <= 7)) {
            throw new Error("Les jours doivent être entre 1 (lundi) et 7 (dimanche)");
        }

        const postgresDays = weekDaysThisWeek.map(dayNum => dayNum === 7 ? 0 : dayNum);

        let weekStart, weekEnd;
        if (!dateFrom && !dateTo) {
            const today = new Date();
            const dayOfWeek = today.getDay();

            weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            weekStart.setHours(0, 0, 0, 0);

            weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            whereClauses.push(`tb.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            values.push(weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]);
            paramIndex += 2;
        }

        const dayConditions = postgresDays.map((_, index) => {
            return `EXTRACT(DOW FROM tb.dates) = $${paramIndex + index}`;
        });

        values.push(...postgresDays);
        whereClauses.push(`(${dayConditions.join(' OR ')})`);
        paramIndex += postgresDays.length;
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Ordonner pour obtenir le transit max par véhicule et base
    query += ' ORDER BY tb.vcleid, tb.baseinit, tb.dureetransit DESC';
    try {
        const result = await pool.query({
            text: query,
            values: values
        });

        return {
            data: result.rows,
            total: result.rows.length
        };
    } catch (error) {
        console.error('Erreur getDureeTransitMax:', error);
        throw error;
    }
}
module.exports = { gettransitbase, getAllDashboards }