'use strict';

describe('autocomplete module', function () {

    // Load the autocomplete module, which contains the directive
    beforeEach(module('autocomplete'));
    beforeEach(module('my.templates'));  // load new module containing templates

    var $compile, $rootScope, $httpBackend;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
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

    it('setups widget correctly', function () {
        // Compile a piece of HTML containing the directive
        $httpBackend.expectGET('data.json').respond(dataJson);

        var element = $compile('<gd-autocomplete input-class="ac-input2" json-url="data.json" send-to-url="/put"></gd-autocomplete>')($rootScope);

        // fire all the watches
        $rootScope.$digest();

        // Check that the compiled element contains the templated content
        expect(element.html()).toContain("ac-input2");
        expect(element.html()).toContain("Submit");
        expect(element.html()).toContain("isDialogClosed");

        $httpBackend.flush();
    });

    it('invokes callbacks correctly', function () {
        //$rootScope.onGetJsonSuccess = jasmine.createSpy();
        $rootScope.onGetJsonError = jasmine.createSpy();
        $rootScope.onPostSuccess = jasmine.createSpy();
        $rootScope.onPostError = jasmine.createSpy();

        $rootScope.onGetJsonSuccess = function(data) {
            $rootScope.successCbData = data;
        };

        $httpBackend.expectGET('data/data.json').respond(dataJson);

        var element = $compile('<gd-autocomplete json-url="data/data.json" send-to-url="/put"\
            on-get-json-success="onGetJsonSuccess(data)" on-get-json-error="onGetJsonError()"\
            on-post-success="onPostSuccess(data)" on-post-error="onPostError()"></gd-autocomplete>')($rootScope);

        $httpBackend.flush();
        $rootScope.$digest();

        //expect($rootScope.onGetJsonSuccess).toHaveBeenCalled();
        expect($rootScope.successCbData).toEqual(dataJson);
        expect($rootScope.onGetJsonError).not.toHaveBeenCalled();

        $httpBackend.expectPOST('/put').respond(200, '');
        element.find('button')[0].click();
        $httpBackend.flush();

        expect($rootScope.onPostSuccess).toHaveBeenCalled();
        expect($rootScope.onPostError).not.toHaveBeenCalled();
    });


    it('invokes failure callbacks correctly', function () {
        $rootScope.onGetJsonSuccess = jasmine.createSpy();
        $rootScope.onGetJsonError = jasmine.createSpy();
        $rootScope.onPostSuccess = jasmine.createSpy();
        $rootScope.onPostError = jasmine.createSpy();

        $httpBackend.expectGET('data/data.json').respond(404, '');

        var element = $compile('<gd-autocomplete json-url="data/data.json" send-to-url="/putdata"\
            on-get-json-success="onGetJsonSuccess(data)" on-get-json-error="onGetJsonError()"\
            on-post-success="onPostSuccess(data)" on-post-error="onPostError()"></gd-autocomplete>')($rootScope);

        $httpBackend.flush();
        $rootScope.$digest();

        expect($rootScope.onGetJsonSuccess).not.toHaveBeenCalled();
        expect($rootScope.onGetJsonError).toHaveBeenCalled();

        $httpBackend.expectPOST('/putdata').respond(404, '');
        element.find('button')[0].click();
        $httpBackend.flush();

        expect($rootScope.onPostSuccess).not.toHaveBeenCalled();
        expect($rootScope.onPostError).toHaveBeenCalled();
    });

});
