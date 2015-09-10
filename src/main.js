define(['jquery', './autocomplete/autocomplete'], function ($, AutocompleteWidget) {

    $(document).ready(function() {

        $.ajaxSetup({
            beforeSend: function() {
               $('#loading').show();
            },
            complete: function(){
               $('#loading').hide();
            },
            success: function() {}
        });

        var widget = new AutocompleteWidget({
            inputClass: 'ac-input',
            sendToUrl: 'http://www.somewhere.xyz/data/put'
        });

        $('#container').append(widget.getElement());

    });

});
