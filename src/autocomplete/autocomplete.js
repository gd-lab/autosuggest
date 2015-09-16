(function() { 

var app = angular.module('autocomplete', ['ajaxsuggester'])
    .directive('gdAutocomplete', function(AjaxSuggester, $http) {


    function controller($scope) {
        $scope.inputText = '';
        $scope.suggestTags = [];
        $scope.isDialogClosed = true;
    }


    function link($scope, element, attrs, controllers) {
        var defaultOptions = {
            inputClass: 'ac-input',
            submitClass: 'ac-submit',
            dialogClass: 'ac-dialog',
            jsonUrl: '',
            sendToUrl: ''
        };

        var options = _.defaults(attrs || {}, defaultOptions);

        $scope.inputClass = options.inputClass;
        $scope.submitClass = options.submitClass;
        $scope.dialogClass = options.dialogClass;

        function focusInput() {
            if (!focusInput._ctrl) focusInput._ctrl = element.find('input');
            focusInput._ctrl[0].focus();
        }

        focusInput();

        // initialize AjaxSuggester with data from provided url:
        var suggester = new AjaxSuggester({
            jsonUrl: options.jsonUrl,
            onsuccess: $scope.onGetJsonSuccess,
            onerror: $scope.onGetJsonError
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
                $scope.suggestTags = result;
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
            $http.post(options.sendToUrl, this.getTags()).
                then(function(response) {
                    $scope.onPostSuccess(response);
                }, function(response) {
                    alert('Ajax failed to post data');
                    $scope.onPostError(response);
                });
        };

    }

    return {
        restrict: 'E',
        templateUrl: 'src/autocomplete/widget.html',
        scope: {
            'onPostSuccess': '&',
            'onPostError': '&',
            'onGetJsonSuccess': '&',
            'onGetJsonError': '&'
        },
        link: link,
        controller: controller
    }; 
});
})();
