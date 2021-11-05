const fs = require('fs');

module.exports = (dados) => {
    fs.rename('./src/downloads/ComprovanteOpcaoRegime.pdf', './src/downloads/'+dados+'.pdf', () => {
        console.log("\nFile Renamed!\n");
    })
};
