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

        var element = $compile('<gd-autocomplete input-class="ac-input" json-url="data.json" send-to-url="/put"></gd-autocomplete>')($rootScope);

        // fire all the watches
        $rootScope.$digest();

        // Check that the compiled element contains the templated content
        expect(element.html()).toContain("Submit");
        expect(element.html()).toContain("isDialogClosed");

        $httpBackend.flush();
    });

});
