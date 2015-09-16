angular.module('ajaxsuggester', ['suggester'])
    .factory('AjaxSuggester', function(Suggester, $http) {

    /**
     * @constructor
     * @param {{jsonUrl: string, onerror=}} options
     */
    function AjaxSuggester(options) {
        Suggester.apply(this, arguments);

        var defaultOptions = {
            jsonUrl: '',
            onsuccess: function() {},
            onerror: function() {}
        };
        options = _.defaults(options || {}, defaultOptions);

        var me = this;
        $http.get(options.jsonUrl).
            then(function(response) {
                me.setValues(response.data);
                options.onsuccess(response);
            }, function(response) {
                alert('Ajax failed to fetch data');
                options.onerror();
            });

    }

    AjaxSuggester.prototype = Object.create(Suggester.prototype);
    AjaxSuggester.prototype.constructor = AjaxSuggester;

    return AjaxSuggester;
});