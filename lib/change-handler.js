export default class ChangeHandler {
  constructor(System) {
    this.System = System
    this.moduleMap = new Map()
    this.depMap = new Map()
    this.updateModuleMap()
    this.updateDepMap()
  }

  updateModuleMap() {
    let modules = Object.keys(this.System.loads || {})
    if (modules.length != this.moduleMap.size) {
      this.moduleMap.clear()
      modules.forEach(moduleName => {
        let meta = this.System.loads[moduleName].metadata,
          path = meta.pluginArgument || meta.loaderArgument || moduleName + ".js"
        this.moduleMap.set(path, {moduleName, loader: meta.plugin || meta.loaderModule})
      })
    }
  }

  updateDepMap() {
    let modules = Object.keys(this.System.loads || {})
    if (modules.length != this.depMap.size) {
      this.depMap.clear()
      modules.forEach(m => {
        let deps = this.System.loads[m].depMap
        Object.keys(deps).forEach(dep => {
          let [path, loader] = deps[dep].split('!')
          if (!this.depMap.get(path)) this.depMap.set(path, [])
          this.depMap.get(path).push(m.split('!')[0])
        })
      })
    }
  }

  fileChanged(path, reloadPageIfNeeded = true) {
    this.updateModuleMap()
    this.updateDepMap()
    console.log(path)
    console.log(this.moduleMap)
    console.log(this.depMap)

    if (!this.moduleMap.has(path)) {
      if (reloadPageIfNeeded) this.reload(path, "Change occurred to a file outside SystemJS loading")
      return
    }

    let moduleInfo = this.moduleMap.get(path)

    this.System.import(moduleInfo.moduleName).then(oldModule => {
      console.log(oldModule)
      if (!oldModule.__hotReload) {
        return Promise.reject(`${path} is not hot reloadable!`)
      }
      //if (!moduleInfo.loader) {
      //  return Promise.reject("Default loader cannot hot-swap")
      //}
      //
      let loader = moduleInfo.loader && (moduleInfo.loader.default || moduleInfo.loader)
      //if (!loader.hotReload) {
      //  return Promise.reject(`Loader '${loader}' does not define a reload handler`)
      //}

      this.System.delete(moduleInfo.moduleName)
      this.System.import(moduleInfo.moduleName).then(newModule => {
        if (oldModule.__hotReload === true) {
          console.log("DEFAULT RELOAD STRATEGY")
        } else if (typeof oldModule.__hotReload === "function") {
          oldModule.__hotReload.call(oldModule, loader, newModule)
        }
        //loader.hotReload(module)
        console.log(`Reloaded ${path}`)
        //let deps = this.depMap.get(path)
        //if (deps) deps.forEach(dep => this.fileChanged(dep, false))
      })
    }).catch(reason => {
      if (reloadPageIfNeeded) this.reload(path, reason)
    })
  }

  reload(path, reason) {
    console.info(`Change detected in ${path} that cannot be handled gracefully: ${reason}`)
    //window.location.reload()
  }
}
