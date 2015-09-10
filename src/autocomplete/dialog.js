define(['jquery', 'lodash'], function ($, _) {

    var widgetHtml = '<ul class="ac-widget-suggest closed" tabindex="0"></ul>';

    var dlgItemTpl = '<li class="ac-item" tabindex="-1"><%= text %></li>';
    var compiledDialogItemTemplate;

    /**
     * @constructor
     * @param {object=} options - options
     * @param {string=} options.class - class for popup dialog
     * @param {function=} options.onselect - callback after user selects a value from dialog
     */
    function Dialog(options) {
        var defaultOptions = {
            class: '',
            onselect: function() {}
        };
        options = _.defaults(options || {}, defaultOptions);

        var dialogCtrl = $(widgetHtml);

        /**
         * Get created jQuery element
         * @return {jQuery}
         */
        this.getElement = function() {
            return dialogCtrl;
        };

        options.class && dialogCtrl.addClass(options.class);

        var me = this;
        dialogCtrl.on('click', 'li', function (e) {
            options.onselect(this.innerText);
            me.hide();
        });

        /**
         * Display dialog with suggested values
         * @param {Array<string>} suggestedValues
         */
        this.show = function(suggestedValues) {
            if (!compiledDialogItemTemplate)
                compiledDialogItemTemplate = _.template(dlgItemTpl);

            var html = '';
            for (var i = 0, maxI = suggestedValues.length; i < maxI; i++) {
                html += compiledDialogItemTemplate({text: suggestedValues[i]});
            }
            dialogCtrl.html(html).show();
        };

        /**
         * Hide dialog
         */
        this.hide = function() {
            dialogCtrl.hide();
        };
    };

    return Dialog;
});
