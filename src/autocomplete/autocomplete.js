define(['jquery', 'lodash', './ajaxsuggester', './dialog', './input', './submit'],
        function ($, _, AjaxSuggester, Dialog, TextInput, Submitter) {

    var widgetHtml = '<div class="ac-widget"><div></div></div>';


    /**
     * @constructor
     * @param {object=} options - options
     * @param {string=} options.inputClass - class for input control
     * @param {string=} options.submitClass - class for submit button
     * @param {string=} options.dialogClass - class for popup dialog
     * @param {string=} options.jsonUrl - url to read a list of words/weghts from
     * @param {string=} options.sendToUrl - url to send result (after submit button click)
     * @param {function=} options.onsendsuccess - callback after successful result post
     * @param {function=} options.onerror - callback for any error
     */
    function AutocompleteWidget(options) {
        var defaultOptions = {
            inputClass: 'ac-input',
            submitClass: 'ac-submit',
            dialogClass: 'ac-dialog',
            jsonUrl: 'https://raw.githubusercontent.com/gd-lab/autosuggest/master/data/data.json',
            sendToUrl: 'http://www.somewhere.xyz/data/put',
            onsendsuccess: function() {},
            onerror: function() {}
        };

        options = _.defaults(options || {}, defaultOptions);

        var me = this;


        // initialize AjaxSuggester with data from provided url:
        var suggester = new AjaxSuggester({
            jsonUrl: options.jsonUrl,
            onerror: options.onerror
        });

        this.getTags = function() {
            return suggester.parseText(input.getValue());
        };


        var input = new TextInput({
            class: options.inputClass,
            onchange: function tryToSuggest(text) {
                dialog.hide();
                if (!text) return;

                text = _.trimLeft(text);
                var result = suggester.suggestValues(text);
                if (result && result.length)
                    dialog.show(result);
            }
        });


        var submit = new Submitter({
            class: options.submitClass,
            sendToUrl: options.sendToUrl,
            onsendsuccess: function() {
                dialog.hide();
                options.onsendsuccess(arguments);
            },
            onerror: function() {
                dialog.hide();
                options.onerror(arguments);
            },
            getData: function() {
                var result = me.getTags();
                console.table(result);
                return result;
            }
        });


        var dialog = new Dialog({
            class: options.dialogClass,
            onselect: function(text) {
                input.replaceLastValue(text);
                input.getElement().focus();
                console.table(me.getTags());
            }
        });


        // construct the widget finally:
        var rootCtrl = $(widgetHtml);
        this.getElement = function() {
            return rootCtrl;
        };

        $('div', rootCtrl)
            .append(input.getElement())
            .append(submit.getElement());
        rootCtrl.append(dialog.getElement());
    };

    return AutocompleteWidget;

});
