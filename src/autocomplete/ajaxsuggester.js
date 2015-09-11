angular.module('ajaxsuggester', ['suggester'])
    .factory('AjaxSuggester', function(Suggester) {

    /**
     * @constructor
     * @param {{jsonUrl: string, onerror=}} options
     */
    function AjaxSuggester(options) {
        Suggester.apply(this, arguments);

        var defaultOptions = {
            jsonUrl: '',
            onerror: function() {}
        };
        options = _.defaults(options || {}, defaultOptions);

        var me = this;
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: options.jsonUrl
        }).done(function (data) {
            me.setValues(data);
        }).fail(function() {
            alert('Ajax failed to fetch data');
            options.onerror();
        });
    }

    AjaxSuggester.prototype = Object.create(Suggester.prototype);
    AjaxSuggester.prototype.constructor = AjaxSuggester;

    return AjaxSuggester;
});