# Watson PII Redaction Lab
## Introduction
Ensuring that Personal Identifiable Information (PII) is not shared inappropriately is not only critical to maintaining customer trust but also to avoiding legal ramifications. However, simply locking away documents with PII leads companies to underutilize their valuable data. Due to the variable nature of PII, it is difficult to redact with rules based systems (ie: regex) and requires human involvement, a time consuming activity that's vulnerable to mistakes.

In this lab, you'll learn how to automatically redact sensitive information from a document. It'll focus on redacting three PII elements (Name, Social Security Number, and Date of Birth). This is done by identifying these elements within documents using a ML annotator built with Watson Knowledge Studio (WKS) and deployed to Natural Language Understanding (NLU). After the PII is identified, it can be excluded from the documents. While additional PII elements can be redacted by changing the WKS model, this will not be included in this lab. At the lab's conclusion, you will have a simple application that redacts name, SSN, and DOB from a .docx document using Natural Language Understanding and Watson Knowledge Studio.

## Set Up
The application requires the following applications:

1. Node (7.6+) Application runtime environment
2. NPM (5+) Server side dependency management

It also requires the following IBM Cloud technologies:

1. Natural Language Understanding (NLU)
2. Watson Knowledge Studio (WKS)

Gain credentials to NLU and WKS by making an IBM Cloud account [here](https://console.bluemix.net/registration/?cm_mc_uid=60002448143515166403848&cm_mc_sid_50200000=&cm_mc_sid_52640000= "IBM Cloud Sign Up") and creating instances of the services.

Additionally, training a WKS model involves uploading training documents and annotating those documents to train a SIRE model. For more documentation on how to create a WKS model, please consult the documentation  [here](https://console.bluemix.net/docs/services/watson-knowledge-studio/tutorials-create-project.html#wks_tutintro "WKS Documentation").

## Using the application
Go ahead and clone or download this repo. Then navigate to the file.

The application dependencies are controlled and defined in [package.json](./package.json) and [bower.json](./bower.json)

### 1. Install Requirements and Run App Locally
To install all required dependencies to both build the application and and execute the application, issue the following command.

```
npm install

```
In order to test the application in a local development environment, the application can be started in development mode by issuing the following command:

```
npm run develop

```

### 2. View App Locally on http://localhost:3001/

The credentials for the app are ibm/watson. Looking at the app locally, you will see that there are several documents on the left margin. Flipping through these documents, notice that there are several elements of PII that would need to be redacted. The variety in which the PII is presented is what makes this a problem suitable for a ML annotator.

Also, notice that when you click on a document, there is a "Redact" button on the upper right side of the screen. Currently, flipping that switch should do nothing, but we will initiate that functionality through this lab.

### 3. Overview the application code

Take a moment to scroll through the application code.

The application has 2 main entry points.

1. /
  * Static content is served from this path
2. /api
  * APIs are exposed at this path, details provided below.

 The main executable for the application is [server.js](./src/server/server.js)

***API Documentation***
 The application exposes the following APIs

 1. get-files
 2. upload-file
 3. get-plain
 4. extract-entities

 The star of the show is the extract-entities api which sends the files to NLU to be annotated by the WKS model.

***extract-entities***
 This operation performs the following steps.

 1. Receive an uploaded .txt or .docx file
 2. Extract the text content of the file
 3. Chunk the text with a greedy algorithm in order to ensure that the chunks sent to NLU contain the most context without breaking up logical groupings.
 4. Send these chunks to NLU in series.
 5. Piece the responses together and send a single response containing the text content of the file and the extracted entity definitions.


***Additional information about the greedy chunking algorithm***
 The [algorithm](./src/util/util.js) will attempt to send the largest block of text possible to NLU without breaking at lexically unnatural positions. It can be broken down further as

 1. Prefer to send complete sentences. Send as many complete sentences as possible.
 2. If a complete sentence exceeds the limits on its own, break the sentence up by word and send as many words as possible.
 3. If a single word exceeds the limits on its own, throw an error

#### 4. Edit the .env.example file
 Now we can start modifying the code to redact PII from the documents. Access the `.env.example` file, rename the file `.env` on your system, and input your credentials for NLU and a pre-trained WKS model.

#### 5. Initialize the Function to Call NLU
After putting in the appropriate environment variables, we can insert the functions to actually send text to NLU and annotate the documents.

**5a: Client Side**
On the client side, you need to insert the `getRedactions()` function into `/client/js/redact.js`.

`getRedactions()` will call the the extract-entities API and collect the annotation results for display.

```
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
```

**5b: Server Side**

On the server side, you need to add in following two functions `runNLU()` and `nluCustomEntitiesPromise()` to `/src/api/nlu.js`.

The `runNLU()` function will chunk up the text using a greedy algorithm, call NLU with those chunks, and collect the responses.
```
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
```

The `nluCustomEntitiesPromise()` function calls NLU with a custom WKS model and returns the resulting JSON.
```
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
```

#### 6. Test It Out!
Save your app and head back over to your local host. Now when you click on a document and flip the redact switch, you should see the PII redacted. Notice that WKS is able to identify this PII in different contexts.

### Conclusion
You did it! You successfully created an application that can effectively redact PII out of documents. Keep in mind that to replicate this functionality, you will need to create your own WKS model and deploy it to NLU. You can customize what PII elements you want to pull out and train on your own documents so the model can learn the context of your data. Refer to the WKS links above for doing that.

Thanks for participating!
