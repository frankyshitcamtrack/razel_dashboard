function reverseAllArrays(data) {
    const reversedData = {};

    // Parcourir toutes les propriétés de l'objet
    for (const key in data) {
        if (Array.isArray(data[key])) {
            // Inverser le tableau sans modifier l'original
            reversedData[key] = [...data[key]].reverse();
        } else {
            // Copier les autres propriétés telles quelles
            reversedData[key] = data[key];
        }
    }

    return reversedData;
}

module.exports = { reverseAllArrays }