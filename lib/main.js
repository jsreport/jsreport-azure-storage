const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const stream = require('stream')

module.exports = function (reporter, definition) {
  if (reporter.options.blobStorage.provider !== 'azure-storage') {
    definition.options.enabled = false
    return
  }

  definition.options.container = definition.options.container || 'jsreport'

  let blobServiceClient
  if (definition.options.connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(definition.options.connectionString)
  } else {
    const sharedKeyCredential = new StorageSharedKeyCredential(definition.options.accountName, definition.options.accountKey)

    blobServiceClient = new BlobServiceClient(
     `https://${definition.options.accountName}.blob.core.windows.net`,
     sharedKeyCredential
    )
  }

  const containerClient = blobServiceClient.getContainerClient(definition.options.container)

  reporter.blobStorage.registerProvider({
    init: () => containerClient.createIfNotExists(),
    read: async (blobName) => {
      try {
        const res = await containerClient.getBlockBlobClient(blobName).download()
        return res.readableStreamBody
      } catch (e) {
        const r = stream.Readable()
        r._read = () => {}
        process.nextTick(() => r.emit('error', e))
        return r
      }
    },
    write: (blobName, buffer) => {
      return containerClient.getBlockBlobClient(blobName).upload(buffer, Buffer.byteLength(buffer))
    },
    remove: (blobName) => containerClient.getBlockBlobClient(blobName).deleteIfExists(blobName)
  })
}
