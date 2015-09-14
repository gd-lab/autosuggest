(function() { 

var app = angular.module('autocomplete', ['ajaxsuggester'])
    .directive('gdAutocomplete', function(AjaxSuggester) {


    function controller($scope) {
        $scope.inputText = '';
        $scope.tags = [];
        $scope.isDialogClosed = true;
    }


    function link($scope, element, attrs, controllers) {
        var defaultOptions = {
            inputClass: 'ac-input',
            submitClass: 'ac-submit',
            dialogClass: 'ac-dialog',
            jsonUrl: '',
            sendToUrl: ''
            //onsendsuccess: function() {},
            //onerror: function() {}
        };

        var options = _.defaults(attrs || {}, defaultOptions);

        $scope.inputClass = options.inputClass;
        $scope.submitClass = options.submitClass;
        $scope.dialogClass = options.dialogClass;

        function focusInput() {
            if (!focusInput._ctrl) focusInput._ctrl = $('input', element);
            focusInput._ctrl.focus();
        }

        focusInput();

        // initialize AjaxSuggester with data from provided url:
        var suggester = new AjaxSuggester({
            jsonUrl: options.jsonUrl,
            onerror: options.onerror
        });

        $scope.getTags = function() {
            var result = suggester.parseText($scope.inputText);
            console.table(result);
            return result;
        };

        $scope.onInputChange = function() {
            $scope.isDialogClosed = true;
            if (!this.inputText) return;

            var text = _.trimLeft(this.inputText);
            var result = suggester.suggestValues(text);
            if (result && result.length) {
                $scope.tags = result;
                $scope.isDialogClosed = false;
            }
        };

        var replaceLastValue = function(value) {
            var inputText = $scope.inputText;

            var lastWordIndex = inputText.lastIndexOf(' ');
            if (~lastWordIndex) {
                inputText = inputText.substr(0, lastWordIndex + 1) + value;
            } else {
                inputText = value;
            }

            $scope.inputText = inputText;
        };

        $scope.onSelect = function(tag) {
            replaceLastValue(tag);
            focusInput();
            //console.table(this.getTags());
            $scope.isDialogClosed = true;
        };

        $scope.onSubmit = function() {
            $scope.isDialogClosed = true;
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: options.sendToUrl,
                data: JSON.stringify(this.getTags())
            }).done(function (data) {
                //options.onsendsuccess(data);
            }).fail(function() {
                alert('Ajax failed to post data');
                //options.onerror();
            });
        };

    }

    return {
        restrict: 'E',
        templateUrl: './src/autocomplete/widget.html',
        scope: {},
        link: link,
        controller: controller
    }; 
});
})();
