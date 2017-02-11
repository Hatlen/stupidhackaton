var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var wordResponses = [
  { word: 'hungrig', responses: ['Du borde ta en cigg!', 'Du menar hangry!', 'Drick vatten!'] },
  { word: 'törstig', responses: ['Ät mat!', 'Ät godis!'] },
  { word: 'wifi', responses: ['Titta ut!', 'Ta bussen!']},

];


var get = (text) => fetch('/api/?query=' + text)
    .then((response) => response.text())
    .then(response => console.log(response))
    .catch(err => console.log(err)
  );

var words = wordResponses.map(function(match) { return match.word });
var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + words.join(' | ') + ' ;'

function newSpeechRecognition() {
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'sv-SE';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function(event) {
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The [last] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object

  console.log('Confidence: ' + event.results[0][0].confidence);
  console.log('Result', event.results[0][0].transcript);

  result = event.results[0][0].transcript;    
    
  var wordResponse = wordResponses.find(function (innerWordResponse) {
    return result.match(new RegExp(innerWordResponse.word));
  });

  if (wordResponse) {
    var responseLength = wordResponse.responses.length;
    //console.log(responseLength);
    var index = Math.floor(Math.random() * responseLength);
    console.log(index);
    console.log(wordResponse.responses[index]);
    speak(wordResponse.responses[index]);
  }  
  //console.log(wordResponse)
  
  }  

  recognition.onspeechend = function() {
    recognition.stop();
    newSpeechRecognition();
  }

  recognition.onnomatch = function(event) {
    diagnostic.textContent = "I didn't recognise that color.";
  }

  recognition.onerror = function(event) {
    diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
  }

  recognition.start();  
}



var alva;
window.speechSynthesis.onvoiceschanged = function(e) {
  alva = speechSynthesis.getVoices().find(function (voice) {
    return voice.lang === 'sv-SE';
  });
};

function speak(text) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.voice = alva;
  console.log(alva);
  document.querySelector('.text_to_speech').innerHTML = text;
  window.speechSynthesis.speak(msg);
}



//var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
//var hints = document.querySelector('.hints');

var colorHTML= '';
words.forEach(function(v, i, a){
  console.log(v, i);
  colorHTML += '<span style="background-color:' + v + ';"> ' + v + ' </span>';
});
//hints.innerHTML = 'Tap/click then say a color to change the background color of the app. Try '+ colorHTML + '.';

document.body.onload = function () {
  newSpeechRecognition();
  
  console.log('Ready to receive a color command.');
}

