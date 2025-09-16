import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Exception, HeureMoteur } from '../api/api';

type ExportFormat = 'excel' | 'csv' | 'pdf';

interface ExportOptions {
    fileName?: string;
    includeDateInFileName?: boolean;
}

export const exportData = async (
    format: ExportFormat,
    data: any[],
    dataType: 'list_exceptions' | 'list_heuremoteur',
    options: ExportOptions = {}
): Promise<void> => {
    const {
        fileName = 'export',
        includeDateInFileName = true
    } = options;

    if (!data || data.length === 0) {
        throw new Error('Aucune donnée à exporter');
    }

    const finalFileName = includeDateInFileName
        ? `${fileName}_${new Date().toISOString().split('T')[0]}`
        : fileName;

    try {
        switch (format) {
            case 'excel':
                await exportToExcel(data, dataType, finalFileName);
                break;
            case 'csv':
                await exportToCSV(data, dataType, finalFileName);
                break;
            case 'pdf':
                await exportToPDF(data, dataType, finalFileName);
                break;
            default:
                throw new Error('Format non supporté');
        }
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        throw new Error(`Échec de l'export ${format}: ${error}`);
    }
};

// Formateurs communs
const formatDateExport = (dateString: string): string => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
        return dateString;
    }
};

const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
    if (value == null || isNaN(value)) return '-';
    return value.toFixed(decimals);
};

