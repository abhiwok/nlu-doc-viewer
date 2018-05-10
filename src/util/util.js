function greedyChunkBySentence (text) {
  let maxChunkChars = 9800
  let splitBySentence = text.split('. ')
  let greedyChunks = []

  for (let chunk of splitBySentence) {
    // Check if the sentence itself is too big to chunk. if so, break it up by space
    if (chunk.length > maxChunkChars) {
      let splitBySpace = chunk.split(' ')
      for (let subChunk of splitBySpace) {
        if (greedyChunks.length > 0 && greedyChunks[greedyChunks.length - 1].length + subChunk.length < maxChunkChars) {
          greedyChunks[greedyChunks.length - 1] += ' ' + subChunk
        } else {
          if (greedyChunks.length > 0) {
            greedyChunks[greedyChunks.length - 1] += ' '
            greedyChunks.push(subChunk)
          } else {
            greedyChunks.push(subChunk)
          }
        }
      }
      continue
    }

    // Otherwise do it by sentence
    if (greedyChunks.length > 0 && greedyChunks[greedyChunks.length - 1].length + chunk.length < maxChunkChars) {
      greedyChunks[greedyChunks.length - 1] += '. ' + chunk
    } else {
      if (greedyChunks.length > 0) {
        greedyChunks[greedyChunks.length - 1] += '. '
        greedyChunks.push(chunk)
      } else {
        greedyChunks.push(chunk)
      }
    }
  }
  return greedyChunks
}

module.exports = {
  greedyChunkBySentence
}
