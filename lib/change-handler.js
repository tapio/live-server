export default class ChangeHandler {
  constructor(System) {
    this.System = System
    this.moduleMap = new Map()
    this.updateModuleMap()
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

  fileChanged(path) {
    this.updateModuleMap()

    if (!this.moduleMap.has(path)) {
      this.reload(path, "Change occurred to a file outside SystemJS loading")
      return
    }

    let pluginName = this.moduleMap.get(path)
    if (!pluginName) {
      this.reload(path, "Default plugin cannot hot-swap")
      return
    }

    this.System.load(pluginName).then(plugin => {
      if (!plugin.hotReload) {
        this.reload(path, `Plugin '${pluginName}' does not define a reload handler`)
        return
      }

      // At the moment, with only one plugin, it's just a matter of calling
      // System.load again. The reloading of the CSS is a side effect of this
      // process.
      this.System.import(`${path}?${new Date().valueOf()}!${pluginName}`).then(module => {
        plugin.hotReload(module)
        console.log(`Reloaded ${path}`)
      })
    })
  }

  reload(path, reason) {
    window.location.reload()
    //console.info(`Change detected in ${path} that cannot be handled gracefully: ${reason}`)
    //console.log(`Reloading in 2 seconds...`)
    //setTimeout(() => console.log(`1...`), 1000)
    //setTimeout(() => window.location.reload(), 1000)
  }
}
