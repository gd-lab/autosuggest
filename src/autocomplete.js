;(function ( window, $, _ ) {

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



    var compiledWidgetTemplate = _.template('<div class="ac-widget">\
<div><input autocomplete="off"><button type="button"><%= submitText %></button></div>\
<ul class="ac-widget-suggest closed" tabindex="0"></ul></div>');

    function _getAutocompleteWidgetCtrls(data) {
        var defaultOptions = {
            submitText: "Submit"
        };
        data = _.defaults(data || {}, defaultOptions);
        return $(compiledWidgetTemplate(data));
    }

    var compiledDialogItemTemplate = _.template(
            '<li class="ac-item" tabindex="-1"><%= text %></li>');


    function AutocompleteWidget(options) {
        var defaultOptions = {
            inputClass: "ac-input",
            submitClass: "ac-submit",
            dialogClass: "ac-dialog",
            jsonUrl: "https://raw.githubusercontent.com/gd-lab/autosuggest/master/data/data.json",
            sendToUrl: "http://www.somewhere.xyz/data/put",
            onsendsuccess: function() {},
            onerror: function() {}
        };

        options = _.defaults(options || {}, defaultOptions);

        var suggester = new Suggester();
        (function _loadData(successCb) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: options.jsonUrl
            }).done(function (data) {
                if (successCb) successCb(data);
            }).fail(function() {
                alert("Ajax failed to fetch data");
                onerror();
            });
        })(function(data) {
            suggester.setValues(data);
        });


        var $el = _getAutocompleteWidgetCtrls();
        this.getElement = function() {
            return $el;
        };
        var me = this;

        var $dialog = $('ul', $el).addClass(options.dialogClass);
        var $input = $('input', $el).addClass(options.inputClass);
        var $submit = $('button', $el).addClass(options.submitClass);

        var currentInputText = "";
        var onInputChange = _.debounce(function() {
            var inputText = $input.val();
            if (currentInputText === inputText) return;

            tryToSuggest(inputText);

            currentInputText = inputText;
        }, 10);
        $input.on('change keydown keypress', onInputChange);

        this.getTags = function() {
            return suggester.parseText($input.val());
        };

        function replaceInputText(selectedText) {
            var inputText = $input.val();

            var lastWordIndex = inputText.lastIndexOf(" ");
            if (~lastWordIndex) {
                inputText = inputText.substr(0, lastWordIndex + 1) + selectedText;
            } else {
                inputText = selectedText;
            }

            $input.val(inputText);
            currentInputText = inputText;
            console.table(me.getTags());
        }

        function tryToSuggest(text) {
            _dialogHide();
            if (!text) return;

            text = _.trimLeft(text);
            var result = suggester.suggestValues(text);
            if (!result || !result.length) return;

            _dialogShow(result);
        }

        function _dialogShow(suggestedValues) {
            var html = "";
            for (var i = 0, maxI = suggestedValues.length; i < maxI; i++) {
                html += compiledDialogItemTemplate({text: suggestedValues[i]});
            }
            $dialog.html(html).show();
        }

        function _dialogHide() {
            $dialog.hide();
        }

        $dialog.on("click", "li", function _selectValue(e) {
            replaceInputText(this.innerText);
            _dialogHide();
            $input.focus();
        });


        function _onSubmit() {
            var result = me.getTags();
            console.table(result);

            $.ajax({
                type: "POST",
                dataType: "json",
                url: options.sendToUrl,
                data: JSON.stringify(result)
            }).done(function (data) {
                options.onsendsuccess(data);
            }).fail(function() {
                alert("Ajax failed to post data");
                options.onerror();
            });
        };

        $submit.on('click', _onSubmit);
    };



    window["AutocompleteWidget"] = AutocompleteWidget;


})(window, $, _);
