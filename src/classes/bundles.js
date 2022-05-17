"use strict";

class BundlesServer {
  constructor() {
    this.bundles = [];
    this.bundleBykey = {};
    this.backendUrl = `https://${serverConfig.ip}:${serverConfig.port}`;
  }

  initialize() {
    if (res.bundles.folders !== undefined && Object.keys(res.bundles.folders).length > 0) {
      for (var f of Object.keys(res.bundles.folders)) {
        var path = res.bundles.folders[f];
        if (!fileIO.exist(path)) continue;
        var files = fileIO
          .readDir(path, true)
          .filter((x) => x.endsWith(".bundle"))
          .map((x) => internal.path.resolve(path, x));
        for (var file in files) {
          this.loadBundle(files[file]);
        }
      }
    }
    if (res.bundles.files !== undefined && Object.keys(res.bundles.files).length > 0) {
      for (var f of Object.keys(res.bundles.files)) {
        var path = res.bundles.files[f];
        if (!fileIO.exist(path)) continue;
        if (path.endsWith(".bundle")) this.loadBundle(path);
      }
    }
    console.log(this.bundles);
    console.log(this.bundleBykey);
  }

  loadBundle(itemPath) {
    var fullItemPath = internal.path.resolve(itemPath);
    var uniformPath = fullItemPath.replace(/\\/g, "/");
    var key = undefined;

    if (uniformPath.toLowerCase().includes("/user/mods/")) key = uniformPath.split(/\/user\/mods\//i)[1];
    else if (uniformPath.toLowerCase().includes("/res/bundles/")) key = uniformPath.split(/\/res\/bundles\//i)[1];

    if (this.bundleBykey !== undefined && this.bundleBykey[key] !== undefined) return;
    var manifestFile = itemPath + ".manifest";
    var dependencyKeys = [];
    if (fileIO.exist(manifestFile)) {
      var content = fileIO.read(manifestFile).toString();
      var dependencyKeys = content
        .replace(/\r/g, "")
        .split("\n")
        .filter((x) => x !== null && x.match(/^ *$/) === null);
    }
    var bundle = {
      key: key,
      path: this.getHttpPath(key),
      filePath: uniformPath,
      dependencyKeys: dependencyKeys,
    };
    logger.logInfo(`Load bundle manifest: ${bundle.key}`);
    this.bundles.push(bundle);
    this.bundleBykey[bundle.key] = bundle;

    console.log(this.bundles);
    console.log(this.bundleBykey);
  }

  getBundles(local) {
    let bundles = utility.DeepCopy(this.bundles);
    console.log(bundles);
    for (const bundle of bundles) {
      if (local) {
        bundle.path = bundle.filePath;
      }
      delete bundle.filePath;
    }
    return bundles;
  }

  getBundleByKey(key, local) {
    console.log(key);
    console.log(local);
    let bundle = utility.DeepCopy(this.bundleBykey[key]);
    if(bundle) {
      if (local) {
        bundle.path = bundle.filePath;
      }
      delete bundle.filePath;
      return bundle;
    }
    return undefined;
  }

  getHttpPath(key) {
    return `${this.backendUrl}/files/bundle/${encodeURI(key)}`;
  }
}
module.exports.handler = new BundlesServer();
