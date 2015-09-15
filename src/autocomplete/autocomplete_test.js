//'use strict';

describe('autocomplete module', function () {

    // Load the autocomplete module, which contains the directive
    beforeEach(module('autocomplete'));
    beforeEach(module('my.templates'));  // load new module containing templates

    var $compile, $rootScope, $httpBackend;

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_, $injector) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        // Set up the mock http service responses
        $httpBackend = _$httpBackend_;
        //$httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        /*authRequestHandler = $httpBackend.when('GET', '/auth.py')
                .respond({userId: 'userX'}, {'A-Token': 'xxx'});*/
    }));

    var dataJson = {
        "bread": 10,
        "alfabet": 5,
        "apple": 70,
        "red apple": 50,
        "red wine": 38,
        "green apple": 25
    };

    it('setups widget correctly', function () {
        // Compile a piece of HTML containing the directive
        var element = $compile('<gd-autocomplete input-class="ac-input" json-url="data/data.json" send-to-url="/put"></gd-autocomplete>')($rootScope);

        //$httpBackend.expectGET('/data/data.json').respond(dataJson);
        $httpBackend.when('GET', '/data/data.json').respond(dataJson);

        // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
        $rootScope.$digest();

        // Check that the compiled element contains the templated content
        expect(element.html()).toContain("Submit");
        expect(element.html()).toContain("isDialogClosed");

        //$httpBackend.flush();
    });

    /*it('works correctly', function () {
        // Compile a piece of HTML containing the directive
        var element = $compile('<gd-autocomplete input-class="ac-input"\
            json-url="data/data.json" send-to-url="/put" on-json-load=""></gd-autocomplete>')($rootScope);

        //$httpBackend.expectGET('/data/data.json').respond(dataJson);
        $httpBackend.when('GET', '/data/data.json').respond(dataJson);

        // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
        $rootScope.$digest();

//debugger
        $('input', element).val("app").trigger('input');;

        // Check that the compiled element contains the templated content
        expect(element.html()).toContain("Submit");
        expect(element.html()).toContain("isDialogClosed");
        expect(element.html()).toContain("red apple");

        //$httpBackend.flush();
    });*/

    /*it('POSTs data correctly', function () {
        //$httpBackend.expectGET('./src/autocomplete/widget.html');
        //$httpBackend.when('GET', './src/autocomplete/widget.html').respond(fakedMainResponse);

        // Compile a piece of HTML containing the directive
        var element = $compile('<gd-autocomplete input-class="ac-input" json-url="data/data.json" send-to-url="/put"></gd-autocomplete>')($rootScope);
        // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
        $rootScope.$digest();
        // Check that the compiled element contains the templated content
        expect(element.html()).toContain("Submit");

        //$httpBackend.flush();
    });*/


    /*describe('gdAutocomplete directive', function () {

        it('should print current version', function () {
            module(function ($provide) {
                $provide.value('version', 'TEST_VER');
            });
            inject(function ($compile, $rootScope) {
                var element = $compile('<span app-version></span>')($rootScope);
                expect(element.text()).toEqual('TEST_VER');
            });
        });

    });*/
});


/*describe('Unit testing great quotes', function() {
  var $compile,
      $rootScope;

  // Load the myApp module, which contains the directive
  beforeEach(module('myApp'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function() {
    // Compile a piece of HTML containing the directive
    var element = $compile("<a-great-eye></a-great-eye>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
  });
});*/