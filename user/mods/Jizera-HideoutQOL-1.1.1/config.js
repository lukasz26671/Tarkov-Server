//config.js
module.exports = {
    "HideoutAreas":{
        "UseCustomConstructionTime": true, //false: default; true: Use a custom timer for structure construction time
        "SetConstructionTime": 0, //Time in seconds

        "RequirementMultipliers":{
            "UseCustomRequirements": false, //false: default; true: Use a custom requirements for structure construction
            "MoneyRequirementMultiplier": 1, // 1 is default
            "CommonRequirementMultiplier": 1, // 1 is default
            "RareRequirementMultiplier": 1, // 1 is default
            "SuperrareRequirementMultiplier": 1 // 1 is default
        },

        "RemoveFuelRequirement": false, //false: default; true: Remove fuel consumption
    },
    "HideoutProduction":{
        "UseCustomProductionTime": true, //false: default; true: Use a custom timer for item production time
        "SetProductionTime": 0, //Time in seconds; Bitcoin Farm and Water Collector unaffected by this setting; This will be a time ceiling. If value is greater than default value there will be no change.
        "BitcoinFarmProductionMultiplier": 1, //  1 is default
        "BitcoinFarmProductionLimitCount": 3, // 3 is default
        "WaterCollectorProductionMultiplier": 1, // 1 is default

        "RequirementMultipliers":{
            "UseCustomRequirements": false, //false: default; true: Use a custom requirements for structure construction
            "MoneyRequirementMultiplier": 1, // 1 is default
            "CommonRequirementMultiplier": 1, // 1 is default
            "RareRequirementMultiplier": 1, // 1 is default
            "SuperrareRequirementMultiplier": 1 // 1 is default
        },
        "ProductionMultiplier": 1, // 1 is default
    },
    "HideoutScavcase":{
        "UseCustomScavcaseTime": true, //false: default; true: Use a custom timer for scavcase time
        "SetScavcaseTime": 0, //Time in seconds
        "RequirementMultiplier": 1 // 1 is default
    }
}