const pool = require('../config/db')


/**
 * Récupère les heures moteurs avec pagination et filtrage
 * @param {Object} params - Paramètres de la requête
 * @param {number} [params.page=1] - Numéro de page (défaut: 1)
 * @param {number} [params.limit=10] - Éléments par page (défaut: 10)
 * @param {string} [params.dateFrom] - Date de début (format YYYY-MM-DD)
 * @param {string} [params.dateTo] - Date de fin (format YYYY-MM-DD)
 * @param {number} [params.vehicleId] - ID du véhicule
 * @param {number} [params.groupId] - ID du groupe de véhicules
 * @returns {Promise<Object>} - { data: [], pagination: { total, page, limit, totalPages } }
 */



async function getHmoteur(params = {}) {

    const {
        page = 1,
        limit = 10,
        dateFrom,
        dateTo,
        vehicleId,
        groupId
    } = params;


    const offset = (page - 1) * limit;


    let query = `
        SELECT hm.*, v.groupid 
        FROM heuremoteurs hm
        LEFT JOIN vehicles v ON hm.vcleid = v.ids
    `;
    const values = [];
    const whereClauses = [];


    if (dateFrom && dateTo) {
        whereClauses.push(`hm.dates BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        values.push(dateFrom, dateTo);
    } else if (dateFrom) {
        whereClauses.push(`hm.dates >= $${values.length + 1}`);
        values.push(dateFrom);
    } else if (dateTo) {
        whereClauses.push(`hm.dates <= $${values.length + 1}`);
        values.push(dateTo);
    }


    if (vehicleId) {
        whereClauses.push(`hm.vcleid = $${values.length + 1}`);
        values.push(vehicleId);
    }


    if (groupId) {
        whereClauses.push(`v.groupid = $${values.length + 1}`);
        values.push(groupId);
    }


    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const dataQuery = `${query} ORDER BY hm.dates DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;

    try {

        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, [...values, limit, offset]),
            pool.query(countQuery, values)
        ]);

        return {
            data: dataResult.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: page,
                limit: limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        };
    } catch (error) {
        console.error('Erreur getHmoteur:', error);
        throw error;
    }
}






async function getHmoteurByDatesAndId(date1, date2, vehicleId, vehicleGroupId) {
    let query = `
        SELECT hm.* 
        FROM heuremoteurs hm
        JOIN vehicles v ON hm.vcleid = v.ids
    `;
    let conditions = [];
    let params = [];

    if (date1 && date2) {
        conditions.push('hm.dates BETWEEN $1 AND $2');
        params.push(date1, date2);
    } else if (date1) {
        conditions.push('hm.dates >= $1');
        params.push(date1);
    } else if (date2) {
        conditions.push('hm.dates <= $1');
        params.push(date2);
    }

    if (vehicleId) {
        const paramIndex = params.length + 1;
        conditions.push(`hm.vcleid = $${paramIndex}`);
        params.push(vehicleId);
    }

    if (vehicleGroupId) {
        const paramIndex = params.length + 1;
        conditions.push(`v.groupid = $${paramIndex}`);
        params.push(vehicleGroupId);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    try {
        const results = await pool.query(query, params);
        return results.rows;
    } catch (error) {
        throw error;
    }
}


module.exports = { getHmoteur, getHmoteurByDatesAndId }


