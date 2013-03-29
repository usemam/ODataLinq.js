(function(window, undefined) {
    var stubData = {
        'http://localhost/ODataService/Products':
            '{"d": [{"Id": 1, "Name": "Meat"}, {"Id": 2, "Name": "Bread"}]}',
        'http://localhost/ODataService/Products?$orderby=Name':
            '{"d": [{"Id": 2, "Name": "Bread"}, {"Id": 1, "Name": "Meat"}]}',
        'http://localhost/ODataService/Products?$orderby=Name desc':
            '{"d": [{"Id": 1, "Name": "Meat"}, {"Id": 2, "Name": "Bread"}]}',
        'http://localhost/ODataService/Products?$top=3':
            '{"d": [{"Id": 1, "Name": "Meat"}, {"Id": 2, "Name": "Bread"}, {"Id": 3, "Name": "Eggs"}]}',
        'http://localhost/ODataService/Products?$skip=5':
            '{"d": [{"Id": 6, "Name": "Olive oil"}, {"Id": 7, "Name": "Butter"}]}',
        "http://localhost/ODataService/Products?$filter=Name eq 'Bread' or not (Name eq 'Eggs')":
            '{"d": [{"Id": 1, "Name": "Meat"}, {"Id": 2, "Name": "Bread"}]}',
        "http://localhost/ODataService/Products?$filter=Name ne 'Bread'":
            '{"d": [{"Id": 6, "Name": "Olive oil"}, {"Id": 7, "Name": "Butter"}]}',
        'http://localhost/ODataService/Products?$filter=Id gt 5':
            '{"d": [{"Id": 6, "Name": "Olive oil"}, {"Id": 7, "Name": "Butter"}]}',
        'http://localhost/ODataService/Products?$filter=Id ge 6':
            '{"d": [{"Id": 6, "Name": "Olive oil"}, {"Id": 7, "Name": "Butter"}]}',
        'http://localhost/ODataService/Products?$filter=Id lt 3':
            '{"d": [{"Id": 1, "Name": "Meat"}, {"Id": 2, "Name": "Bread"}]}',
        'http://localhost/ODataService/Products?$filter=Id le 2':
            '{"d": [{"Id": 1, "Name": "Meat"}, {"Id": 2, "Name": "Bread"}]}',
        "http://localhost/ODataService/Products?$filter=substringof('oil', Name) eq true":
            '{"d": [{"Id": 6, "Name": "Olive oil"}, {"Id": 8, "Name": "Sunflower oil"}]}',
        "http://localhost/ODataService/Products?$filter=startswith(Name, 'B') eq true":
            '{"d": [{"Id": 2, "Name": "Bread"}, {"Id": 7, "Name": "Butter"}]}',
        "http://localhost/ODataService/Products?$filter=endswith(Name, 'oil') eq true":
            '{"d": [{"Id": 6, "Name": "Olive oil"}, {"Id": 8, "Name": "Sunflower oil"}]}',
        'http://localhost/ODataService/Products?$expand=Category':
            '{"d" :[{"Id": 1, "Name": "Meat", "Category": {"Id": 1, "Name": "Food"}}]}'
    };

    window.XMLHttpRequest = function() {
        this.open = function(method, url, isAsync) {
            this.url = url;
        };
        this.setRequestHeader = function(key, value) {
        };
        this.send = function(data) {
            this.readyState = 4;
            this.status = 200;
            this.responseText = stubData[this.url];
            if (this.responseText === undefined) {
                throw new Error("Not existing key: " + this.url);
            }
            var that = this;
            setTimeout(function() { that.onreadystatechange(); }, 1);
        };
    };
})(window);