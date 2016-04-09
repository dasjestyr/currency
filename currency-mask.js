// register plugin
(function($) {
    $.fn.currencyMask = function ($target) {

        $target.keydown(function (e) {
            console.log(e.which);
        });

        return this;
    }
}(jQuery));

