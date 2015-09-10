define(["jquery", "lodash", "./suggester"], function ($, _, Suggester) {

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

    return AutocompleteWidget;

});
