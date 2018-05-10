function getRedactions (filename) {
  $.post(
  '/api/extract-entities',
  {
    filename: filename
  },
  function (data) {
    var annotations = annotate(data.entities, data.text)
    entities = annotations.entities
    $('#results').append('<div id="legend"><ul class="nobullets"><div class="entity-header">Legend</div>' + entities + '</ul></div>')
    $('#legend').hide()
    $('#results').append('<p id="redacted" class="hidden">' + annotations.text + '</p>')
    $('#redact-switch').attr("disabled", false)
    $('#redact-switch').change(function() {
      if(this.checked) {
        $('#redacted').removeClass('hidden')
        $('#document').addClass('hidden')
        $('#legend').animate({width: 'toggle'}, 500)
      } else {
        $('#document').removeClass('hidden')
        $('#redacted').addClass('hidden')
        $('#legend').animate({width: 'toggle'}, 500)
      }
    })      
  }
)
}

function getPlainText (filename) {
  $.post(
    '/api/get-plain',
    {
      filename: filename
    },
    function (data) {
      $('#empty').hide()
      $('#results').empty()
      $('#results').append('<div class="info-bar">' + filename + '<div class="redact-button">Redact<label class="switch"><input type="checkbox" id="redact-switch" disabled><span class="slider round"></span></label></div></div>')
      var annotations = annotate(data.entities, data.text)
      $('#results').append('<p id="document">' + annotations.text + '</p>')
      getRedactions(filename)
    }
  )
}

module.exports = {
  getPlainText,
  getRedactions
}
