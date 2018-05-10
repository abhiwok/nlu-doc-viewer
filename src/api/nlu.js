let request = require('request')
let envVars = require('../env/env').envVars
let greedyChunkBySentence = require('../util/util').greedyChunkBySentence

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

async function runNLU (text) {
	let chunks = greedyChunkBySentence(text)
	console.log('Text was chunked into ' + chunks.length + ' parts')
	let nluResponses = []
	let ret = {
	  entities: [],
	  text: ''
	}
	for (let chunk of chunks) {
	  // console.log(chunk)
	  ret.text += chunk
	  nluResponses.push( await nluCustomEntitiesPromise(chunk))
	}
	for (let response of nluResponses) {
	  ret.entities.push(...response.entities)
	}
	return ret
}

function nluCustomEntitiesPromise (text) {
  var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	  'username': envVars.NATURAL_LANGUAGE_USERNAME,
	  'password': envVars.NATURAL_LANGUAGE_PASSWORD,
	  'version_date': envVars.NATURAL_LANGUAGE_VERSION
	})

	var parameters = {
	  'text': text,
	  'features': {
	    'entities': {
	      'model':envVars.NATURAL_LANGUAGE_CUSTOM_MODEL
	    }
	  }
	}

	return new Promise((resolve, reject) => {
	    natural_language_understanding.analyze(parameters, function(err, response) {
	        if (err)
	          reject(err)
	        else
	          resolve(response)
	      })
	  })
}

module.exports = {
  runNLU
}
