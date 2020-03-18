const azure = require('azure-storage')
const Duplex = require('stream').Duplex;
module.exports = function (reporter, definition) {
  if (reporter.options.blobStorage.provider !== 'azure-storage') {
    definition.options.enabled = false
    return
  }

  const options = Object.assign({}, definition.options)
  // avoid exposing connection string through /api/extensions
  definition.options = {}

  options.container = options.container || 'jsreport'

  if (!options.accountName) {
    throw new Error('accountName must be provided to jsreport-azure-storage')
  }

  if (!options.accountKey) {
    throw new Error('accountKey must be provided to jsreport-azure-storage')
  }

  const blobService = azure.createBlobService(options.accountName, options.accountKey)

  reporter.blobStorage.registerProvider({
    init: () => new Promise((resolve, reject) => {
      blobService.createContainerIfNotExists(options.container, (err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    }),
    read: (blobName) => blobService.createReadStream(options.container, blobName),
    write: (blobName, buffer) => {
      return new Promise((resolve, reject) => {
        let stream = new Duplex();
        stream.push(buffer);
        stream.push(null);
        blobService.createBlockBlobFromStream(options.container, blobName, stream, stream.readableLength, (err, responseBlob, response) => {
          if (err) {
            return reject(err)
          }

          resolve(blobName)
        })
      })
    },
    remove: (blobName) => {
      return new Promise((resolve, reject) => {
        blobService.deleteBlob(options.container, blobName, (err) => {
          if (err) {
            return reject(err)
          }

          resolve()
        })
      })
    }
  })
}
