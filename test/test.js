const jsreport = require('jsreport-core')
require('should')

describe('azure storage', () => {
  let reporter

  beforeEach(() => {
    reporter = jsreport({
      blobStorage: {
        provider: 'azure-storage'
      }
    })
    return reporter.use(require('../')({
      connectionString: 'defaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;'
    })).init()
  })

  afterEach(() => reporter.close())

  jsreport.tests.blobStorage()(() => reporter.blobStorage)
})
