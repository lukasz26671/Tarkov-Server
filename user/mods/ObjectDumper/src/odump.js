exports.mod = (mod_data) => {
    if(mod_data.settings.enable){
        const fs = require('fs');
        fs.writeFileSync("./globalDump.json", JSON.stringify(global._database, null, 2));
    }    
}