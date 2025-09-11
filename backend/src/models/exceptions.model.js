const pool = require('../config/db')

async function getExceptions(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId,
        groupId,
        weekDaysThisWeek
    } = params;



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

    // Filtrage par dates
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


    if (vehicleId) {
        console.log(vehicleId)
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

    // Filtrage par groupe
    if (groupId) {
        whereClauses.push(`v.groupid = $${values.length + 1}`);
        values.push(groupId);
    }

    // OPTIMISATION: Filtrage par jours de la semaine (même logique que getHmoteur)
    if (weekDaysThisWeek && Array.isArray(weekDaysThisWeek) && weekDaysThisWeek.length > 0) {
        if (!weekDaysThisWeek.every(d => d >= 1 && d <= 7)) {
            throw new Error("Les jours doivent être entre 1 (lundi) et 7 (dimanche)");
        }

        // Conversion vers les codes PostgreSQL DOW
        const postgresDays = weekDaysThisWeek.map(dayNum => dayNum === 7 ? 0 : dayNum);

        // Créer les conditions avec les bons index
        const dayConditions = postgresDays.map((postgresDay, index) => {
            return `EXTRACT(DOW FROM e.dates) = $${values.length + index + 1}`;
        });

        // Ajouter les valeurs converties
        values.push(...postgresDays);

        // Si pas de plage de dates, on limite à la semaine en cours
        if (!dateFrom && !dateTo) {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi

            // Trouver le lundi de cette semaine
            const monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            monday.setHours(0, 0, 0, 0);

            // Trouver le dimanche de cette semaine
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            // Ajouter la condition de la semaine en cours
            whereClauses.push(`e.dates BETWEEN $${values.length + 1} AND $${values.length + 2}`);
            values.push(monday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]);
        }

        whereClauses.push(`(${dayConditions.join(' OR ')})`);
    }

    // Ajout des clauses WHERE
    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Tri par date
    query += ' ORDER BY e.dates DESC';

    try {
        // Exécution unique de la requête
        const result = await pool.query({
            text: query,
            values: values
        });

        return {
            data: result.rows,
            total: result.rows.length
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
