export default class ChangeHandler {
  constructor(System) {
    this.System = System
    this.moduleMap = new Map()
    this.depMap = new Map()
    this.updateModuleMap()
    this.updateDepMap()
  }

  updateModuleMap() {
    let modules = Object.keys(this.System._loader.modules)
    if (modules.length != this.moduleMap.size) {
      this.moduleMap.clear()
      modules.forEach(m => {
        let [path, plugin] = m.split('!')
        this.moduleMap.set(path, plugin)
      })
    }
  }

  updateDepMap() {
    let modules = Object.keys(this.System.loads)
    if (modules.length != this.depMap.size) {
      this.depMap.clear()
      modules.forEach(m => {
        let deps = this.System.loads[m].depMap
        Object.keys(deps).forEach(dep => {
          let [path, plugin] = deps[dep].split('!')
          if (!this.depMap.get(path)) this.depMap.set(path, [])
          this.depMap.get(path).push(m.split('!')[0])
        })
      })
      console.log(this.depMap)
    }
  }

  fileChanged(path, reloadPageIfNeeded = true) {
    console.log("PATH CHANGED " + path)
    this.updateModuleMap()
    this.updateDepMap()

    if (!this.moduleMap.has(path)) {
      if (reloadPageIfNeeded) this.reload(path, "Change occurred to a file outside SystemJS loading")
      return
    }

    let pluginName = this.moduleMap.get(path)
    if (!pluginName) {
      if (reloadPageIfNeeded) this.reload(path, "Default plugin cannot hot-swap")
      return
    }

    this.System.load(pluginName).then(plugin => {
      if (!plugin.hotReload) {
        if (reloadPageIfNeeded) this.reload(path, `Plugin '${pluginName}' does not define a reload handler`)
        return
      }

      let systemPath = `${path}!${pluginName}`
      this.System.delete(systemPath)
      this.System.import(systemPath).then(module => {
        plugin.hotReload(module)
        console.log(`Reloaded ${path}`)
        let deps = this.depMap.get(path)
        if (deps) deps.forEach(dep => this.fileChanged(dep, false))
      })
    })
  }

  reload(path, reason) {
    //window.location.reload()
    console.info(`Change detected in ${path} that cannot be handled gracefully: ${reason}`)
    console.log(`Reloading in 2 seconds...`)
    setTimeout(() => console.log(`1...`), 1000)
    setTimeout(() => window.location.reload(), 1000)
  }
}
