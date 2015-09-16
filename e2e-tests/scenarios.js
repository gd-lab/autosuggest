'use strict';

describe('my app', function() {

    it('should suggest correctly', function() {

        browser.get('index.html');

        var inputCtrl = element(by.model('inputText'));
        inputCtrl.sendKeys('app');

        var tagsList = element.all(by.repeater('tag in suggestTags'));
        expect(tagsList.count()).toEqual(6);
        expect(tagsList.get(0).getText()).toEqual('red apple');
        expect(tagsList.get(1).getText()).toEqual('green apple');
        expect(tagsList.get(5).getText()).toEqual('happen');

        tagsList.get(2).click();

        expect(inputCtrl.getAttribute('value')).toEqual('apple');
    });


    it('should add new values correctly', function() {

        browser.get('index.html');

        var inputCtrl = element(by.model('inputText'));
        inputCtrl.sendKeys('ion');

        var tagsList = element.all(by.repeater('tag in suggestTags'));
        expect(tagsList.count()).toEqual(8);
        expect(tagsList.get(0).getText()).toEqual('disposition');
        expect(tagsList.get(7).getText()).toEqual('distinction');

        tagsList.get(6).click();

        expect(inputCtrl.getAttribute('value')).toEqual('question');

        inputCtrl.sendKeys(' fi');

        expect(tagsList.count()).toEqual(3);
        expect(tagsList.get(1).getText()).toEqual('confidence');

        tagsList.get(0).click();

        expect(inputCtrl.getAttribute('value')).toEqual('question final moment');
    });


    it('should submit correctly', function() {

        browser.get('index.html');
        //expect(browser.getLocationAbsUrl()).toMatch("/view1");

        var inputCtrl = element(by.model('inputText'));
        inputCtrl.sendKeys('ion');
        //element(by.css('gd-autocomplete input')).click();

        var tagsList = element.all(by.repeater('tag in suggestTags'));
        expect(tagsList.count()).toEqual(8);
        expect(tagsList.get(0).getText()).toEqual('disposition');
        expect(tagsList.get(7).getText()).toEqual('distinction');

        tagsList.get(6).click();

        expect(inputCtrl.getAttribute('value')).toEqual('question');

        inputCtrl.sendKeys(' fi');

        expect(tagsList.count()).toEqual(3);
        expect(tagsList.get(1).getText()).toEqual('confidence');

        tagsList.get(0).click();

        expect(inputCtrl.getAttribute('value')).toEqual('question final moment');

        element(by.css('button')).click();

    });


});