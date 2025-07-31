const pool = require('../config/db')


async function getExceptions(params = {}) {
    // Paramètres par défaut
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

    // Calcul de l'offset
    const offset = (page - 1) * limit;

    // Construction de la requête avec jointures supplémentaires
    let query = `
        SELECT 
            e.*, 
            v.names as vehicle_name,
            vg.names as group_name
        FROM exceptionsnbr e
        LEFT JOIN vehicles v ON e.vcleid = v.ids
        LEFT JOIN vclegroup vg ON v.groupid = vg.ids
    `;
    const values = [];
    const whereClauses = [];

    // Filtre par dates
    if (dateFrom && dateTo) {
        whereClauses.push(`e.dates BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        values.push(dateFrom, dateTo);
    } else if (dateFrom) {
        whereClauses.push(`e.dates >= $${values.length + 1}`);
        values.push(dateFrom);
    } else if (dateTo) {
        whereClauses.push(`e.dates <= $${values.length + 1}`);
        values.push(dateTo);
    }

    // Filtre par véhicule(s)
    if (vehicleId) {
        if (Array.isArray(vehicleId)) {
            if (vehicleId.length === 0) {
                throw new Error("Le tableau vehicleId ne peut pas être vide");
            }
            whereClauses.push(`e.vcleid = ANY($${values.length + 1})`);
            values.push(vehicleId);
        } else {
            whereClauses.push(`e.vcleid = $${values.length + 1}`);
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
        text: `${query} ORDER BY e.dates DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        values: [...values, limit, offset]
    };

    const countQuery = {
        text: `SELECT COUNT(*) FROM (${query}) AS total`,
        values: values
    };

    try {
        // Exécution en parallèle
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery),
            pool.query(countQuery)
        ]);

        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        // Vérification que la page demandée existe
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
        console.error('Erreur getExceptions:', error);
        throw error;
    }
}

async function getExceptionsByDatesAndId(date1, date2, vehicleId, vehicleGroupId) {
    let query = `
        SELECT e.* 
        FROM exceptionsnbr e
        JOIN vehicles v ON e.vcleid = v.ids
    `;
    let conditions = [];
    let params = [];

    const convertToUTC = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        date.setHours(date.getHours() - 1);
        return date.toISOString();
    };

    if (date1 && date2) {
        conditions.push('e.dates BETWEEN $1 AND $2');
        params.push(convertToUTC(date1), convertToUTC(date2));
    } else if (date1) {
        conditions.push('e.dates >= $1');
        params.push(convertToUTC(date1));
    } else if (date2) {
        conditions.push('e.dates <= $1');
        params.push(convertToUTC(date2));
    }

    if (vehicleId) {
        const paramIndex = params.length + 1;
        conditions.push(`e.vcleid = $${paramIndex}`);
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



module.exports = { getExceptions, getExceptionsByDatesAndId }
