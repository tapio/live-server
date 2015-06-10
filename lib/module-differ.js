import F from 'fkit'

const notChecked = ( pair ) => {
    return !((pair[0] == "default" && typeof pair[1] === "object") || /^__/.exec( pair[0] ))
  },
  getPairs = ( module ) => {
    let pairs = F.filter( notChecked, F.pairs( module ) )
    if ( typeof module.default === "object" ) {
      return pairs.concat( F.pairs( module.default ) )
    } else {
      return pairs
    }
  },
  pairsEqual = ( pairs ) => {
    let [ pairA, pairB ] = pairs
    return pairA[0] === pairB[0] && pairA[1] === pairB[1]
  }

export default {
  shallowEqual( moduleA, moduleB ) {
    let a = getPairs(moduleA), b = getPairs(moduleB)
    return a.length == b.length && F.all( pairsEqual, F.zip( a, b ) )
  }
}
