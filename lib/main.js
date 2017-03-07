var azure = require('azure-storage')
var q = require('q')

function Storage (options) {
  this.blobService = azure.createBlobService(options.accountName, options.accountKey)
  this.options = options
}

Storage.prototype.init = function () {
  return q.ninvoke(this.blobService, 'createContainerIfNotExists', this.options.container)
}

Storage.prototype.read = function (blobName, cb) {
  var stream = this.blobService.createReadStream(this.options.container, blobName)
  cb(null, stream)
}

Storage.prototype.write = function (blobName, buffer, cb) {
  this.blobService.createBlockBlobFromText(this.options.container, blobName, buffer, function (error, responseBlob, response) {
    if (error) {
      return cb(error)
    }

    return cb(null, blobName)
  })
}

Storage.prototype.remove = function (blobName, cb) {
  this.blobService.deleteBlob(this.options.container, blobName, function (err) {
    if (err) {
      return cb(err)
    }

    cb(null)
  })
}

module.exports = function (reporter, definition) {
  var options = {}
  var enabled = false
  if (reporter.options.blobStorage && reporter.options.blobStorage.name && reporter.options.blobStorage.name.toLowerCase() === 'azure-storage') {
    options = reporter.options.blobStorage
    enabled = true
  }

  if (Object.getOwnPropertyNames(definition.options).length) {
    options = definition.options
    // just temporary fix for current jsreport-core, remove afterwards
    reporter.options.blobStorage = {name: 'azure-storage'}
    enabled = true
  }

  if (!enabled) {
    return
  }

  options.container = options.container || 'jsreport'

  if (!options.accountName) {
    throw new Error('accountName must be provided to jsreport-azure-storage')
  }

  if (!options.accountKey) {
    throw new Error('accountKey must be provided to jsreport-azure-storage')
  }

  reporter.blobStorage = new Storage(options)
  return reporter.blobStorage.init()
}
