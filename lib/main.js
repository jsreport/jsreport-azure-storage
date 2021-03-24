const azure = require('azure-storage')
const stream = require('stream')

module.exports = function (reporter, definition) {
  if (reporter.options.blobStorage.provider !== 'azure-storage') {
    definition.options.enabled = false
    return
  }

  definition.options.container = definition.options.container || 'jsreport'

  /* if (!options.accountName) {
    throw new Error('accountName must be provided to jsreport-azure-storage')
  }

  if (!options.accountKey) {
    throw new Error('accountKey must be provided to jsreport-azure-storage')
  } */

  let blobService
  if (definition.options.connectionString) {
    blobService = azure.createBlobService(definition.options.connectionString)
  } else {
    blobService = azure.createBlobService(definition.options.accountName, definition.options.accountKey)
  }

  reporter.blobStorage.registerProvider({
    init: () => new Promise((resolve, reject) => {
      blobService.createContainerIfNotExists(definition.options.container, (err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    }),
    read: (blobName) => blobService.createReadStream(definition.options.container, blobName),
    write: (blobName, buffer) => {
      return new Promise((resolve, reject) => {
        const s = new stream.Readable()
        s._read = () => {}
        s.push(buffer)
        s.push(null)
        blobService.createBlockBlobFromStream(definition.options.container, blobName, s, buffer.length, (err, responseBlob, response) => {
          if (err) {
            return reject(err)
          }

          resolve(blobName)
        })
      })
    },
    remove: (blobName) => {
      return new Promise((resolve, reject) => {
        blobService.deleteBlob(definition.options.container, blobName, (err) => {
          if (err) {
            return reject(err)
          }

          resolve()
        })
      })
    }
  })
}
