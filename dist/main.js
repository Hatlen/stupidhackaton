var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var wordResponses = [
  { word: 'hej', type: 'response', responses: ['Hallå där', 'Hejsan', 'Tjena'] },
  { word: 'hallå', type: 'response', responses: ['Hallå där', 'Hejsan', 'Tjena'] },
  { word: 'hejsan', type: 'response', responses: ['Hallå där', 'Hejsan', 'Tjena'] },
  { word: 'tjena', type: 'response', responses: ['Hallå där', 'Hejsan', 'Tjena'] },
  { word: 'hungrig', type: 'response', responses: ['Du borde ta en cigg!', 'Du menar hangry!', 'Drick vatten så går det nog över!'] },
  { word: 'törstig', type: 'response', responses: ['Du bör äta en bit mat!', 'Det är nog bäst om du äter godis!'] },
  { word: 'wifi', type: 'response', responses: ['Titta ut!', 'Ta bussen!']},
  { word: 'stockholm', type: 'wiki' },
  { word: 'internet', type: 'wiki' },
  { word: 'oslo', type: 'wiki'},
  { word: 'köpenhamn', type: 'wiki'},
  { word: 'Boston', type: 'wiki' },
];

var wikiPrefix = [
  'Det råkar vara så att jag kan en del om',
  'Vänta, jag kan berätta om',
  'Visste du förresten att',
];


function randomIndex(max)
{
    max = max - 1;
    return Math.floor(Math.random()*(max-0+1)+0);
}

var getWiki = (text) => fetch('/api/?query=' + text)
    .then((response) => response.text());

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

  recognition.onresult = function (event) {
    recognition.stop();

    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Result', event.results[0][0].transcript);

    result = event.results[0][0].transcript;
      
    var wordResponse = wordResponses.find(function (innerWordResponse) {
      return result.match(new RegExp(innerWordResponse.word, 'i'));
    });

    if (wordResponse) {
      if (wordResponse.type === 'response') {

        var responseLength = wordResponse.responses.length;
        var index = randomIndex(responseLength);

        speak(wordResponse.responses[index]);
      } else if(wordResponse.type === 'wiki') {
        getWiki(wordResponse.word)
          .then(response => {
            var firstSentence = response.split('.')[0];

            const index = randomIndex(wikiPrefix.length);

            speak(`${wikiPrefix[index]} ${firstSentence}`);
          });
      }
    } else {
      newSpeechRecognition();
    }
  }

  recognition.onspeechend = function() {
    recognition.stop();
    newSpeechRecognition();
    console.log('onspeechend');  
  }
  recognition.onend = function() {
   console.log('onend');   
  }

  recognition.onnomatch = function(event) {
    console.log('No match')
    // diagnostic.textContent = "I didn't recognise that color.";
  }

  recognition.onerror = function(event) {
    console.log('Error');
    newSpeechRecognition();
    // diagnostic.textContent = 'Error occurred in recognition: ' + event.error
  }

  recognition.start();
}

var voices;

window.speechSynthesis.onvoiceschanged = function(e) {
  voices = speechSynthesis.getVoices().filter((voice) => {
    return voice.lang === 'sv-SE';
  });
};

function getRandomVoice(){
  var index = randomIndex(voices.length); 
  voice = voices[index];

  return voice;
}

function speak(text) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.voice = getRandomVoice();


  document.querySelector('.text_to_speech').innerHTML = text;
  window.speechSynthesis.speak(msg);

  msg.onend = function(event) {
    console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
    newSpeechRecognition();
  }
}

window.addEventListener('load', function () {
  newSpeechRecognition();
  console.log('Ready to receive a color command.');
});