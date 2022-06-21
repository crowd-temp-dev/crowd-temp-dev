module.exports = {
  /***
   * Returns new entries with the given prefix
   * @param {string} prefix color prefix eg: 'base'
   * @param {object} entries entries of colors eg: {surface: "#FFF"}
   * @returns {{prefixedName: value}}
   * * */
  colorPrefix(prefix, entries) {
    const output = {}

    for (const key in entries) {
      const entryKey = prefix
        ? `${prefix}${key ? `-${key}` : ''}`
        : key || prefix

      output[entryKey] = entries[key]
    }

    return output
  },

  /**
   * Returns an array of numbers according to the length param
   * @param {number} length length of array
   * @param {requestCallback} map function to map values
   * **/
  getEntries(length, map) {
    return Object.fromEntries(
      Array.from(
        {
          length,
        },
        (_, index) => {
          return map(index)
        }
      )
    )
  },
}
