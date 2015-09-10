define(["lodash"], function (_) {

    function Suggester(options) {
        var defaultOptions = {
            maxItems: 8
        };

        options = _.defaults(options || {}, defaultOptions);

        this._getOptions = function() {
            return options;
        };

        var suggestMap = {};
        var suggestWeightsSorted = [];

        this.setValues = function(values) {
            // trim keys:
            values = _.mapKeys(values, function(value, key) { return _.trim(key); });
            var phraseMinPriority = _.max(values) + 1;

            suggestMap = values;
            suggestWeightsSorted = _.sortBy(_.keys(values), function(key) {
                if (key && ~key.indexOf(' ')) {
                    // a special case - phrases have top priority
                    return -(phraseMinPriority + values[key]);
                }
                return -values[key];
            });
        };

        this._getSortedValues = function() {
            return suggestWeightsSorted;
        };

        this._getWeight = function(key) {
            var result = suggestMap[key];
            if (typeof result === "undefined") return -1;
            return result;
        };
    }

    Suggester.prototype.suggestValues = function(text) {
        if (!text) return null;
        text = _.trimLeft(text).toLowerCase();

        var result;
        var tagText;
        var lastWordIndex = text.lastIndexOf(" ");
        if (~lastWordIndex) {
            if (lastWordIndex == (text.length-1)) return null;

            // case: after whitespace entered and 1 new letter entered widget
            //  should suggest new 8 best items for the 1 letter entered and
            //  all previous words also.

            result = this._getSuggestions(text);
            text = text.substr(lastWordIndex + 1);
            result = result.concat(this._getSuggestions(text));
        } else {
            // when the user types more than 2 letters the widget
            //  should suggest up to 8 best elements by weight.

            var tags = this.parseText(text);
            if (!tags.length) return null;

            tagText = tags[0].value;
            if (tagText.length <= 2) {
                return null;
            }

            result = this._getSuggestions(tagText);
        }

        return result;
    };


    Suggester.prototype._getSuggestions = function(text) {
        var vals = this._getSortedValues();
        var maxItems = this._getOptions().maxItems;

        var result = [];
        for (var i = 0, maxI = vals.length; i < maxI; i++) {
            var str = vals[i];
            if (~str.toLowerCase().indexOf(text)) {
                result.push(str);
                if (result.length >= maxItems) break;
            }
        }

        return result;
    };

    Suggester.prototype._findBestMatch = function(text, fullPhraseMatch) {
        var vals = this._getSortedValues();

        // find the best match (phrases matches first):
        for (var i = 0, maxI = vals.length; i < maxI; i++) {
            var str = vals[i];
            if (_.startsWith(text, str.toLowerCase())) {
                if (!fullPhraseMatch || (text.length === str.length ||
                    (text.length > str.length && text[str.length] === " "))) {
                    return str;
                }
            }
        }

        return null;
    };

    Suggester.prototype.parseText = function(text) {
        if (!text) return [];

        text = text.toLowerCase();

        var maxItems = this._getOptions().maxItems;
        var result = [];
        var addToResult = (function(key) {
            result.push({
                "value": key,
                "weight": this._getWeight(key)
            });
            return (result.length < maxItems);
        }).bind(this);

        while ((text = _.trim(text)).length) {
            var bestMatch = this._findBestMatch(text, true);
            if (bestMatch) {
                text = text.substr(bestMatch.length);
                if (!addToResult(bestMatch)) return result;
            } else {
                var last = text.indexOf(" ");
                if (last < 0) {
                    last = text.length;
                }
                if (!addToResult(text.substr(0, last))) return result;
                text = text.substr(last);
            }
        }

        return result;
    };

    return Suggester;

});
