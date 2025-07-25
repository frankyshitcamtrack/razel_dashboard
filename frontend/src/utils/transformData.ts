export const transformData = (rawData: { name: string, daylyConsom: number }[]) => {
    const groupedData: Record<string, number> = {};

    rawData.forEach(item => {
        if (!groupedData[item.name]) {
            groupedData[item.name] = 0;
        }
        groupedData[item.name] += item.daylyConsom;
    });

    return Object.entries(groupedData).map(([name, consumption]) => ({
        name,
        consumption
    }));
};


