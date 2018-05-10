let express = require('express')
let extractEntities = require('../api/api').extractEntities
let uploadFile = require('../api/api').uploadFile
let getFiles = require('../api/api').getFiles
let getPlain = require('../api/api').getPlain
let bodyParser = require('body-parser')
let appEnv = require('../env/env').appEnv
let multer = require('multer')
// let passport = require('passport')
let storage = multer.memoryStorage()
let upload = multer({ storage: storage })
let app = express()

require('./auth')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(passport.authenticate('basic', { session: false }), (req, res, next) => {
//   if (req.user) {
//     next()
//   } else {
//     res.status(401).send('Incorrect Credentials')
//   }
// })

app.use('/', express.static('./public'))
app.get('/api/get-files', getFiles)
app.post('/api/upload-file', upload.single('file'), uploadFile)
app.post('/api/extract-entities', extractEntities)
app.post('/api/get-plain', getPlain)

app.listen(appEnv.isLocal ? 3000 : appEnv.port)
console.log('server listening at ' + (appEnv.isLocal ? appEnv.url.replace(appEnv.port, 3000) : appEnv.port))
