const azure = require('azure-storage')

module.exports = function (reporter, definition) {
  if (reporter.options.blobStorage.provider !== 'azure-storage') {
    definition.options.enabled = false
    return
  }

  definition.options.container = definition.options.container || 'jsreport'

  if (!definition.options.accountName) {
    throw new Error('accountName must be provided to jsreport-azure-storage')
  }

  if (!definition.options.accountKey) {
    throw new Error('accountKey must be provided to jsreport-azure-storage')
  }

  const blobService = azure.createBlobService(definition.options.accountName, definition.options.accountKey)

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
        blobService.createBlockBlobFromText(definition.options.container, blobName, buffer, (err, responseBlob, response) => {
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
