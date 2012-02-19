$(document).ready(function() {
    module("integration tests");

    var baseAddress = "http://localhost/WcfDataService/WcfDataService.svc/";

    asyncTest("integration test", function() {
        ODataLinq
            .from(baseAddress + "Products")
            .select(function(data) {
                ok(data != null);
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .take(5)
            .select(function(data) {
                ok(data != null && data.length == 5);
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .orderby("ProductName")
            .select(function(data) {
                ok(data != null);
                start();
            });

        ODataLinq
            .from(baseAddress + "Products")
            .orderby("-ProductName")
            .select(function(data) {
                ok(data != null);
                start();
            });
        
        ODataLinq
            .from(baseAddress + "Products")
            .orderby("-UnitsInStock", "ProductName")
            .select(function(data) {
                ok(data != null);
                start();
            });
        
        ODataLinq
            .from(baseAddress + "Products")
            .skip(70)
            .select(function(data) {
                ok(data != null);
                start();
            });
        
        ODataLinq
            .from(baseAddress + "Products")
            .equals("ProductName", "Chai")
            .select(function(data) {
                ok(data != null);
                start();
            });
        
        ODataLinq
            .from(baseAddress + "Products")
            .not().equals("ProductName", "Chai")
            .select(function(data) {
                ok(data != null);
                start();
            });
        
        ODataLinq
            .from(baseAddress + "Products")
            .notEquals("ProductName", "Chai")
            .greater("ProductID", 70)
            .select(function(data) {
                ok(data != null);
                start();
            });
        
        ODataLinq
            .from(baseAddress + "Products")
            .equals("ProductName", "Chai")
            .or().less("ProductID", 5)
            .select(function(data) {
                ok(data != null);
                start();
            });
    });
});