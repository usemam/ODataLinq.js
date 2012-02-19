$(document).ready(function() {
    module("unit tests");

    var baseAddress = "http://localhost/ODataService/";

    asyncTest("testing 'from' method", function() {
        ODataLinq
            .from(baseAddress + "Products")
            .select(function(data) {
                ok(data != null && data.length > 0);
                start();
            });
    });

    asyncTest("testing 'orderby' method", function() {
        var checkSorting = function(data, field, isAsc) {
            var array = $.map(data, function(product) {
                return product[field];
            });
            array.sort();
            if (!isAsc) {
                array.reverse();
            }
            var isSorted = true;
            $.each(array, function(key, value) {
                isSorted = data[key][field] == value;
            });
            return isSorted;
        };

        ODataLinq
            .from(baseAddress + "Products")
            .orderby("Name")
            .select(function(data) {
                ok(checkSorting(data, "Name", true), "Single field");
                start();
            });
        
        ODataLinq
            .from(baseAddress + "Products")
            .orderby("-Name")
            .select(function(data) {
                ok(checkSorting(data, "Name", false), "Single field, descending order");
                start();
            });
    });

    asyncTest("testing 'take' method", function() {
        ODataLinq
            .from(baseAddress + "Products")
            .take(3)
            .select(function(data) {
                ok(data != null && data.length == 3);
                start();
            });
    });

    asyncTest("testing 'skip' method", function() {
        ODataLinq
            .from(baseAddress + "Products")
            .skip(5)
            .select(function(data) {
                ok(data != null);
                start();
            });
    });

    asyncTest("testing filtering methods", function() {
        ODataLinq
            .from(baseAddress + "Products")
            .equals("Name", "Bread")
            .or()
            .not().equals("Name", "Eggs")
            .select(function(data) {
                ok(data != null && $.grep(data,
                        function(product) {
                            return product.Name == "Bread" || product.Name != "Eggs";
                        }).length == data.length,
                    "'equals', 'or', 'not'");
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .notEquals("Name", "Bread")
            .select(function(data) {
                ok(data != null && $.grep(data,
                    function(product) {
                        return product.Name != "Bread";
                    }).length == data.length, "'notEquals'");
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .greater("Id", 5)
            .select(function(data) {
                ok(data != null && $.grep(data,
                    function(product) {
                        return product.Id > 5;
                    }).length == data.length, "'greater'");
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .greaterEquals("Id", 6)
            .select(function(data) {
                ok(data != null && $.grep(data,
                    function(product) {
                        return product.Id >= 6;
                    }).length == data.length, "'greaterEquals'");
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .less("Id", 3)
            .select(function(data) {
                ok(data != null && $.grep(data,
                    function(product) {
                        return product.Id < 3;
                    }).length == data.length, "'less'");
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .lessEquals("Id", 2)
            .select(function(data) {
                ok(data != null && $.grep(data,
                    function(product) {
                        return product.Id <= 2;
                    }).length == data.length, "'lessEquals'");
                start();
            });
    });
});