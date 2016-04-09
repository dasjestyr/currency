/*
    english, irish, latvian, maltests: symbol on the left. All others on the right
*/

(function ($) {
    $.fn.currency = function(opt, asNative) {

        coelesceOptions(opt, asNative);

        var $target = $(this);
        var extraKeys = [8, 46];
        var workingFlatNumber = "";
        var formattedNumber = "";
        
        init();

        function init() {
            applyBindings();
            $target.val(getFormatted("0"));
        }

        function applyBindings() {
            $target.keydown(function(e) {
                var kc = getKeyCode(e);

                if (extraKeys.indexOf(kc) === -1 && !isInRange(kc)) {
                    e.preventDefault();
                    return false;
                }

                // backspace and delete both just remove the last number
                if (extraKeys.indexOf(kc) > -1) {
                    workingFlatNumber = workingFlatNumber.substr(0, workingFlatNumber.length - 1);
                    formattedNumber = getFormatted(workingFlatNumber);
                    $target.val(formattedNumber);

                    e.preventDefault();
                    return false;
                } 

                var character = getCharacter(kc);

                workingFlatNumber += character;
                formattedNumber = getFormatted(workingFlatNumber);
                $target.val(formattedNumber);

                e.preventDefault();
                return false;
            });
        }

        function getKeyCode(e) {
            var kc = e.keyCode || e.which;
            if (kc === 0 || kc === 229) {
                kc = 46;
            }
            return kc;
        }

        function getCharacter(code) {
            var numpad = { 96: 0, 97: 1, 98: 2, 99: 3, 100: 4, 101: 5, 102: 6, 103: 7, 104: 8, 105: 9 };
            return code >= 96 && code <= 105 ? numpad[code] : String.fromCharCode(code);
        }

        function isInRange(input) {
            return (input >= 48 && input <= 57) || (input >= 96 && input <= 105);
        }

        function getFormatted(input) {
            var withDecimals = addDecimalPlaces(input);
            var withGroupings = addGroupings(withDecimals);
            var withSymbol = addSymbol(withGroupings);
            return withSymbol;
        }

        function addDecimalPlaces(input) {
            var asArray = getArray(input);

            if (options.decimalPlaces > 0) {
                var startAt = asArray.length - options.decimalPlaces;
                asArray.splice(startAt, 0, options.decimalSeparator);
            }
            return asArray.join("");
        }

        function addGroupings(withDecimals) {
            var clean = withDecimals.replace(options.groupingSeparator, "");
            var asArray = clean.split("");
            var leftSide = asArray.slice(0, asArray.length - options.decimalPlaces - 1);

            if (leftSide.length > 3) {
                for (var i = leftSide.length, j = 0; i > 0; i--, j++) {
                    if (j === 3) {
                        leftSide.splice(i, 0, options.groupingSeparator);
                        j = 0;
                    }
                }
            }

            var result = leftSide.join("");

            if (options.decimalPlaces > 0) {
                var rightside = asArray.slice(asArray.length - options.decimalPlaces, asArray.length);
                result = result + options.decimalSeparator + rightside.join("");
            }

            return result;
        }

        function addSymbol(input) {
            return options.symbolPosition === "left"
                ? unicodeToChar(options.currencySymbol) + input
                : input + unicodeToChar(options.currencySymbol);
        }

        function getArray(input) {
            var asArray = input.split("");
            while (asArray.length < options.decimalPlaces + 1) {
                asArray.unshift(0);
            }

            return asArray;
        }

        function unicodeToChar(text) {
            return text.replace(/\\u[\dA-F]{4}/gi,
              function(match) {
                  return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
              });
        }

        function coelesceOptions(o, locale) {
            
            var defaultOptions = {
                decimalPlaces: 2,
                decimalSeparator: ".",
                currencySymbol: "\u20a1", // unicode hex
                symbolPosition: "left",
                groupingSeparator: ","
            }
            
            if (typeof (o) === "string") {
                this.options = optionsFactory.getOptions(o.toUpperCase(), locale.toUpperCase() || "US");
            } else {
                if (!o) {
                    this.options = defaultOptions;
                } else {
                    this.options = {
                        decimalPlaces: o.decimalPlaces || defaultOptions.decimalPlaces,
                        decimalSeparator: o.decimalSeparator || defaultOptions.decimalSeparator,
                        currencySymbol: o.currencySymbol || defaultOptions.currencySymbol,
                        symbolPosition: o.symbolPosition || defaultOptions.symbolPosition,
                        groupingSeparator: o.groupingSeparator || defaultOptions.groupingSeparator
                    }
                }
            }
        }

        return this;
    }
}(jQuery));

