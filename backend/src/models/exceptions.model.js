const pool = require('../config/db')

async function getExceptions(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId,
        groupId,
        weekDaysThisWeek
    } = params;

    // Vérification stricte des paramètres requis
    const hasValidDateRange = !!(dateFrom && dateTo);
    const hasValidVehicleFilter = !!(vehicleId && (Array.isArray(vehicleId) ? vehicleId.length > 0 : true));
    const hasValidGroupFilter = !!groupId;
    const hasValidWeekDays = !!(weekDaysThisWeek?.length > 0);

    // Si aucun paramètre valide n'est présent, ne pas exécuter la requête
    if (!hasValidDateRange && !hasValidGroupFilter && !hasValidWeekDays) {
        console.log('Aucun filtre valide spécifié - requête annulée');
        return {
            data: [],
            total: 0,
            message: "Aucun filtre valide spécifié. Veuillez fournir au moins un des critères suivants : plage de dates complète, véhicule(s), groupe ou jours de la semaine."
        };
    }

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

    // Filtrage par dates (STRICT : les deux dates doivent être présentes)
    if (dateFrom && dateTo) {
        whereClauses.push(`e.dates BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        values.push(dateFrom, dateTo);
    } else if (dateFrom || dateTo) {
        // Si une seule date est fournie, on ignore (comportement strict)
        console.warn('Plage de dates incomplète ignorée : dateFrom et dateTo doivent être fournies ensemble');
    }

    // Filtrage par véhicule(s) (STRICT : doit être non vide)
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

    // Filtrage par groupe (STRICT : doit être défini)
    if (groupId) {
        whereClauses.push(`v.groupid = $${values.length + 1}`);
        values.push(groupId);
    }

    // Filtrage par jours de la semaine (STRICT : doit avoir au moins un jour)
    if (weekDaysThisWeek?.length > 0) {
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

        // Si pas de plage de dates, limiter à la semaine en cours (uniquement si weekDays est spécifié)
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

    // Vérification finale : au moins une clause WHERE doit être présente
    if (whereClauses.length === 0) {
        console.log('Aucune clause WHERE valide générée - requête annulée');
        return {
            data: [],
            total: 0,
            message: "Les paramètres fournis sont insuffisants pour exécuter la requête."
        };
    }

    // Construction de la requête WHERE
    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Tri par date
    query += ' ORDER BY e.dates DESC';

    console.log('Requête getExceptions exécutée avec filtres :', whereClauses);

    try {
        // Exécution unique de la requête
        const result = await pool.query({
            text: query,
            values: values
        });

        return {
            data: result.rows,
            total: result.rows.length,
            message: `${result.rows.length} exceptions trouvées`
        };
    } catch (error) {
        console.error('Erreur getExceptions:', error);
        throw error;
    }
}


async function getExceptionsByDatesAndId(date1, date2, vehicleId, vehicleGroupId, page = 1, limit = 10) {
    let query = `
        SELECT e.* 
        FROM exceptionsnbr e
        JOIN vehicles v ON e.vcleid = v.ids
    `;
    let countQuery = `
        SELECT COUNT(*) as total
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
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
    }


    const offset = (page - 1) * limit;
    query += ` ORDER BY e.dates DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {

        const [results, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, -2))
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return {
            data: results.rows,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { getExceptions, getExceptionsByDatesAndId }
