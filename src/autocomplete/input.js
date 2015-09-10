define(['jquery', 'lodash'], function ($, _) {

    var widgetHtml = '<input autocomplete="off">';

    /**
     * @constructor
     * @param {object=} options - options
     * @param {string=} options.class - class for popup dialog
     * @param {function=} options.onselect - callback after user selects a value from dialog
     */
    function TextInput(options) {
        var defaultOptions = {
            class: '',
            onchange: function() {}
        };
        options = _.defaults(options || {}, defaultOptions);

        var inputCtrl = $(widgetHtml);

        /**
         * Get created jQuery element
         * @return {jQuery}
         */
        this.getElement = function() {
            return inputCtrl;
        };

        this.getValue = function() {
            return inputCtrl.val();
        };

        this.setValue = function(text) {
            return inputCtrl.val(text);
        };


        options.class && inputCtrl.addClass(options.class);


        var me = this;
        var currentInputText = '';
        var onChange = _.debounce(function() {
            var inputText = me.getValue();
            if (currentInputText === inputText) return;

            options.onchange(inputText);

            currentInputText = inputText;
        }, 10);

        inputCtrl.on('change keydown keypress', onChange);


        this.replaceLastValue = function(selectedText) {
            var inputText = me.getValue();

            var lastWordIndex = inputText.lastIndexOf(' ');
            if (~lastWordIndex) {
                inputText = inputText.substr(0, lastWordIndex + 1) + selectedText;
            } else {
                inputText = selectedText;
            }

            me.setValue(inputText);
            currentInputText = inputText;
            //console.table(me.getTags());
        };

    };

    return TextInput;
});
