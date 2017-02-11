var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var wordResponses = [
  { word: 'hej', type: 'response', responses: ['Hallå där', 'Hejsan', 'Tjena'] },
  { word: 'hungrig', type: 'response', responses: ['Du borde ta en cigg!', 'Du menar hangry!', 'Drick vatten!'] },
  { word: 'törstig', type: 'response', responses: ['Ät mat!', 'Ät godis!'] },
  { word: 'wifi', type: 'response', responses: ['Titta ut!', 'Ta bussen!']},
  { word: 'stockholm', type: 'wiki' },
  { word: 'internet', type: 'wiki' },
  { word: 'oslo', type: 'wiki'},
  { word: 'köpenhamn', type: 'wiki'},
  { word: 'Boston', type: 'wiki' },
  { word: 'Polis', type: 'wiki' },
];

var wikiPrefix = [
  'Det råkar vara så att jag kan en del om',
  'Vänta, jag kan berätta om',
  'Visste du förresten att',
];

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

    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Result', event.results[0][0].transcript);

    result = event.results[0][0].transcript;
      
    var wordResponse = wordResponses.find(function (innerWordResponse) {
      return result.match(new RegExp(innerWordResponse.word, 'i'));
    });

    if (wordResponse) {
      if (wordResponse.type === 'response') {
        var responseLength = wordResponse.responses.length;
        //console.log(responseLength);
        var index = Math.floor(Math.random() * responseLength);
        console.log(index);
        console.log(wordResponse.responses[index]);
        speak(wordResponse.responses[index]);
      } else if(wordResponse.type === 'wiki') {
        getWiki(wordResponse.word)
          .then(response => {
            var firstSentence = response.split('.')[0];

            const index = Math.floor(Math.random() * wikiPrefix.length);

            speak(`${wikiPrefix[index]} ${firstSentence}`);
          });
      } else if(wordResponse.type === 'color') {
        document.querySelector('body').style.backgroundColor = wordResponse.color;

      }
    }
  }

  recognition.onspeechend = function() {
    recognition.stop();
    newSpeechRecognition();
  }

  recognition.onnomatch = function(event) {
    console.log('No match')
    // diagnostic.textContent = "I didn't recognise that color.";
  }

  recognition.onerror = function(event) {
    console.log('Error')
    // diagnostic.textContent = 'Error occurred in recognition: ' + event.error
  }

  recognition.start();
}

var voice;
window.speechSynthesis.onvoiceschanged = function(e) {
  const voices = speechSynthesis.getVoices().find((voice) => {
    // console.log(voice.lang)
    return voice.lang === 'sv-SE';
  });

  voice = voices[0];
};

function speak(text) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.voice = voice;
  // console.log(voice);

  // msg.onend = (e) => console.log('Finished talking');


  document.querySelector('.text_to_speech').innerHTML = text;
  window.speechSynthesis.speak(msg);

  msg.onend = function(event) {
    console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
  }
}

window.addEventListener('load', function () {
  newSpeechRecognition();
  console.log('Ready to receive a color command.');
});