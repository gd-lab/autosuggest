angular.module('suggester', [])
    .factory('Suggester', function() {

    /**
     * @constructor
     * @param {{maxItems: number}=} options
     */
    function Suggester(options) {
        var defaultOptions = {
            maxItems: 8
        };
        options = _.defaults(options || {}, defaultOptions);

        /**
         * Get max allowed number of items to suggest
         * @return {number}
         */
        this._getMaxItems = function() {
            return options.maxItems;
        };

        var wordsAndWeights = {};
        var wordsSorted = [];

        /**
         * Initialize a suggester with a list of values to work with.
         * @param {Object} values where key is a word, and a value is a word's weight
         */
        this.setValues = function(values) {
            // cleanup keys first (remove leading and trailing spaces from each key):
            values = _.mapKeys(values, function(value, key) { return _.trim(key); });

            wordsAndWeights = values;

            // construct a sorted list of words or phrases (keys, actually),
            // phrases have more priority than words, so phrases are going first,
            // then values are sorted by weight:
            var wordsOrPhrases = _.keys(values);
            var phraseMinPriority = _.max(values) + 1;
            wordsSorted = _.sortBy(wordsOrPhrases, function(key) {
                if (key && ~key.indexOf(' ')) {
                    // a special case - phrases have top priority
                    return -(phraseMinPriority + values[key]);
                }
                return -values[key];
            });
        };

        /**
         * Get an array of words or phrases sorted by weight
         * @return {Array}
         */
        this._getSortedWords = function() {
            return wordsSorted;
        };

        /**
         * Get a word-weight pairs
         * @param {string} key
         * @return {number} weight
         */
        this._getWeight = function(key) {
            var result = wordsAndWeights[key];
            if (typeof result === 'undefined') return -1;
            return result;
        };
    }


    /**
     * Get a list of strings which are suggested for a given text.
     * @param {string} text
     * @return {null|Array}
     */
    Suggester.prototype.suggestValues = function(text) {
        if (!text) return null;
        text = _.trimLeft(text).toLowerCase();

        var result;
        var tagText;
        var lastWordIndex = text.lastIndexOf(' ');
        if (~lastWordIndex) {
            if (lastWordIndex == (text.length-1)) {
                // do nothing if a space symbol is in the end of a text
                return null;
            }

            // scenario: whitespace is entered and 1 new letter is entered
            //  then widget should suggest best items for this letter
            //  entered and for all previous words also:

            result = this._findWordsWhichContains(text);
            text = text.substr(lastWordIndex + 1);
            result = result.concat(this._findWordsWhichContains(text));
            result = _.uniq(result);    // remove duplicates
        } else {
            // scenario: user types more than 2 letters, so the widget
            //  should suggest a list of best elements by weight.
            var tags = this.parseText(text);
            if (!tags.length) return [];

            tagText = tags[0].value;
            if (tagText.length <= 2) {
                return null;
            }

            result = this._findWordsWhichContains(tagText);
        }

        return result;
    };


    /**
     * Get a list of strings which contains a given str (case insensitive).
     * @param {string} str
     * @return {Array}
     */
    Suggester.prototype._findWordsWhichContains = function(str) {
        var vals = this._getSortedWords();
        var maxItems = this._getMaxItems();

        var result = [];
        for (var i = 0, maxI = vals.length; i < maxI; i++) {
            var word = vals[i];
            if (~word.toLowerCase().indexOf(str)) {
                result.push(word);
                if (result.length >= maxItems) break;
            }
        }

        return result;
    };


    /**
     * Parses given text using initial words and weights array. As a result
     *  an array of {value: .., weight: ..} is constructed and returned.
     * @param {string} text
     * @return {Array<{value: string, weight: number}>}
     */
    Suggester.prototype.parseText = function(text) {
        if (!text) return [];

        text = text.toLowerCase();

        var maxItems = this._getMaxItems();
        var result = [];
        var addToResult = (function(key) {
            result.push({
                'value': key,
                'weight': this._getWeight(key)
            });
            return (result.length < maxItems);
        }).bind(this);

        while ((text = _.trim(text)).length) {
            var bestMatch = this._findBestMatch(text);
            if (bestMatch) {
                text = text.substr(bestMatch.length);
                if (!addToResult(bestMatch)) return result;
            } else {
                var last = text.indexOf(' ');
                if (last < 0) {
                    last = text.length;
                }
                if (!addToResult(text.substr(0, last))) return result;
                text = text.substr(last);
            }
        }

        return result;
    };

    /**
     * Finds a best matched word or phrase in the beginning of text, using
     *  initial (suggested) words. Or returns null if nothing found.
     * @param {string} text
     * @return {string|null}
     */
    Suggester.prototype._findBestMatch = function(text) {
        var vals = this._getSortedWords();

        // find the best match (phrases are matched first):
        for (var i = 0, maxI = vals.length; i < maxI; i++) {
            var word = vals[i];

            // text should starts with word and it should be equal to word
            // or it should have a space next to matched part
            // (i.e. phrases/words should match completely)
            if (_.startsWith(text, word.toLowerCase())
                    && (text.length === word.length ||
                    (text.length > word.length && text[word.length] === ' '))) {
                return word;
            }
        }

        return null;
    };


    return Suggester;

});
