/**
 * Highlights the extracted entities returned from NLU
 * and creates an associated legend
 *
 * @param {Object[]} entities - Array of entities returned from NLU
 * @param {string}  entities.type - The extracted type returned from NLU ex: 'high risk vehicle'
 * @param {string}  entities.text - The input text matched to the extracted entity from NLU ex: 'motorcycle'
 * @param {string}  text - The original text passed to NLU for analysis
 *
 * @returns {text, entities} Formatted string representations of the annotations
 */
 function annotate (entities, text) { //eslint-disable-line
  var entityMap = []
  var entitiesText = ''
  var entityNumber = 0
  var previousEntities = []
  text = text.replace(/(\n|\r)/g, '<br>')

  entities.forEach(function (entity, i) {
    var newType = false
    // Just to keep an index of entities and their CSS class
    if (!entityMap[entity.type]) {
      entityMap[entity.type] = 'entityType' + entityNumber
      entityNumber++
      newType = true
    }
    if (!previousEntities.includes(entity.text.trim())) {
      // Escape regex characters included in the entity
      var regexStr = entity.text.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      var replaceRegEx = RegExp('\\b' + regexStr + '\\b', 'gi')
      text = text.replace(replaceRegEx, '<span class="' + entityMap[entity.type] + '" title="' + entity.type + '">' + entity.text.trim() + '</span>')
      // Don't need repeats of existing items
      if (newType) {
        entitiesText += '<li class="entity"><span class="' + entityMap[entity.type] + '" title="' + entity.type + '">' + entity.type + '</span></li>  '
      }
      previousEntities.push(entity.text.trim())
    }
  })
  return {
    text: text,
    entities: entitiesText
  }
}

module.exports = annotate
//
// Example
//

/*
 var entities = [
   {
     type: 'high risk vehicle',
     text: 'motorcycle'
   },
   {
     type: 'low risk vehicle',
     text: 'sedan'
   }
 ]
 var text = 'The individual owns a sedan and a motorcycle. He drives the sedan when it is raining and the motorcycle when it is sunny.'

 console.log(annotate(entities, text))
 */
