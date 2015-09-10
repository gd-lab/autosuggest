define(['jquery', 'lodash'], function ($, _) {

    var widgetHtml = '<button type="button">Submit</button>';

    /**
     * @constructor
     * @param {object=} options - options
     * @param {string=} options.class - class for popup dialog
     * @param {function=} options.onselect - callback after user selects a value from dialog
     */
    function Submitter(options) {
        var defaultOptions = {
            class: '',
            sendToUrl: 'http://www.somewhere.xyz/data/put',
            getData: function() {},
            onsendsuccess: function() {},
            onerror: function() {}
        };
        options = _.defaults(options || {}, defaultOptions);

        var buttonCtrl = $(widgetHtml);

        /**
         * Get created jQuery element
         * @return {jQuery}
         */
        this.getElement = function() {
            return buttonCtrl;
        };

        options.class && buttonCtrl.addClass(options.class);

        buttonCtrl.on('click', function _onSubmit() {
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: options.sendToUrl,
                data: JSON.stringify(options.getData())
            }).done(function (data) {
                options.onsendsuccess(data);
            }).fail(function() {
                alert('Ajax failed to post data');
                options.onerror();
            });

            return false;
        });

    };

    return Submitter;
});
