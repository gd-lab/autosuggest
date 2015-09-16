'use strict';

describe('suggester module', function () {

    beforeEach(module('suggester'));

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

    it('parses correctly', inject(function (Suggester) {
        var suggester = new Suggester();
        suggester.setValues(dataJson);

        expect(suggester.parseText('red apple'))
            .toEqual([{value: 'red apple', weight: 50}]);

        expect(suggester.parseText('red apple apple'))
            .toEqual([
                {value: 'red apple', weight: 50},
                {value: 'apple', weight: 70}
            ]);

        expect(suggester.parseText('red apple juice'))
            .toEqual([
                {value: 'red apple juice', weight: 51}
            ]);
    }));


    it('suggests correctly', inject(function (Suggester) {
        var suggester = new Suggester();
        suggester.setValues(dataJson);

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
