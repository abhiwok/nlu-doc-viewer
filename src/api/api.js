let runNLU = require('./nlu').runNLU
let mammoth = require('mammoth')
let fs = require('fs')
let path = require('path')
let glob = require('glob')

async function getFiles (req, res, next) {
  var files = fs.readdirSync('./samples');
  files = files.filter(function(item) {
    return item != ".DS_Store"
  })
  res.status(200).send(files)
}

async function uploadFile (req, res, next) {
  try {
    fs.writeFile('./samples/' + req.file.originalname, req.file.buffer)
    res.status(200).send()
  } catch(e) {
    res.status(500).send('Error uploading file')
    return
  }
}

async function extractEntities (req, res, next) {
  let samples = glob.sync('./samples/*.{docx, txt}').map(val => path.basename(val))
  if (!samples.includes(req.body.filename)) {
    res.status(500).send('File Not Found')
    return
  }
  let filename = './samples/' + req.body.filename
  let text = ''
  try {
    if (filename.match(/.*.txt$/)) {
      text = fs.readFileSync(filename).toString()
    } else if (filename.match(/(.*.docx$)/)) {
      try {
        text = (await mammoth.extractRawText(fs.readFileSync(filename))).value
      } catch (e) {
        console.log(e)
        res.status(500).send('Invalid Doc Type')
        return
      }
    } else {
      res.status(500).send('File Not Found')
      return
    }
  } catch (e) {
    res.status(500).send('Error Extracting Text')
    return
  }

  if (!text) {
    res.status(500).send('No Text Received')
    return
  }
  try {
    ret = await runNLU(text)
    res.status(200).send(ret)
    return
  } catch (e) {
    res.status(500).send(JSON.stringify(e))
  }
}

async function getPlain (req, res, next) {
  let samples = glob.sync('./samples/*.{docx, txt}').map(val => path.basename(val))
  if (!samples.includes(req.body.filename)) {
    res.status(500).send('File Not Found')
    return
  }
  let filename = './samples/' + req.body.filename
  let text = ''
  try {
    if (filename.match(/.*.txt$/)) {
      text = fs.readFileSync(filename).toString()
    } else if (filename.match(/(.*.docx$)/)) {
      try {
        text = (await mammoth.extractRawText(fs.readFileSync(filename))).value
      } catch (e) {
        console.log(e)
        res.status(500).send('Invalid Doc Type')
        return
      }
    } else {
      res.status(500).send('File Not Found')
      return
    }
  } catch (e) {
    res.status(500).send('Error Extracting Text')
    return
  }

  if (!text) {
    res.status(500).send('No Text Received')
    return
  }
  let ret = {
    entities: [],
    text: text
  }
  res.status(200).send(ret)
}

module.exports = {
  extractEntities,
  getPlain,
  uploadFile,
  getFiles
}
