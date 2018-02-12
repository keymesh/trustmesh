const glob = require('glob')
const jsonfile = require('jsonfile')

const DIR = 'build/contracts'
const NETS = [0, 1, 2, 3, 4, 42]

glob(`${DIR}/*.json`, (err, filenames) => {
  if (err) {
    console.error(`Error in openning the folder(${DIR}):\n`, err)
    process.exit(1)
  }
  filenames.forEach((filename) => {
    jsonfile.readFile(filename, 'utf8', (openErr, contractObject) => {
      if (openErr) {
        console.error(`Error in openning the file(${filename}):\n`, openErr)
        process.exit(1)
      }
      try {
        const allNetworks = contractObject.networks
        const newContractObject = Object.assign({}, contractObject)
        newContractObject.networks = Object.keys(allNetworks).reduce((result, networkIdStr) => {
          if (NETS.includes(Number(networkIdStr))) {
            Object.assign(result, { [networkIdStr]: allNetworks[networkIdStr] })
          }
          return result
        }, {})
        jsonfile.writeFile(filename, newContractObject, { spaces: 2 }, (writeErr) => {
          if (err) {
            console.error(`Error in saving the file(${filename}):\n`, writeErr)
            process.exit(1)
          }
        })
      } catch (processErr) {
        console.error(`Error in processing the file(${filename}):\n`, processErr)
        process.exit(1)
      }
    })
  })
})
