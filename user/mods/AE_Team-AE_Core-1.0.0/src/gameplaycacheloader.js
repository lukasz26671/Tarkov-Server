exports.mod = (mod_data) => {
  let config = mod_data.settings;
  let PathResolver = global.internal.path.resolve;

  const cacheLoad = function (filepath) {
    return global.fileIO.readParsed(PathResolver(filepath));
  };
  logger.logInfo(`—————————————————————————————————————————`);
  logger.logInfo(`\x1b[91m[GAMEPLAY CACHE CORE] ${mod_data.name} Started\x1b[40m`);
  logger.logInfo(`—————————————————————————————————————————`);

  //START ------- BIG VARIABLE LOAD
  let items = cacheLoad("user/cache/items.json");
  let locations = cacheLoad("user/cache/locations.json");
  //END ------- BIG VARIABLE LOAD



  //START ------- Raid Time Modifier
  if (config.raidTimeToggle == true) {
    const mapModifier = config.raidTimeConfig.modifiers.mapModifier;
    const timeModifier = config.raidTimeConfig.modifiers.timeModifier;


    for (const name in config.raidTimeConfig.locations.base) {
      let timelimit = locations[name].base.escape_time_limit;
      let temp; // will hold modified time based on mapModifier and timeModifier
      let mapTimeConfig; // will hold mapTimeModifier based on mapModifier
      let minutes; // will hold minutes based on mapModifier and timeModifier
      let multiplier; // will hold multiplier based on mapModifier and timeModifier

      if (mapModifier === "all"){
        mapTimeConfig = config.raidTimeConfig.locations.allMaps;
        if (timeModifier === "minutes") {
          if (typeof mapTimeConfig != "undefined") {
            minutes = mapTimeConfig.minutes;
            if (minutes <= 0) {
              logger.logWarning(`You absolute retard, why would you set your raid timer to 0? It has been reset to 1. If you send me this error we will ban you.`);
              minutes = 1;
            }
            if (timelimit >= minutes) {
              temp = minutes;
            }
          }
        } else if (timeModifier === "multiplier") {
          multiplier = mapTimeConfig.multiplier;
  
          if (multiplier <= 0) {
            logger.logWarning(`You absolute retard, why would you set your raid timer multiplier to 0? It has been reset to 1. If you send me this error we will ban you.`);
            multiplier = 1;
          } else if (multiplier > 1) {
            temp = timelimit * multiplier;
          }
        }
      } else if (mapModifier === "each"){
        mapTimeConfig = config.raidTimeConfig.locations.base;
        if (timeModifier === "minutes") {
          minutes = mapTimeConfig[name].minutes;
            if (minutes <= 0) {
              logger.logWarning(`You absolute retard, why would you set your raid timer to 0? It has been reset to 1. If you send me this error we will ban you.`);
              minutes = 1;
            }
            if (timelimit >= minutes) {
              temp = minutes;
            }
        } else if (timeModifier === "multiplier") {
          multiplier = mapTimeConfig[name].multiplier;
  
          if (multiplier <= 0) {
            logger.logWarning(`You absolute retard, why would you set your raid timer multiplier to 0? It has been reset to 1. If you send me this error we will ban you.`);
          } else if (multiplier > 1) {
            temp = (timelimit * multiplier);
          }
        }
      }
    console.log(timelimit, "original time limit")
    locations[name].base.escape_time_limit = temp;
    console.log(locations[name].base.escape_time_limit, "modified time limit")
    }
  }
  //END ------- Raid Time Modifier


  //START ------- Based Item Loop
  for (let id in items.data) {
    //START ------- RaidModdable & ToolModdable set to true
    if (config.modInRaid == true) {
      if (items.data[id]._props && items.data[id]._props.Slots)
        for (let slot in items.data[id]._props.Slots) {
          items.data[id]._props.Slots[slot]._required;
          if (items.data[id]._props.Slots[slot]._required)
            items.data[id]._props.Slots[slot]._required = false;
        }
      if (items.data[id]._props.RaidModdable == false)
        items.data[id]._props.RaidModdable = true;
      if (items.data[id]._props.ToolModdable == false)
        items.data[id]._props.ToolModdable = true;
    } // END ------- RaidModdable & ToolModdable set to true

    //START ------- Recoil Tweaks
    if (config.recoilConfig.toggle == true) {
      let recoilConfig = config.recoilConfig;
      if (items.data[id]._props.weapClass === "pistol") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.pistolRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.pistolRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.pistolRecoil.verticalRecoil).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.pistolRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.pistolRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.pistolRecoil.dispersion).toFixed(0);

      }
      if (items.data[id]._props.weapClass === "smg") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.smgRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.smgRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.smgRecoil.SverticalRecoil).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.smgRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.smgRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.smgRecoil.dispersion).toFixed(0);

      }
      if (items.data[id]._props.weapClass === "shotgun") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.shotgunRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.shotgunRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.shotgunRecoil.verticalRecoil).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.shotgunRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.shotgunRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.shotgunRecoil.dispersion).toFixed(0);

      }
      if (items.data[id]._props.weapClass === "assaultRifle") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.assaultRifleRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.assaultRifleRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.assaultRifleRecoil.verticalRecoil).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.assaultRifleRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.assaultRifleRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.assaultRifleRecoil.dispersion).toFixed(0);

      }
      if (items.data[id]._props.weapClass === "assaultCarbine") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.assaultCarbineRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.assaultCarbineRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.assaultCarbineRecoil.verticalRecoil).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.assaultCarbineRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.assaultCarbineRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.assaultCarbineRecoil.dispersion).toFixed(0);

      }
      if (items.data[id]._props.weapClass === "machinegun") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.machinegunRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.machinegunRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.machinegunRecoil.MGVertRec).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.machinegunRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.machinegunRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.machinegunRecoil.dispersion).toFixed(0);

      }
      if (items.data[id]._props.weapClass === "marksmanRifle") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.marksmanRifleRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.marksmanRifleRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.marksmanRifleRecoil.verticalRecoil).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.marksmanRifleRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.marksmanRifleRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.marksmanRifleRecoil.dispersion).toFixed(0);

      }
      if (items.data[id]._props.weapClass === "sniperRifle") {
        items.data[id]._props.CameraRecoil = (items.data[id]._props.CameraRecoil * recoilConfig.sniperRifleRecoil.cameraRecoil).toFixed(3);
        items.data[id]._props.CameraSnap = (items.data[id]._props.CameraSnap * recoilConfig.sniperRifleRecoil.cameraSnap).toFixed(3);
        items.data[id]._props.RecoilForceUp = (items.data[id]._props.RecoilForceUp * recoilConfig.sniperRifleRecoil.verticalRecoil).toFixed(3);
        items.data[id]._props.RecoilForceBack = (items.data[id]._props.RecoilForceBack * recoilConfig.sniperRifleRecoil.horizontalRecoil).toFixed(3);
        items.data[id]._props.Convergence = (items.data[id]._props.Convergence * recoilConfig.sniperRifleRecoil.convergence).toFixed(2);
        items.data[id]._props.RecolDispersion = (items.data[id]._props.RecolDispersion * recoilConfig.sniperRifleRecoil.dispersion).toFixed(0);

      }
    } //END ------- Recoil Tweaks

    //START ------- Unblock Folding
    if (config.unblockFolding == true) {
      if (items.data[id]._props.BlocksFolding)
        items.data[id]._props.BlocksFolding = false;
    }
    //START ------- Unblock Folding

    //START ------- Hearing Tweaks
    if (config.hearingConfig.toggle == true) {
      if (items.data[id]._parent == "5645bcb74bdc2ded0b8b4578") {
        items.data[id]._props.Distortion =
          items.data[id]._props.Distortion *
          config.hearingConfig.distortion_Multiplier;
        items.data[id]._props.AmbientVolume =
          items.data[id]._props.AmbientVolume *
          config.hearingConfig.ambient_noise_reduction_moltiplier;
        if (config.hearingConfig.full_Stat_Control)
          for (let stat in config.hearingConfig.stats)
            items.data[id]._props[stat] = config.hearingConfig.stats[stat];
      } else if (items.data[id]._props.DeafStrength) {
        if (config.hearingConfig.maximum_helmet_deafness != "High")
          if (config.hearingConfig.maximum_helmet_deafness == "Low")
            if (items.data[id]._props.DeafStrength == "High")
              items.data[id]._props.DeafStrength = "Low";
        if (config.hearingConfig.maximum_helmet_deafness == "None")
          items.data[id]._props.DeafStrength = "None";
      }
    }
    //END ------- Hearing Tweaks
  }
  //END ------- Based Item Loop

    // Writing to file
    fileIO.write(PathResolver("user/cache/items.json"), items, true, false);
    
    fileIO.write(PathResolver("user/cache/locations.json"), locations, true, false)

  // Logging success on modload
  logger.logInfo(`—————————————————————————————————————————`);
  logger.logSuccess(`\x1b[91m[GAMEPLAY CACHE CORE] ${mod_data.name} Completed\x1b[40m`);
  logger.logInfo(`—————————————————————————————————————————`);
}