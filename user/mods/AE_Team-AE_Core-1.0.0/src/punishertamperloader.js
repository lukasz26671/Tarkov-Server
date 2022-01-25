exports.mod = (mod_data) => {
  if (mod_data.settings.punisherEnabled == true) {
    //FireEqual: This edits the ORIGINAL files, disabling this for now
    //Life: this doesn't edit original files... it instead uses the files in the mod folder instead of original files...
    //**********************************adding punisher  */
    //changing gameplay.json to remove the bosstest from pmc type
    let gameplay = fileIO.readParsed(global.db.user.configs.gameplay);
    let peth = gameplay.bots;
    peth.pmc.types = {};
    peth.pmc.types = {
      test: 30,
      assault: 30,
      pmcBot: 30,
    };
    fileIO.write(global.db.user.configs.gameplay, gameplay);
    //getting the bosstest defaults to have the punisher appearance
    let app = fileIO.readParsed("db/bots/bosstest/appearance.json");
    let punapp = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/appearance.json"
    );
    app = {};
    app = punapp;
    fileIO.write("db/bots/bosstest/appearance.json", app);
    //getting default bosstest chances to have the punisher chances
    let chance = fileIO.readParsed("db/bots/bosstest/chances.json");
    let punchance = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/chances.json"
    );
    chance = {};
    chance = punchance;
    fileIO.write("db/bots/bosstest/chances.json", chance);
    //getting the default bosstest experience to have the punisher experience
    let exp = fileIO.readParsed("db/bots/bosstest/experience.json");
    let punexp = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/experience.json"
    );
    exp = {};
    exp = punexp;
    fileIO.write("db/bots/bosstest/experience.json", exp);
    //getting default bosstest generation to have punisher generation
    let gen = fileIO.readParsed("db/bots/bosstest/generation.json");
    let pungen = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/generation.json"
    );
    gen = {};
    gen = pungen;
    fileIO.write("db/bots/bosstest/generation.json", gen);
    //getting default bosstest health to have the punisher health
    let health = fileIO.readParsed("db/bots/bosstest/health.json");
    let punhealth = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/health.json"
    );
    health = {};
    health = punhealth;
    fileIO.write("db/bots/bosstest/health.json", health);
    //getting default bosstest inventory to have the punisher inventory
    let invet = fileIO.readParsed("db/bots/bosstest/inventory/0_80.json");
    let puninvet = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/inventory/0_80.json"
    );
    invet = [];
    invet = puninvet;
    fileIO.write("db/bots/bosstest/inventory/0_80.json", invet);
    //getting default bosstest name to be punisher name (frank castle)
    let names = fileIO.readParsed("db/bots/bosstest/names.json");
    let punnames = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/names.json"
    );
    names = {};
    names = punnames;
    fileIO.write("db/bots/bosstest/names.json", names);
    //getting default bosstest easy difficulty to be punisher easy difficulty
    let easy = fileIO.readParsed("db/bots/bosstest/difficulty/easy.json");
    let puneasy = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/difficulty/easy.json"
    );
    easy = {};
    easy = puneasy;
    fileIO.write("db/bots/bosstest/difficulty/easy.json", easy);
    //getting default bosstest hard difficulty to be punisher hard difficulty
    let hard = fileIO.readParsed("db/bots/bosstest/difficulty/hard.json");
    let punhard = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/difficulty/hard.json"
    );
    hard = {};
    hard = punhard;
    fileIO.write("db/bots/bosstest/difficulty/hard.json", hard);
    //getting default bosstest impossible difficulty to be punisher impossible difficulty
    let imp = fileIO.readParsed("db/bots/bosstest/difficulty/impossible.json");
    let punimp = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/difficulty/impossible.json"
    );
    imp = {};
    imp = punimp;
    fileIO.write("db/bots/bosstest/difficulty/impossible.json", imp);
    //getting default bosstest normal difficulty to be punisher normal difficulty
    let norm = fileIO.readParsed("db/bots/bosstest/difficulty/normal.json");
    let punnorm = fileIO.readParsed(
      "user/mods/AE_Team-AE_Core-1.0.0/src/Punisher/bosstest/difficulty/normal.json"
    );
    norm = {};
    norm = punnorm;
    fileIO.write("db/bots/bosstest/difficulty/normal.json", norm);
    //*******************************punisher loaded */
  }
};