var optionsFactory = (function() {
    var currencySymbol = {
        "USD": {
            symbol: "$",
            nativeLocales: ["US"],
            nativeLocation: "left",
            foreignLocation: "right"
        },
        "GBP": {
            symbol: "\u00a3",
            nativeLocales: ["GB"],
            nativeLocation: "left",
            foreignLocation: "left"
        },
        "EUR": {
            symbol: "\u20ac",
            nativeLocales: ["GB, DE"],
            nativeLocation: "left",
            foreignLocation: "left"
        }
    }

    var localeFormat = {
        "US": {
            decimalPlaces: 2,
            decimalSeparator: ".",
            groupingSeparator: ","
        },
        "GB": {
            decimalPlaces: 2,
            decimalSeparator: ".",
            groupingSeparator: ","
        },
        "EUR": {
            decimalPlaces: 2,
            decimalSeparator: ",",
            groupingSeparator: " "
        }
    }

    this.getOptions = function (currencyCode, currentLocale) {
        var locale = currentLocale.toUpperCase();
        var currency = currencySymbol[currencyCode.toUpperCase()];
        var symbol = currency.nativeLocales.indexOf(locale) > -1 ? currency.symbol : currencyCode;
        var symbolPosition = currency.nativeLocales.indexOf(locale) > -1 ? currency.nativeLocation : currency.foreignLocation;
        var formatting = localeFormat[locale];

        var opt = {
            decimalPlaces: formatting.decimalPlaces,
            decimalSeparator: formatting.decimalSeparator,
            currencySymbol: symbol,
            symbolPosition: symbolPosition,
            groupingSeparator: formatting.groupingSeparator
        }
        
        return opt;
    }

    

    return this;
})();

var formatCustom = {
    "US": {
        decimalSymbol: ".",
        groupingSymbol: ",",
        currencyPosition: "left",
        negativePosition: "left"
    },
    "SE": {
        decimalSymbol: ".",
        groupingSymbol: "`",
        currencyPosition: "right",
        negativePosition: "left"
    },
    "RU": {
        decimalSymbol: ",",
        groupingSymbol: ".",
        currencyPosition: "right",
        negativePosition: "right"
    },
    "JP" : {
        decimalSymbol: "",
        groupingSymbol: ",",
        currencyPosition: "right",
        negativePosition: "right"
    }
}

var currency = {
    "USD": {
        symbol: "\u0024",
        code: 840,
        decimals: 2,
        major: "dollar",
        minor: "cent"
    },
    "GBP": {
        symbol: "\u00a3",
        code: 826,
        decimal: 2,
        major: "pound",
        minor: "pence"
    },
    "EUR": {
        symbol: "\u20ac",
        code: 978,
        decimal: 2,
        major: "euro",
        minor: "cent"
    },
    "JPY": {
        symbol: "\u00a5",
        code: 392,
        decimal: 0,
        major: "yen",
        minor: "sen"
    },
    "PHP": {
        symbol: "\u20b1",
        code: 608,
        decimal: 2,
        major: "peso",
        minor: "centavo"
    },
    "CNY": {
        symbol: "\u00a5",
        code: 156,
        decimal: 2,
        major: "yuan renminbi",
        minor: "jiao"
    }
}
