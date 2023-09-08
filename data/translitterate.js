const alphabet = require('./alphabet.json');
const correspondance = require('./phonetique.json');

/**
 * a utility object for the translitterations operations
 */
class Translitterate {
  /**
   * @constructor
   */
  constructor() {
    /**
     * phonetize a word for external use
     * @param {string} str - the word to phonetize
     * @return {string} - the phonetized word
     */
    this.phonetize = (str) => {
      let phonetique = '/';
      phonetique += this.rawPhonetize(str);
      phonetique += '/';
      return phonetique;
    };
    /**
     * phonetize a word but without the phonetic notation,
     * for internal use
     * @param {string} str - the word to phonetize
     * @return {string} - the phonetize word
     */
    this.rawPhonetize = (str) => {
      // for each char replace the API equivalent
      str = str.toLowerCase();
      let phonetique = '';
      for (const iterator of str) {
        phonetique += correspondance[iterator];
      }
      return phonetique;
    };
    /**
     * a list of word, word being list of characters
     * @typedef {Array.<Array.<string>>} trame
     */

    /**
     * cut a phrase into word and recognize if letters are consonnant, vowels,
     * demi vowels, or nazalized vowel
     * @param {string} str - the sentence to cut
     * @return {trame} - a list of word, word being list of letters
     */
    this.trame = (str) => {
      const voyelles = /[aeɛøioɔuyj]/;
      const consonnes = /[bdfɡʔklmnpʁɻsʃtwvzʒðθ]/;
      const digrammes = /tʃ|dʒ|ts/;
      const nasale = /\u0303/;
      const pontet = /\u032A/;

      const trame = [];
      const list = str.split(' ');
      for (let text of list) {
        const word = [];
        for (let i = 0; i < text.length; i++) {
          const iterator = text[i];
          if ((iterator == 'j' || iterator == 'w') && i < text.length - 1 && voyelles.test(text[i + 1])) {
            word.push('jv');
            text = text.slice(0, i + 1) + text.slice(i + 2);
          } else if (!pontet.test(iterator)) {
            if (i < text.length - 1) {
              if (digrammes.test(iterator + text[i + 1])) {
                word.push('cc');
                text = text.slice(0, i + 1) + text.slice(i + 2);
              } else if (/dz/.test(iterator + text[i + 1])) {
                word.push('ccf');
                text = text.slice(0, i + 1) + text.slice(i + 2);
              } else {
                word.push(iterator.replace(digrammes, 'cc').replace(consonnes, 'c').replace(voyelles, 'v').replace(nasale, 'n'));
              }
            } else {
              word.push(iterator.replace(digrammes, 'cc').replace(consonnes, 'c').replace(voyelles, 'v').replace(nasale, 'n'));
            }
          }
        }
        trame.push(word);
      }
      return this.findNoConsonnant(trame);
    };
    /**
     * find where there should be a consonnant, and there is none
     * @param {trame} trame - the entering trame
     * @return {trame} - the fixed trame
     */
    this.findNoConsonnant = (trame) => {
      for (const word of trame) {
        for (let i = 0; i < word.length; i++) {
          if (i != word.length - 1) {
            if (word[i] == 'v' || word[i] == 'jv') {
              if (word[i + 1] == 'v' || word[i + 1] == 'jv') { // must be first bc if the other if add a no_consonnant, index changes
                word.splice(i + 1, 0, 'no_consonnant');
              }
              if (i == 0) {
                word.splice(0, 0, 'no_consonnant');
              }
            }
          } else if ((word[i] == 'v' || word[i] == 'jv') && i == 0) { // if the word is only one letter
            word.splice(0, 0, 'no_consonnant');
          }
        }
      }
      return trame;
    };
    /**
     * a trame divided into syllabe
     * @typedef {Array.<Array.<Array.<string>>>} syllabic_trame
     */
    /**
     * cut trame into syllabes
     * @param {trame} trame - a valid trame, with no consonnant added
     * @return {syllabic_trame} - the trame cut into syllabes
     */
    this.syllabes = (trame) => {
      const syllabes = [];
      for (const word of trame) {
        // eslint-disable-next-line prefer-const
        let syllabicWord = [];
        let lastConsonnant = 0;
        let syllabe = [];
        for (let i = 0; i < word.length; i++) {
          if (i != word.length - 1) {
            if (word[i] == 'v' || word[i] == 'jv') { // if the letter is a vowel (wet vowel are not useful for this function)
              if (i == 0) { // due to the way the trame is made, the first letter should not be a vowel
                console.log('notice: vowel first when translating to korean pierrick');
              }
              if (word[i + 1] == 'v' || word[i + 1] == 'jv') { // due to the way the trame is made, two consecutive vowels should not be possible
                console.log('notice: two consecutive vowels when translating to korean pierrick');
              }
              if (syllabe.length != 0 && (word[i + 1] == 'c' || word[i+1] == 'no_consonnant' || word[i+1] == 'cc' || word[i+1] == 'ccf')) { // if the next letter is a consonnant, the vowel is pushed into the syllabe
                syllabe.push(word[i]);
              }
              if (word[i+1] == 'n') { // if the vowel is nasalized
                syllabe.push(word[i]+'n');
                i++; // skip the nasalisation diacritic
              }
            } else if (word[i] == 'cc' || word[i] == 'ccf') { // if the letter is a consonnant digram
              if (word[i + 1] == 'v' || word[i + 1] == 'jv') { // if the next letter is a vowel
                if (syllabe.length != 0) {// if the syllabe is not empty, it means that the digram is the first letter of the syllabe
                  syllabicWord.push(syllabe);
                  syllabe = [];
                  lastConsonnant = 0;
                }
                syllabe.push(word[i]);
              }
              if (word[i + 1] == 'c' || word[i + 1] == 'no_consonnant' || word[i + 1] == 'cc' || word[i + 1] == 'ccf') {
                if (syllabe.length != 0 && word[i] == 'ccf') {
                  syllabe.push(word[i]);
                  lastConsonnant += 1;
                  if (lastConsonnant == 1) { // if there is two consecutive consonnant, the syllabe is pushed into the word to begin the next syllabe NB: in theory should be 2 but test has revealed that it works only for one
                    syllabicWord.push(syllabe);
                    syllabe = [];
                    lastConsonnant = 0;
                  }
                } else if (syllabe.length != 0 && word[i] == 'cc') {
                  console.log('notice [syllabes]: end consonnant digram');
                } else if (syllabe.length == 0) { // a word can't begin with two consonnant, so the first consonnant is pushed into the syllabe
                  syllabe.push(word[i]);
                  syllabe.push('no_vowel');
                }
              }
            } else if (word[i] == 'c' || word[i] == 'no_consonnant') { // if the letter is a consonnant ("no_consonnant" is a consonnant that is not pronounced, and "nasal" take the place of a final consonnant)
              if (word[i + 1] == 'c') { // if the next letter is a consonnant
                if (syllabe.length != 0) {// if the syllabe is not empty
                  syllabe.push(word[i]);
                  lastConsonnant += 1;
                  if (lastConsonnant == 1) { // if there is two consecutive consonnant, the syllabe is pushed into the word to begin the next syllabe NB: in theory should be 2 but test has revealed that it works only for one
                    syllabicWord.push(syllabe);
                    syllabe = [];
                    lastConsonnant = 0;
                  }
                } else if (syllabe.length == 0) { // a word can't begin with two consonnant, so the first consonnant is pushed into the syllabe and a fake vowel is added
                  syllabe.push('c');
                  syllabe.push('no_vowel');
                }
              }
              if (word[i + 1] == 'v' || word[i + 1] == 'jv') { // if the next letter is a vowel
                if (syllabe.length != 0) { // if the syllabe is not empty, it means that the previous consonnant was the final consonnant of the syllabe
                  syllabicWord.push(syllabe);
                  syllabe = [];
                  lastConsonnant = 0;
                }
                syllabe.push(word[i]);
              }
            }
          } else { // for the last letter of the word
            if (word[i] == 'c' && syllabe.length == 0) {
              syllabe.push(word[i]);
              syllabe.push('no_vowel');
            } else syllabe.push(word[i]);
            syllabicWord.push(syllabe);
            syllabe = [];
          }
        }
        syllabes.push(syllabicWord); // for each word, the syllabic word is pushed into the syllabes array
      }
      return syllabes;
    };
    /**
     * translitterate latin pierrick to hangeul
     * @param {string} text - the latin text
     * @return {string} - the text translitterated to hangeul
     */
    this.lat_to_kor = (text) => {
      let result = '';
      let phonetized = this.rawPhonetize(text); // for some reason we need to use the phonetized text to translate
      phonetized = phonetized.replace(/\u032A/g, ''); // remove the dental diacritic, not used in translation, and messes with the translation
      const syllabes = this.syllabes(this.trame(phonetized));
      phonetized = phonetized.replace(/ /g, ''); // remove the spaces from the phonetized text (will be added later)
      let j = 0; // index to iterate through the phonetized text
      for (const word of syllabes) {
        for (const syllabe of word) {
          for (let i = 0; i < syllabe.length; i++) {
            if (i == 0) {
              switch (syllabe[i]) {
                case 'no_consonnant': // if the syllabe begins with a no_consonnant, it is not on the phonetized text, so we add it manually
                  result += alphabet.korean[2].debut['no_consonnant'];
                  j--; // because the no_consonnant is not on the phonetized text, we need to go back one index
                  break;
                case 'c':
                  result += alphabet.korean[2].debut[phonetized[j]]; // if the syllabe begins with a consonnant, we add it to the result
                  break;
                case 'cc':
                case 'ccf':
                  result += alphabet.korean[2].debut[phonetized[j] + phonetized[j + 1]]; // if the syllabe begins with a consonnant digram, we add it to the result
                  j++; // beacause the cc is two letters in latin pierrick but only one in korean
                  break;
                default:
                  console.log('notice [lat_to_kor]: default case at first consonnant ' + syllabe[i]);
                  break;
              }
              j++;
            } else if (i == 1) {
              switch (syllabe[i]) {
                case 'no_vowel': // if the syllabe has no vowel, we add the no_vowel to the result
                  result += alphabet.korean[2].voyelles['no_vowel'];
                  if (j != phonetized.length -1) j--; // because the no_vowel is not on the phonetized text, we need to go back one index, if it's not the last letter
                  break;
                case 'v':
                  result += alphabet.korean[2].voyelles[phonetized[j]];
                  break;
                case 'jv':
                  result += alphabet.korean[2].voyelles[phonetized[j] + phonetized[j + 1]];
                  j++; // beacause the jv is two letters in latin pierrick but only one in korean
                  break;
                case 'vn':
                  result += alphabet.korean[2].voyelles[phonetized[j] + '\u0303'];
                  break;
                case 'jvn':
                  console.log('notice : [lat_to_kor] jvn not yet supported');
                  break;
                default:
                  console.log('error: no vowel in syllabe');
                  break;
              }
              j++;
            } else {
              switch (syllabe[i]) {
                case 'c':
                  result += alphabet.korean[2].fin[phonetized[j]]; // if the syllabe has a consonnant, we add it to the result
                  break;
                case 'ccf':
                  result += alphabet.korean[2].fin[phonetized[j] + phonetized[j+1]]; // if the syllabe has a nasal, we add the nasalization character to the result
                  break;
                default:
                  console.log('error: undefined thing in end consonnant : ' + syllabe[i] + ' corresponding to char : ' + word[j] + ' in word : ' + word + ' in text : ' + text);
                  break;
              }
              j++;
            }
          }
        }
        result += ' '; // add a space between each word
      }
      return result;
    };
    /**
     * translitterate latin pierrick to georgian pierrick
     * @param {string} text - the latin text
     * @return {string} - the translitterated text
     */
    this.lat_to_georg = (text) => {
      let result = '';
      text = text.toLowerCase();
      text = text.replace(/ts/, alphabet.georgian[0].ts).replace(/dz/, alphabet.georgian[0].dz).replace(/tš/, alphabet.georgian[0].tš).replace(/dž/, alphabet.georgian[0].dž);
      for (const iterator of text) {
        if (alphabet.georgian[0][iterator] != undefined) {
          result += alphabet.georgian[0][iterator];
        } else {
          result += iterator;
        }
      }
      return result;
    };
    /**
     * translitterate latin pierrick to cyrillic pierrick
     * @param {string} text - the latin text
     * @return {string} - the translitterated text
     */
    this.lat_to_cyr = (text) => {
      text = text.replace(/ts/, alphabet.cyrilic[0].ts).replace(/dz/, alphabet.cyrilic[0].dz).replace(/tš/, alphabet.cyrilic[0].tš).replace(/dž/, alphabet.cyrilic[0].dž);
      for (const iterator of text) {
        if (alphabet.cyrilic[0][iterator.toLowerCase()] != undefined) {
          if (iterator.toUpperCase() == iterator) {
            const inter = alphabet.cyrilic[0][iterator.toLowerCase()];
            result += inter.toUpperCase();
          } else result += alphabet.cyrilic[0][iterator];
        } else {
          result += iterator;
        }
      }
      return result;
    };
    /**
     * translitterate georgian pierrick to latin pierrick
     * @param {string} text - the georgian text
     * @return {string} - the translitterated text
     */
    this.georg_to_lat = (text) => {
      text = text.replace(/\u10d3\u10ff/, 'ð').replace(/\u10e2\u10ff/, 'þ').replace(/\u10d0\u10fc/, 'ā').replace(/\u10dd\u10fc/, 'ō').replace(/\u10e3\u10fc/, 'ū');
      for (const iterator of text) {
        if (alphabet.georgian[1][iterator] != undefined) {
          result += alphabet.georgian[1][iterator];
        } else {
          result += iterator;
        }
      }
      return result;
    };
    /**
     * translitterate cyrillic pierrick to latin pierrick
     * @param {string} text - the cyrillic text
     * @return {string} - the translitterated text
     */
    this.cyr_to_lat = (text) => {
      for (const iterator of text) {
        if (alphabet.cyrilic[1][iterator.toLowerCase()] != undefined) {
          if (iterator.toUpperCase() == iterator) {
            const inter = alphabet.cyrilic[1][iterator.toLowerCase()];
            result += inter.toUpperCase();
          } else result += alphabet.cyrilic[1][iterator];
        } else {
          result += iterator;
        }
      }
      return result;
    };
    /**
     * translitterate korean pierrick to latin pierrick
     * @param {string} text - the korean text
     * @return {string} - the translitterated text
     */
    this.kor_to_lat = (text) => {
      let result = '';
      result = result.replace(/\u1173|\u110b/g, '');
      for (const iterator of text) {
        if (alphabet.korean[1][iterator] != undefined) {
          result += alphabet.korean[1][iterator];
        } else {
          result += iterator;
        }
      }
      return result;
    };
  }
}

module.exports = new Translitterate();
