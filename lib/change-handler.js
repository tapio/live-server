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

    let plugin = this.moduleMap.get(path)
    if (!plugin) {
      this.reload(path, "Default plugin cannot hot-swap")
      return
    }

    if (!plugin.reload) {
      this.reload(path, `Plugin '${plugin}' does not define a reload handler`)
      return
    }

    plugin.reload(path)
  }

  reload(path, reason) {
    console.info(`Change detected in ${path} that cannot be handled gracefully: ${reason}`)
    console.log(`Reloading in 2 seconds...`)
    setTimeout(() => console.log(`1...`), 1000)
    setTimeout(() => window.location.reload(), 2000)
  }
}
