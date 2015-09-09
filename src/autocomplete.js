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
            suggestMap = values;
            suggestWeightsSorted = _.sortBy(_.keys(values), function(key) {
                return -values[key];
            });
        };

        this._getSortedValues = function() {
            return suggestWeightsSorted;
        };
    }

    Suggester.prototype.suggestValues = function(text) {
        if (!text) return null;

        text = text.toLowerCase();
        var maxItems = this._getOptions().maxItems;
        var result = [];
        var vals = this._getSortedValues();
        for (var i = 0, maxI = vals.length; i < maxI; i++) {
            var str = vals[i];
            if (~str.toLowerCase().indexOf(text)) {
                result.push(str);
                if (result.length >= maxItems) break;
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


        //var $el = $('#acTemplate').children().clone();  // TODO !!! rewrite with raw html
        var $el = _getAutocompleteWidgetCtrls();
        this._$el = $el;

        var $dialog = $('ul', $el).addClass(options.dialogClass);
        var $input = $('input', $el).addClass(options.inputClass);
        var $submit = $('button', $el).addClass(options.submitClass);
//debugger

        var currentTags = [];

        this.getTags = function() {
            return currentTags;
        };

        var currentInputText = "";
        var currentEditingTagIndex = -1;
        var onInputChange = _.debounce(function() {
            //_dialogHide();

            var inputText = $input.val();
            if (currentInputText === inputText) return;

            var tags = inputText.split(",");
            currentEditingTagIndex = findLastChangedRowIndex(currentTags, tags);
            var valToSuggest = tags[currentEditingTagIndex];

            console.log(valToSuggest, currentTags, tags);
            tryToSuggest(valToSuggest);

            currentTags = tags;
            currentInputText = inputText;
        }, 1);
        $input//.on('keypress', function(e) { if (e.which == 44/*,*/) return false; })
            .on('change keydown keypress', onInputChange);

        function replaceCurrentTag(tag) {
            /*var inputText = $input.val();
            inputText = inputText.replace()*/
            currentTags[currentEditingTagIndex] = tag;
            var inputText = currentTags.join(",");
            $input.val(inputText);
            currentInputText = inputText;
        }

        function findLastChangedRowIndex(oldArr, newArr) {
            var oldArrIdx = oldArr.length;
            var newArrIdx = newArr.length;
            while (oldArrIdx >= 0 && newArrIdx >= 0) {
                if (oldArr[oldArrIdx] !== newArr[newArrIdx]) {
                    return newArrIdx;
                }
                oldArrIdx--;
                newArrIdx--;
            }
            if (newArrIdx >= 0) {
                return newArrIdx;
            }
            return -1;
        }

        function tryToSuggest(text) {
            _dialogHide();
            if (!text) return;

            text = _.trimLeft(text);
            if (text.length <= 2) {
                return;
            }

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
            //debugger
            replaceCurrentTag(this.innerText);
            _dialogHide();
        });

    };

    AutocompleteWidget.prototype.getElement = function() {
        return this._$el;
    };



    window["AutocompleteWidget"] = AutocompleteWidget;


})(window, $, _);