// Export Excel amélioré
const exportToExcel = (data: any[], dataType: string, fileName: string) => {
    const worksheetData = data.map(item => {
        if (dataType === 'list_exceptions') {
            const exception = item as Exception;
            return {
                'ID': exception.ids,
                'Date': formatDateExport(exception.dates),
                'Véhicule': exception.vehicle_name || '-',
                'Speedings': exception.nbrsp,
                'Hash Braking': exception.nbrhb,
                'Hash Acceleration': exception.nbha,
                'Groupe Véhicule': exception.group_name || '-'
            };
        } else {
            const heureMoteur = item as HeureMoteur;
            return {
                'ID': heureMoteur.ids,
                'Date': formatDateExport(heureMoteur.dates),
                'Véhicule': heureMoteur.vehicle_name || '-',
                'Durée totale': heureMoteur.dureetotal || '-',
                'Durée mouvement': heureMoteur.dureel || '-',
                'Arrêt moteur': heureMoteur.arretmoteurtournant || '-',
                'Distance (km)': heureMoteur.distancekm,
                'Vitesse max (km/h)': heureMoteur.vmax,
                'Utilisation (%)': heureMoteur.percentuse,
                'Consommation totale': heureMoteur.consototal,
                'Conso/100km': heureMoteur.conso100km,
                'Conso/h': heureMoteur.consolitperhour,
                'Groupe Véhicule': heureMoteur.group_name || '-'
            };
        }
    });

    const worksheet = utils.json_to_sheet(worksheetData);

    // Ajuster la largeur des colonnes
    const colWidths = dataType === 'list_exceptions'
        ? [{ wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 20 }]
        : [{ wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];

    worksheet['!cols'] = colWidths;

    const workbook = utils.book_new();
    const sheetName = dataType === 'list_exceptions' ? 'Exceptions' : 'Heures Moteur';
    utils.book_append_sheet(workbook, worksheet, sheetName);

    writeFile(workbook, `${fileName}.xlsx`);
};

// Export CSV amélioré
const exportToCSV = (data: any[], dataType: string, fileName: string) => {
    const headers = dataType === 'list_exceptions'
        ? ['ID', 'Date', 'Véhicule', 'Speedings', 'Hash Braking', 'Hash Acceleration', 'Groupe Véhicule']
        : ['ID', 'Date', 'Véhicule', 'Durée totale', 'Durée mouvement', 'Arrêt moteur', 'Distance (km)',
            'Vitesse max (km/h)', 'Utilisation (%)', 'Consommation totale', 'Conso/100km', 'Conso/h', 'Groupe Véhicule'];

    const dataRows = data.map(item => {
        if (dataType === 'list_exceptions') {
            const exception = item as Exception;
            return [
                exception.ids,
                formatDateExport(exception.dates),
                `"${(exception.vehicle_name || '-').replace(/"/g, '""')}"`,
                exception.nbrsp,
                exception.nbrhb,
                exception.nbha,
                `"${(exception.group_name || '-').replace(/"/g, '""')}"`
            ];
        } else {
            const heureMoteur = item as HeureMoteur;
            return [
                heureMoteur.ids,
                formatDateExport(heureMoteur.dates),
                `"${(heureMoteur.vehicle_name || '-').replace(/"/g, '""')}"`,
                heureMoteur.dureetotal || '-',
                heureMoteur.dureel || '-',
                heureMoteur.arretmoteurtournant || '-',
                formatNumber(heureMoteur.distancekm),
                formatNumber(heureMoteur.vmax),
                formatNumber(heureMoteur.percentuse, 1),
                formatNumber(heureMoteur.consototal),
                formatNumber(heureMoteur.conso100km),
                formatNumber(heureMoteur.consolitperhour),
                `"${(heureMoteur.group_name || '-').replace(/"/g, '""')}"`
            ];
        }
    });

    const csvContent = [
        headers.join(','),
        ...dataRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();

    // Nettoyage
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
};

// Export PDF amélioré
const exportToPDF = (data: any[], dataType: string, fileName: string) => {
    const doc = new jsPDF();
    const title = dataType === 'list_exceptions'
        ? 'Rapport des Exceptions'
        : 'Rapport des Heures Moteur';

    const subtitle = `Généré le ${new Date().toLocaleDateString('fr-FR')}`;

    // En-tête
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 30);

    // Données du tableau
    const headers = dataType === 'list_exceptions'
        ? ['ID', 'Date', 'Véhicule', 'Speedings', 'Hash Br.', 'Hash Acc.', 'Groupe']
        : ['ID', 'Date', 'Véhicule', 'Durée', 'Mouvement', 'Arrêt', 'Distance', 'Vmax', 'Utilisation%',
            'Conso Tot', 'Conso/100', 'Conso/h', 'Groupe'];

    const tableData = data.map(item => {
        if (dataType === 'list_exceptions') {
            const exception = item as Exception;
            return [
                exception.ids.toString(),
                formatDateExport(exception.dates),
                exception.vehicle_name || '-',
                exception.nbrsp.toString(),
                exception.nbrhb.toString(),
                exception.nbha.toString(),
                exception.group_name || '-'
            ];
        } else {
            const heureMoteur = item as HeureMoteur;
            return [
                heureMoteur.ids.toString(),
                formatDateExport(heureMoteur.dates),
                heureMoteur.vehicle_name || '-',
                heureMoteur.dureetotal || '-',
                heureMoteur.dureel || '-',
                heureMoteur.arretmoteurtournant || '-',
                formatNumber(heureMoteur.distancekm),
                formatNumber(heureMoteur.vmax),
                formatNumber(heureMoteur.percentuse, 1),
                formatNumber(heureMoteur.consototal),
                formatNumber(heureMoteur.conso100km),
                formatNumber(heureMoteur.consolitperhour),
                heureMoteur.group_name || '-'
            ];
        }
    });

    // Configuration du tableau
    autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2,
            valign: 'middle',
            halign: 'center',
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        margin: { top: 40 },
        pageBreak: 'auto',
        rowPageBreak: 'avoid'
    });

    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`${fileName}.pdf`);
};

// Fonction utilitaire pour exporter avec progression
export const exportWithProgress = async (
    format: ExportFormat,
    data: any[],
    dataType: 'list_exceptions' | 'list_heuremoteur',
    onProgress?: (progress: number) => void,
    options?: ExportOptions
): Promise<void> => {
    if (onProgress) onProgress(0);

    // Simuler une progression pour les gros exports
    const totalSteps = 10;
    for (let i = 0; i < totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (onProgress) onProgress((i + 1) / totalSteps * 100);
    }

    await exportData(format, data, dataType, options);

    if (onProgress) onProgress(100);
};