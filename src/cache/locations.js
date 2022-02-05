function Create_ForcedDynamicStruct(item_data) {
  let isStatic = false;
  let useGravity = false;
  let randomRotation = false;
  let position = { x: 0, y: 0, z: 0 };
  let rotation = { x: 0, y: 0, z: 0 };
  let IsGroupPosition = false;
  let GroupPositions = [];

  if (typeof item_data.IsStatic != "undefined") isStatic = item_data.IsStatic;
  if (typeof item_data.useGravity != "undefined")
    useGravity = item_data.useGravity;
  if (typeof item_data.randomRotation != "undefined")
    randomRotation = item_data.randomRotation;

  if (item_data.Position != 0 && item_data.Position != "0") {
    position.x = item_data.Position.x;
    position.y = item_data.Position.y;
    position.z = item_data.Position.z;
  }
  if (item_data.Rotation != 0 && item_data.Rotation != "0") {
    rotation.x = item_data.Rotation.x;
    rotation.y = item_data.Rotation.y;
    rotation.z = item_data.Rotation.z;
  }
  if (typeof item_data.IsGroupPosition != "undefined") {
    IsGroupPosition = item_data.IsGroupPosition;
    GroupPositions = item_data.GroupPositions;
  }

  return {
    Id: item_data.id,
    IsStatic: isStatic,
    useGravity: useGravity,
    randomRotation: randomRotation,
    Position: position,
    Rotation: rotation,
    IsGroupPosition: IsGroupPosition,
    GroupPositions: GroupPositions,
    Items: item_data.Items,
  };
}
function Create_StaticMountedStruct(item_data) {
  let isStatic = false;
  let useGravity = false;
  let randomRotation = false;
  let position = { x: 0, y: 0, z: 0 };
  let rotation = { x: 0, y: 0, z: 0 };
  let IsGroupPosition = false;
  let GroupPositions = [];

  if (typeof item_data.IsStatic != "undefined") isStatic = item_data.IsStatic;
  if (typeof item_data.useGravity != "undefined")
    useGravity = item_data.useGravity;
  if (typeof item_data.randomRotation != "undefined")
    randomRotation = item_data.randomRotation;
  if (item_data.Position != 0 && item_data.Position != "0") {
    position.x = item_data.Position.x;
    position.y = item_data.Position.y;
    position.z = item_data.Position.z;
  }
  if (item_data.Rotation != 0 && item_data.Rotation != "0") {
    rotation.x = item_data.Rotation.x;
    rotation.y = item_data.Rotation.y;
    rotation.z = item_data.Rotation.z;
  }
  if (typeof item_data.IsGroupPosition != "undefined") {
    IsGroupPosition = item_data.IsGroupPosition;
    GroupPositions = item_data.GroupPositions;
  }
  //console.log(typeof item_data.Items[0]);
  //console.log(item_data.id);
  let Root =
    typeof item_data.Items[0] == "string"
      ? item_data.id
      : item_data.Items[0]._id;
  return {
    Id: item_data.id,
    IsStatic: isStatic,
    useGravity: useGravity,
    randomRotation: randomRotation,
    Position: position,
    Rotation: rotation,
    IsGroupPosition: IsGroupPosition,
    GroupPositions: GroupPositions,
    Root: Root, // id of container
    Items: item_data.Items,
  };
}

/* Kings Bullshit */

exports.cache = () => {
  if (!serverConfig.rebuildCache) {
    return;
  }

  if (!fileIO.exist("user/cache/locations/")) {
    fileIO.mkDir("user/cache/locations/");
  }

  logger.logInfo("Caching: Locations");
  for (let name in db.locations.base) {
    let _location = { base: {}, waves: [], exits: {}, SpawnPointParams: {}, AirdropParameters: {}, loot: {}}
    let _locationBase = fileIO.readParsed(db.locations.base[name]);
    locationName = _locationBase.Id.toLowerCase();
    locationName = locationName.replace(/\s+/g, "");

    if (_location.base.Name == "factory") {
      if (locationName == "factory4_day") locationName = "factory4_day";
      else locationName = "factory4_night";
    }

    //_location.waves - Populating location waves
    if (typeof _locationBase.waves != "undefined") {
      _location.waves = _locationBase.waves;
    }

    _location.loot = { forced: [], mounted: [], static: [], dynamic: [] };
    if (typeof db.locations.loot[name] != "undefined") {
      let loot_data = fileIO.readParsed(db.locations.loot[name]);
      for (let type in loot_data) {
        for (item of loot_data[type]) {
          if (type == "static" || type == "mounted") {
            _location.loot[type].push(Create_StaticMountedStruct(item));
            continue;
          }
          _location.loot[type].push(Create_ForcedDynamicStruct(item));
        }
      }
    }

    _location.base = _locationBase;
    delete _location.base.waves;

    fileIO.write("user/cache/locations/" + locationName + "/" + "Waves.json", {"waves": _location.waves});
    //fileIO.write("user/cache/locations/" + locationName + "/" + "Exits.json", _location.exits)
    //fileIO.write("user/cache/locations/" + locationName + "/" + "SpawnPointParams.json", _location.SpawnPointParams)
    //fileIO.write("user/cache/locations/" + locationName + "/" + "AirdropParameters.json", _location.AirdropParameters)
    fileIO.write("user/cache/locations/" + locationName + "/" + "Base.json", {"base": _locationBase});
    fileIO.write("user/cache/locations/" + locationName + "/" + "Loot.json", {"loot": _location.loot});
  }
};

/*exports.cache = () => {
  if (!serverConfig.rebuildCache) {
    return;
  }
  logger.logInfo("Caching: locations.json");
  let locations = {};
  for (let name in db.locations.base) {
    let _location = { base: {}, loot: {} };
    _location.base = fileIO.readParsed(db.locations.base[name]);
    _location.loot = { forced: [], mounted: [], static: [], dynamic: [] };
    if (typeof db.locations.loot[name] != "undefined") {
      let loot_data = fileIO.readParsed(db.locations.loot[name]);
      for (let type in loot_data) {
        for (item of loot_data[type]) {
          if (type == "static" || type == "mounted") {
            _location.loot[type].push(Create_StaticMountedStruct(item));
            continue;
          }
          _location.loot[type].push(Create_ForcedDynamicStruct(item));
        }
      }
    }
    locations[name] = _location;
  }
  fileIO.write("user/cache/locations.json", locations, true, false);
};*/
