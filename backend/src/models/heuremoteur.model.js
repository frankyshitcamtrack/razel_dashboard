const pool = require('../config/db')


/**
 * Récupère les heures moteurs avec pagination et filtrage
 * @param {Object} params - Paramètres de la requête
 * @param {number} [params.page=1] - Numéro de page (défaut: 1)
 * @param {number} [params.limit=10] - Éléments par page (défaut: 10)
 * @param {string} [params.dateFrom] - Date de début (format YYYY-MM-DD)
 * @param {string} [params.dateTo] - Date de fin (format YYYY-MM-DD)
 * @param {number|number[]} [params.vehicleId] - ID ou tableau d'IDs du véhicule
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

    // Validation des paramètres
    if (page < 1) throw new Error("Le numéro de page doit être supérieur ou égal à 1");
    if (limit < 1) throw new Error("La limite doit être supérieure ou égale à 1");

    const offset = (page - 1) * limit;

    // Construction de la requête avec jointures supplémentaires
    let query = `
        SELECT 
            hm.*,
            v.names as vehicle_name,
            vg.names as group_name,
            v.groupid
        FROM heuremoteurs hm
        LEFT JOIN vehicles v ON hm.vcleid = v.ids
        LEFT JOIN vclegroup vg ON v.groupid = vg.ids
    `;
    const values = [];
    const whereClauses = [];

    // Filtre par dates
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

    // Filtre par véhicule(s)
    if (vehicleId) {
        if (Array.isArray(vehicleId)) {
            if (vehicleId.length === 0) {
                throw new Error("Le tableau vehicleId ne peut pas être vide");
            }
            whereClauses.push(`hm.vcleid = ANY($${values.length + 1})`);
            values.push(vehicleId);
        } else {
            whereClauses.push(`hm.vcleid = $${values.length + 1}`);
            values.push(vehicleId);
        }
    }

    // Filtre par groupe
    if (groupId) {
        whereClauses.push(`v.groupid = $${values.length + 1}`);
        values.push(groupId);
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Requêtes
    const dataQuery = {
        text: `${query} ORDER BY hm.dates DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        values: [...values, limit, offset]
    };

    const countQuery = {
        text: `SELECT COUNT(*) FROM (${query}) AS total`,
        values: values
    };

    try {
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery),
            pool.query(countQuery)
        ]);

        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages && totalPages > 0) {
            throw new Error(`La page ${page} n'existe pas. Il y a seulement ${totalPages} pages disponibles.`);
        }

        return {
            data: dataResult.rows,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                totalPages: totalPages
            }
        };
    } catch (error) {
        console.error('Erreur getHmoteur:', error);
        throw error;
    }
}



/**
 * Récupère les heures moteur filtrées par dates et ID(s) de véhicule(s)
 * @param {string} [date1] - Date de début (format YYYY-MM-DD)
 * @param {string} [date2] - Date de fin (format YYYY-MM-DD)
 * @param {number|number[]} [vehicleId] - ID ou tableau d'IDs de véhicule(s)
 * @param {number} [vehicleGroupId] - ID du groupe de véhicules
 * @returns {Promise<Array>} - Tableau des résultats
 */
async function getHmoteurByDatesAndId(date1, date2, vehicleId, vehicleGroupId) {
    let query = `
        SELECT hm.* 
        FROM heuremoteurs hm
        JOIN vehicles v ON hm.vcleid = v.ids
    `;
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Gestion des dates
    if (date1 && date2) {
        conditions.push(`hm.dates BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        params.push(date1, date2);
        paramIndex += 2;
    } else if (date1) {
        conditions.push(`hm.dates >= $${paramIndex}`);
        params.push(date1);
        paramIndex += 1;
    } else if (date2) {
        conditions.push(`hm.dates <= $${paramIndex}`);
        params.push(date2);
        paramIndex += 1;
    }

    // Gestion des véhicules (single ID ou array)
    if (vehicleId) {
        if (Array.isArray(vehicleId)) {
            if (vehicleId.length === 0) {
                throw new Error("Le tableau vehicleId ne peut pas être vide");
            }
            conditions.push(`hm.vcleid = ANY($${paramIndex})`);
            params.push(vehicleId);
            paramIndex += 1;
        } else {
            conditions.push(`hm.vcleid = $${paramIndex}`);
            params.push(vehicleId);
            paramIndex += 1;
        }
    }

    // Gestion du groupe de véhicules
    if (vehicleGroupId) {
        conditions.push(`v.groupid = $${paramIndex}`);
        params.push(vehicleGroupId);
    }

    // Construction de la requête finale
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    // Tri par date décroissante par défaut
    query += ' ORDER BY hm.dates DESC';

    try {
        const results = await pool.query(query, params);
        return results.rows;
    } catch (error) {
        console.error('Erreur dans getHmoteurByDatesAndId:', error);
        throw error;
    }
}


module.exports = { getHmoteur, getHmoteurByDatesAndId }


