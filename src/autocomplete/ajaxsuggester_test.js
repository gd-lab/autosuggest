'use strict';

describe('ajaxsuggester module', function () {

    beforeEach(module('ajaxsuggester'));

    var mockWindow;
    beforeEach(function() {
        module(function($provide) {
            $provide.service('$window', function() {
                this.alert = jasmine.createSpy('alert');
            });
        });
    });

    beforeEach(inject(function($window) {
        mockWindow = $window;
    }));


    var $httpBackend;
    beforeEach(inject(function(_$httpBackend_, $injector) {
        // The injector unwraps the underscores (_) from around the parameter names when matching

        // Set up the mock http service responses
        $httpBackend = _$httpBackend_;
    }));


    var dataJson = {
        "bread": 10,
        "alfabet": 5,
        "apple": 70,
        "approved": 190,
        "red apple": 50,
        "red apple juice": 51,
        "apple juice": 90,
        "juice": 99,
        "green apple": 25
    };


    it('fails correctly', inject(function (AjaxSuggester) {
        $httpBackend.expectGET('data/data.json').respond(404, '');
        var successcbSpy = jasmine.createSpy();
        var errorcbSpy = jasmine.createSpy();

        new AjaxSuggester({
            jsonUrl: 'data/data.json',
            onsuccess: successcbSpy,
            onerror: errorcbSpy
        });
        $httpBackend.flush();

        expect(successcbSpy).not.toHaveBeenCalled();
        expect(errorcbSpy).toHaveBeenCalled();
        expect(mockWindow.alert).toHaveBeenCalledWith('Ajax failed to fetch data');
    }));


    it('invokes callbacks correctly', inject(function (AjaxSuggester) {
        $httpBackend.expectGET('data/data.json').respond([]);
        var successcbSpy = jasmine.createSpy();
        var errorcbSpy = jasmine.createSpy();

        new AjaxSuggester({
            jsonUrl: 'data/data.json',
            onsuccess: successcbSpy,
            onerror: errorcbSpy
        });
        $httpBackend.flush();

        expect(successcbSpy).toHaveBeenCalled();
        expect(errorcbSpy).not.toHaveBeenCalled();
    }));


    it('parses correctly', inject(function (AjaxSuggester) {
        $httpBackend.expectGET('dta/data.json').respond(dataJson);
        var suggester = new AjaxSuggester({
            jsonUrl: 'dta/data.json'
        });
        $httpBackend.flush();

        expect(suggester.parseText('red apple'))
            .toEqual([{value: 'red apple', weight: 50}]);

        expect(suggester.parseText('red apple apple'))
            .toEqual([
                {value: 'red apple', weight: 50},
                {value: 'apple', weight: 70}
            ]);

        expect(suggester.parseText('apple red apple juice'))
            .toEqual([
                {value: 'apple', weight: 70},
                {value: 'red apple juice', weight: 51}
            ]);

    }));


    it('suggests correctly', inject(function (AjaxSuggester) {
        $httpBackend.expectGET('dta/data.json').respond(dataJson);
        var suggester = new AjaxSuggester({
            jsonUrl: 'dta/data.json'
        });
        $httpBackend.flush();

        expect(suggester.suggestValues('')).toEqual(null);
        expect(suggester.suggestValues('a')).toEqual(null);
        expect(suggester.suggestValues('ap')).toEqual(null);

        expect(suggester.suggestValues('app'))
            .toEqual(['apple juice', 'red apple juice', 'red apple', 'green apple', 'approved', 'apple']);

        expect(suggester.suggestValues('apple'))
            .toEqual(['apple juice', 'red apple juice', 'red apple', 'green apple', 'apple']);

        expect(suggester.suggestValues('red'))
            .toEqual(['red apple juice', 'red apple']);

        expect(suggester.suggestValues('red '))
            .toEqual(null);

        expect(suggester.suggestValues('red a'))
            .toEqual(['red apple juice', 'red apple', 'apple juice', 'green apple',
                'approved', 'apple', 'bread', 'alfabet']);

        expect(suggester.suggestValues('red app'))
            .toEqual(['red apple juice', 'red apple', 'apple juice', 'green apple',
                'approved', 'apple']);

        expect(suggester.suggestValues('red appl'))
            .toEqual(['red apple juice', 'red apple', 'apple juice', 'green apple', 'apple']);

    }));

});
