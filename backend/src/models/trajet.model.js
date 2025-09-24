const pool = require('../config/db')


async function getTrajet() {

    const result = await pool.query('SELECT * FROM trajets');
    return result.rows[0];
}



/**
 * Récupère les trajets avec filtrage pour les dashboard
 * @param {Object} params - Paramètres de la requête
 * @param {string} [params.dateFrom] - Date de début (format YYYY-MM-DD)
 * @param {string} [params.dateTo] - Date de fin (format YYYY-MM-DD)
 * @param {number|number[]} [params.vehicleId] - ID ou tableau d'IDs du véhicule
 * @param {number} [params.groupId] - ID du groupe de véhicules
 * @param {number[]} [params.weekDaysThisWeek] - Jours de la semaine (1=lundi, 7=dimanche)
 * @returns {Promise<Object>} - { data: [], total: number }
 */

async function getTrajets(params = {}) {
    const {
        dateFrom,
        dateTo,
        vehicleId = null,
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
            t.*,
            v.names as vehicle_name,
            vg.names as group_name,
            v.groupid
        FROM trajets t
        LEFT JOIN vehicles v ON t.vcleid = v.ids
        LEFT JOIN vclegroup vg ON v.groupid = vg.ids
    `;

    const values = [];
    const whereClauses = [];

    // Filtrage par dates (STRICT : les deux dates doivent être présentes)
    if (dateFrom && dateTo) {
        whereClauses.push(`t.dates BETWEEN $${values.length + 1} AND $${values.length + 2}`);
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
            whereClauses.push(`t.vcleid = ANY($${values.length + 1})`);
            values.push(vehicleId);
        } else {
            whereClauses.push(`t.vcleid = $${values.length + 1}`);
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

        const dayPlaceholders = weekDaysThisWeek.map((_, index) =>
            `$${values.length + index + 1}`
        );

        whereClauses.push(`EXTRACT(ISODOW FROM t.dates) IN (${dayPlaceholders.join(', ')})`);
        values.push(...weekDaysThisWeek);

        // Si pas de plage de dates, limiter à la semaine en cours (uniquement si weekDays est spécifié)
        if (!dateFrom && !dateTo) {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi

            // Trouver le lundi de cette semaine (ISODOW: lundi=1)
            const monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            monday.setHours(0, 0, 0, 0);

            // Trouver le dimanche de cette semaine
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            whereClauses.push(`t.dates BETWEEN $${values.length + 1} AND $${values.length + 2}`);
            values.push(monday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]);
        }
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
    query += ' WHERE ' + whereClauses.join(' AND ');

    // Tri par date décroissante
    query += ' ORDER BY t.dates DESC, t.initdate DESC';

    console.log('Requête exécutée avec filtres :', whereClauses);

    try {
        const result = await pool.query({
            text: query,
            values: values
        });

        return {
            data: result.rows,
            total: result.rows.length,
            message: `${result.rows.length} trajets trouvés`
        };
    } catch (error) {
        console.error('Erreur getTrajets:', error);
        throw error;
    }
}


module.exports = { getTrajet, getTrajets }