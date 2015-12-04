# jsreport-azure-storage
[![NPM Version](http://img.shields.io/npm/v/jsreport-azure-storage.svg?style=flat-square)](https://npmjs.com/package/jsreport-azure-storage)
[![Build Status](https://travis-ci.org/jsreport/jsreport-azure-storage.png?branch=master)](https://travis-ci.org/jsreport/jsreport-azure-storage)

> jsreport extension adding support for storing blobs in azure storage

Some of the jsreport extensions requires a blob storage for storing binary objects. This implementation stores these objects like output reports inside cost effective azure blob storage.

##Configuration

Required options are:
- `accountName`:  azure blob storage account name
- `accountKey`:  azure blob storage account key

Optionally you can set
- `container`: azure blob storage container, this defaults to jsreport

You can pass these options into jsreport in following ways:

- Through global `blobStorage` options
```js
{
	"blobStorage": {  
		"name": "azure-storage", 
		"accountName": "...", 
		"accountKey": "...", 
		"container": "..."
	 }
}
```	
- Through extension name in global configuration
```js
{
	"azure-storage": { }
}
```

- Pass options directly when using jsreport-core manually
```js
var jsreport = require('jsreport-core')
jsreport.use(require('jsreport-azure-storage')({}))
```
