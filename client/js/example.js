let Dropzone = require('dropzone')
let getRedactions = require('./redact').getRedactions
let getPlainText = require('./redact').getPlainText

/* global annotate $ */
// Only accept .txt, .doc, and .docx
var acceptFunction = function (file, done) {
  if (!file.name.match(/(.*.docx$|.*.txt$)/)) {
    window.alert('Please use a .docx, or .txt file')
    done('badfile')
  } else {
    done()
  }
}
// Configure dropzone and add the page element
var dropzone = new Dropzone('div#example-dropzone', {
  url: '/api/upload-file',
  clickable: true,
  dictDefaultMessage: "HELLO",
  accept: acceptFunction
})
// Handle errors in upload
dropzone.on('error', function (file, error) {
  if (error === 'badfile') {
    return
  }
  window.alert('Error uploading ' + file.name)
})
// Handle sucessful upload
dropzone.on('success', function(file) {
  dropzone.removeFile(file)
  refreshFiles()
})

function refreshFiles () {
  $.get(
    '/api/get-files',
    {},
    function(files) {
      var output = files.map(function(file, id) {
        return '<a id="pe-' + id + '" class="link"> ' + file + '</a>'
      })
      $("#file-list").empty()
      $("#file-list").append(output)
      files.map(function(file, id) {
        $("#pe-" + id).on('click', function () { getPlainText(file) })
      });
    }
  )
}

// Apply dropzone formatting
$(document).ready(function () {
  $('div#example-dropzone').addClass('dropzone')
  refreshFiles()
})
