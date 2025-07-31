import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Exception, HeureMoteur } from '../api/api';


type ExportFormat = 'excel' | 'csv' | 'pdf';


export const exportData = async (
    format: ExportFormat,
    data: any,
    dataType: 'list_exceptions' | 'list_heuremoteur',
    fileName: string = 'export'
): Promise<void> => {
    switch (format) {
        case 'excel':
            await exportToExcel(data, dataType, fileName);
            break;
        case 'csv':
            await exportToCSV(data, dataType, fileName);
            break;
        case 'pdf':
            await exportToPDF(data, dataType, fileName);
            break;
        default:
            throw new Error('Format non supporté');
    }
};

// Export Excel
const exportToExcel = (data: any, dataType: string, fileName: string) => {
    let baseData;

    if (dataType === 'list_exceptions') {
        baseData = data.map((item: Exception) => {
            const baseData = {
                'ID': item.ids,
                'Date': item.dates,
                'Véhicule': item.vehicle_name,
                'Nombre de speedings': item.nbrsp,
                'Nombre de Hash braking': item.nbrhb,
                'Nombre de Hash Acceleration': item.nbha,
                'Groupe de Véhicule': item.group_name
            };

            return baseData;
        })
    }

    if (dataType === 'list_heuremoteur') {
        baseData = data.map((item: HeureMoteur) => {
            const baseData = {
                'ID': item.ids,
                'Date': item.dates,
                'Véhicule': item.vehicle_name,
                'Durée totale': item.dureetotal,
                'Durée en mouvement': item.dureel,
                'Arrêt moteur': item.arretmoteurtournant,
                'Distance (km)': item.distancekm,
                'Vitesse max': item.vmax,
                'Utilisation (%)': item.percentuse,
                'Consommation totale': item.consototal,
                'Conso/100km': item.conso100km,
                'Conso/h': item.consolitperhour,
                'Groupe de Véhicule': item.group_name
            };

            return baseData;
        })
    }


    const worksheet = utils.json_to_sheet(baseData);

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, dataType === 'exceptions' ? 'Exceptions' : 'Heures Moteurs');
    writeFile(workbook, `${fileName}.xlsx`);
};

// Export CSV
const exportToCSV = (data: any, dataType: string, fileName: string) => {
    const headers = dataType === 'list_exceptions'
        ? 'ID,Date,Véhicule,Nombre de speedings,Nombre de Hash braking,Nombre de Hash Acceleration,Groupe de Véhicule'
        : 'ID,Date,Véhicule,Durée totale,Durée en mouvement,Arrêt moteur,Distance (km),Vitesse max,Utilisation (%),Consommation totale,Conso/100km,Conso/h,Groupe';
    const dataArr = dataType === 'list_exceptions' ?
        data.map((item: Exception) => {
            const baseRow = `"${item.ids}","${item.dates}","${item.vehicle_name}","${item.nbrsp}","${item.nbrhb}","${item.nbha}","${item.group_name}"`;
            return baseRow;
        }) : data.map((item: HeureMoteur) => {
            const baseRow = `"${item.ids}","${item.dates}","${item.vehicle_name}","${item.dureetotal}","${item.dureel}","${item.arretmoteurtournant}","${item.distancekm}","${item.vmax}","${item.percentuse}","${item.consototal}","${item.conso100km}","${item.consolitperhour}","${item.group_name}"`;
            return baseRow;
        })

    const csvContent = [
        headers,
        ...dataArr
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
};

// Export PDF
const exportToPDF = (data: any, dataType: string, fileName: string) => {
    const doc = new jsPDF();
    const title = dataType === 'list_exceptions'
        ? 'Liste des exceptions'
        : 'Liste des heures moteurs';

    // Titre
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // En-têtes et données
    const headers = dataType === 'list_exceptions'
        ? ['ID', 'Date', 'Véhicule', 'Nombre de speedings', 'Nombre de Hash braking', 'Nombre de Hash Acceleration', 'Groupe de Véhicule']
        : ['ID', 'Date', 'Véhicule', 'Durée totale', 'Durée en mouvement', 'Arrêt moteur', 'Distance(km)', 'Vitesse max', 'Utilisation(%)', 'Consommation totale', 'Conso / 100km', 'Conso / h', 'Groupe'];

    const tableData = dataType === 'list_exceptions' ? data.map((item: Exception) => {
        const row = [
            item.ids.toString(),
            item.dates.toString(),
            item.vehicle_name.toString(),
            item.nbrsp.toString(),
            item.nbrhb.toString(),
            item.nbha.toString(),
            item.group_name.toString()
        ];
        return row;
    }) : data.map((item: HeureMoteur) => {
        const row = [
            item.ids.toString(),
            item.dates.toString(),
            item.vehicle_name.toString(),
            item.dureetotal.toString(),
            item.dureel.toString(),
            item.arretmoteurtournant.toString(),
            item.distancekm.toString(),
            item.vmax.toString(),
            item.percentuse.toString(),
            item.consototal.toString(),
            item.conso100km.toString(),
            item.consolitperhour.toString(),
            item.group_name.toString()
        ];
        return row;
    });

    autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 30,
        styles: {
            cellPadding: 3,
            fontSize: 9,
            valign: 'middle',
            halign: 'left',
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        },
    });

    doc.save(`${fileName}.pdf`);
};


