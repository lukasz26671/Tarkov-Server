exports.mod = (mod_data) => {
    // Getting data from mod.config.json
    //let ModFolderName = `${mod_data.author}-${mod_data.name}-${mod_data.version}`;
    //let ModFileNames = mod_data.filenames;
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
      if (items.data[id]._props.weapClass === "pistol") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.pistolRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.pistolRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.pistolRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.pistolRecoil.horizontalRecoil
        ).toFixed(3);
      }
      if (items.data[id]._props.weapClass === "smg") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.smgRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.smgRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.smgRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.smgRecoil.horizontalRecoil
        ).toFixed(3);
      }
      if (items.data[id]._props.weapClass === "shotgun") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.shotgunRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.shotgunRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.shotgunRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.shotgunRecoil.horizontalRecoil
        ).toFixed(3);
      }
      if (items.data[id]._props.weapClass === "assaultRifle") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.assaultRifleRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.assaultRifleRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.assaultRifleRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.assaultRifleRecoil.horizontalRecoil
        ).toFixed(3);
      }
      if (items.data[id]._props.weapClass === "assaultCarbine") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.assaultCarbineRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.assaultCarbineRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.assaultCarbineRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.assaultCarbineRecoil.horizontalRecoil
        ).toFixed(3);
      }
      if (items.data[id]._props.weapClass === "machinegun") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.machinegunRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.machinegunRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.machinegunRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.machinegunRecoil.horizontalRecoil
        ).toFixed(3);
      }
      if (items.data[id]._props.weapClass === "marksmanRifle") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.marksmanRifleRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.marksmanRifleRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.marksmanRifleRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.marksmanRifleRecoil.horizontalRecoil
        ).toFixed(3);
      }
      if (items.data[id]._props.weapClass === "sniperRifle") {
        items.data[id]._props.CameraRecoil = (
          items.data[id]._props.CameraRecoil *
          config.recoilConfig.sniperRifleRecoil.cameraRecoil
        ).toFixed(3);
        items.data[id]._props.CameraSnap = (
          items.data[id]._props.CameraSnap *
          config.recoilConfig.sniperRifleRecoil.cameraSnap
        ).toFixed(3);
        items.data[id]._props.RecoilForceUp = (
          items.data[id]._props.RecoilForceUp *
          config.recoilConfig.sniperRifleRecoil.verticalRecoil
        ).toFixed(3);
        items.data[id]._props.RecoilForceBack = (
          items.data[id]._props.RecoilForceBack *
          config.recoilConfig.sniperRifleRecoil.horizontalRecoil
        ).toFixed(3);
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


  // Logging success on modload
  logger.logInfo(`—————————————————————————————————————————`);
  logger.logSuccess(`\x1b[91m[GAMEPLAY CACHE CORE] ${mod_data.name} Completed\x1b[40m`);
  logger.logInfo(`—————————————————————————————————————————`);
}