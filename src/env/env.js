let dotenv = require('dotenv')
let cfenv = require('cfenv')
let fs = require('fs')
let vcapServices = {}
let envVars = {}
let appEnv = cfenv.getAppEnv()

dotenv.config()
process.env.BLUEBIRD_WARNINGS = 0

if (process.env.VCAP_SERVICES) {
  vcapServices = JSON.parse(process.env.VCAP_SERVICES)
// otherwise use our JSON file
} else if (appEnv.VCAP_APPLCATION) {
  vcapServices = appEnv.getServices()
} else {
  try {
    vcapServices = JSON.parse(fs.readFileSync('./vcap.env', 'utf8'))
  } catch (e) {
    console.log('no development vcap.env file found')
  }
}
// if running in Bluemix, use the environment variables
envVars.NATURAL_LANGUAGE_URL = appEnv.NATURAL_LANGUAGE_URL ? appEnv.NATURAL_LANGUAGE_URL : process.env.NATURAL_LANGUAGE_URL
envVars.NATURAL_LANGUAGE_PASSWORD = appEnv.NATURAL_LANGUAGE_PASSWORD ? appEnv.NATURAL_LANGUAGE_PASSWORD : process.env.NATURAL_LANGUAGE_PASSWORD
envVars.NATURAL_LANGUAGE_USERNAME = appEnv.NATURAL_LANGUAGE_USERNAME ? appEnv.NATURAL_LANGUAGE_USERNAME : process.env.NATURAL_LANGUAGE_USERNAME
envVars.NATURAL_LANGUAGE_CUSTOM_MODEL = appEnv.NATURAL_LANGUAGE_CUSTOM_MODEL ? appEnv.NATURAL_LANGUAGE_CUSTOM_MODEL : process.env.NATURAL_LANGUAGE_CUSTOM_MODEL
envVars.NATURAL_LANGUAGE_VERSION = appEnv.NATURAL_LANGUAGE_VERSION ? appEnv.NATURAL_LANGUAGE_VERSION : process.env.NATURAL_LANGUAGE_VERSION

console.log('---ENVIRONMENT VARIABLES---')
console.log(envVars)
console.log('------APP ENVIRONMENT------')
console.log(appEnv)
console.log('-------VCAP SERVICES-------')
console.log(vcapServices)

module.exports = {
  envVars,
  appEnv
}
