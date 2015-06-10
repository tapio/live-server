import F from 'fkit'

const notChecked = ( pair ) => {
    return !(pair[0] == "default" || /^__/.exec( pair[0] ))
  },
  pairsEqual = (pairs) => {
    let [ pairA, pairB ] = pairs
    return pairA[0] === pairB[0] && pairA[1] === pairB[1]
  },
  compareModules = ( moduleA, moduleB ) => {
    let a = F.filter( notChecked, F.pairs( moduleA ) ).concat( F.pairs( moduleA.default || {} )),
      b = F.filter( notChecked, F.pairs( moduleB ) ).concat( F.pairs( moduleB.default || {} ))
    return a.length == b.length && F.all(pairsEqual, F.zip( a, b ))
  }

export default class ChangeHandler {
  constructor( System ) {
    this.System = System
    this.moduleMap = new Map()
    this.depMap = new Map()
    this.updateModuleMap()
    this.updateDepMap()
  }

  updateModuleMap() {
    let modules = Object.keys( this.System.loads || {} )
    if ( modules.length != this.moduleMap.size ) {
      this.moduleMap.clear()
      modules.forEach( moduleName => {
        let meta = this.System.loads[moduleName].metadata,
          path = meta.pluginArgument || meta.loaderArgument || moduleName
        this.moduleMap.set( path, { moduleName, loader: meta.plugin || meta.loaderModule } )
      } )
    }
  }

  updateDepMap() {
    let modules = Object.keys( this.System.loads || {} )
    if ( modules.length != this.depMap.size ) {
      this.depMap.clear()
      modules.forEach( m => {
        let meta = this.System.loads[m].metadata,
          path = meta.pluginArgument || meta.loaderArgument || m
        this.depMap.set( path, [] )
      })
      modules.forEach( m => {
        let deps = this.System.loads[m].depMap
        Object.keys( deps ).forEach( dep => {
          let [path, loader] = deps[dep].split( '!' )
          this.depMap.get( path ).push( m.split( '!' )[0] )
        } )
      } )
    }
  }

  fileChanged( _path, reloadPageIfNeeded = true ) {
    this.updateModuleMap()
    this.updateDepMap()
    let path = _path.replace( /\.js$/, '' )

    if ( !this.moduleMap.has( path ) ) {
      if ( reloadPageIfNeeded ) this.reload( path, "Change occurred to a file outside SystemJS loading" )
      return
    }

    let moduleInfo = this.moduleMap.get( path )

    this.System.import( moduleInfo.moduleName ).then( oldModule => {
      if ( !oldModule.__hotReload ) {
        return Promise.reject( `${path} is not hot reloadable!` )
      }
      //if (!moduleInfo.loader) {
      //  return Promise.reject("Default loader cannot hot-swap")
      //}
      //
      let loader = moduleInfo.loader && (moduleInfo.loader.default || moduleInfo.loader)
      //if (!loader.hotReload) {
      //  return Promise.reject(`Loader '${loader}' does not define a reload handler`)
      //}

      this.System.delete( moduleInfo.moduleName )
      this.System.import( moduleInfo.moduleName ).then( newModule => {
        let propagate;
        if ( oldModule.__hotReload === true ) {
          propagate = true;
        } else if ( typeof oldModule.__hotReload === "function" ) {
          propagate = oldModule.__hotReload.call( oldModule, loader, newModule )
        }
        console.log( `Reloaded ${path}` )

        console.log(oldModule.default || oldModule)
        console.log(newModule.default || newModule)
        console.log(compareModules(oldModule, newModule))
        if ( propagate && !compareModules(oldModule, newModule) ) {
          let deps = this.depMap.get( path )
          if ( deps ) deps.forEach( dep => this.fileChanged( dep ) )
        } else {
          console.log( `No need to propagate` )
        }
      } )
    } ).catch( reason => {
      if ( reloadPageIfNeeded ) this.reload( path, reason )
    } )
  }

  reload( path, reason ) {
    console.info( `Change detected in ${path} that cannot be handled gracefully: ${reason}` )
    //window.location.reload()
  }
}
