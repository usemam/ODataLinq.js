/**
Copyright (c) 2012, Usein Mambediiev

Permission is hereby granted, free of charge,
to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function (window, undefined) {
    var jsonpReqCounter = 0;

    var ajaxHelper = {
        getResponseInnerData: function(data) {
            if (data) {
                data = data.d;
            }
            if (data && data.results) {
                data = data.results;
            }
            return data;
        },
        isCrossDomainRequest: function(requestUri) {
            var urlRegex = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;
            
            var ajaxLocation,
                ajaxLocParts,
                parts;

            try {
                ajaxLocation = location.href;
            } catch (e) {
                ajaxLocation = window.document.createElement("a");
                ajaxLocation.href = "";
                ajaxLocation = ajaxLocation.href;
            }

            ajaxLocParts = urlRegex.exec(ajaxLocation.toLowerCase()) || [];

            parts = urlRegex.exec(requestUri.toLowerCase());

            return !!(parts &&
                (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
                    (parts[3] || (parts[1] === "http:" ? 80 : 443)) !=
                        (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443)))
            );
        }
    };

    var ajax = function (options) {
        this.uri = options.uri;
        this.callback = options.callback;

        this.crossDomain = window.ODataLinq.ajaxHelper.isCrossDomainRequest(this.uri);
    };
    
    ajax.prototype.requestThroughXhr = function() {
        var that = this;

        this.xhr = this.createXhr();
        this.xhr.open("GET", this.uri, true);
        this.xhr.setRequestHeader("accept", "application/json");
        this.xhr.onreadystatechange = function () {
            if (this.readyState != 4)
                return;
            if (this.status == 200) {
                var data = JSON.parse(this.responseText);
                data = window.ODataLinq.ajaxHelper.getResponseInnerData(data);
                that.callback(data);
            }
            else {
                throw new Error(this.statusText);
            }
        };
        this.xhr.send(null);
    };
    
    ajax.prototype.requestJsonP = function() {
        var script,
            that = this,
            reqHandlerName = "expando_" + jsonpReqCounter,
			head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

        jsonpReqCounter++;

        window.ODataLinq[reqHandlerName] = function(response) {
            that.callback(window.ODataLinq.ajaxHelper.getResponseInnerData(response));
            delete window.ODataLinq[reqHandlerName];
        };

        script = document.createElement("script");
        script.async = "async";
        script.src = this.uri + (this.uri.indexOf("?") > 0 ? "" : "?") + "&$format=json&$callback=ODataLinq." + reqHandlerName;
        script.onload = script.onreadystatechange = function () {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {

                script.onload = script.onreadystatechange = null;

                if (head && script.parentNode) {
                    head.removeChild(script);
                }

                script = undefined;
            }
        };
        head.insertBefore(script, head.firstChild);
    };
    
    ajax.prototype.request = function () {
        if (this.crossDomain)
            this.requestJsonP();
        else
            this.requestThroughXhr();
    };
    
    ajax.prototype.createXhr = function () {
        if (typeof XMLHttpRequest === 'undefined') {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (e) {
            }
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (e) {
            }
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
            }
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
            }
            throw new Error("This browser does not support XMLHttpRequest.");
        }
        return new XMLHttpRequest();
    };

    var extend = function (object, extension) {
        for (var i in extension) {
            if (extension.hasOwnProperty(i)) {
                object[i] = extension[i];
            }
        }
        return object;
    };

    // Method to emulate classical inheritance

    var inherit = function (Child, Parent) {
        function F() { }
        F.prototype = Parent.prototype;
        Child.prototype = new F;
        Child.prototype.constructor = Child;
        Child.parent = Parent.prototype;
    };

    // Query option representational classes

    var queryOption = function (tail) { // Base query option class
        this.tail = tail;

        this.parse = function () {
            if (this.tail) {
                return this.tail.parse() + '&' + this.parseInternal();
            }
            return this.parseInternal();
        };
    };

    var orderBy = function (order, tail) {
        orderBy.parent.constructor.call(this, tail);

        this.order = order;

        this.parseInternal = function () {
            var orderByOption = "$orderby=";
            for (var i = 0, len = this.order.length; i < len; i++) {
                if (i > 0) {
                    orderByOption += ",";
                }
                var field = this.order[i];
                var isDesc = field[0] == "-";
                if (isDesc) {
                    orderByOption += field.substr(1, field.length) + " desc";
                }
                else {
                    orderByOption += field;
                }
            }
            return orderByOption;
        };
    };
    inherit(orderBy, queryOption);

    var top = function (number, tail) {
        top.parent.constructor.call(this, tail);

        this.number = number;

        this.parseInternal = function () {
            return "$top=" + this.number;
        };
    };
    inherit(top, queryOption);

    var skip = function (number, tail) {
        skip.parent.constructor.call(this, tail);

        this.number = number;

        this.parseInternal = function () {
            return "$skip=" + this.number;
        };
    };
    inherit(skip, queryOption);

    var expand = function(property, tail) {
        expand.parent.constructor.call(this, tail);

        this.parseInternal = function() {
            return "$expand=" + property;
        };
    };
    inherit(expand, queryOption);

    var filter = function (root, tail) {
        filter.parent.constructor.call(this, tail);

        this.filterRoot = root;

        this.parseInternal = function () {
            return "$filter=" + new expressionParser(this.filterRoot).parse().interpret();
        };
    };
    inherit(filter, queryOption);

    var expressionParser = function (expression) {
        var current = null;

        this.parse = function() {
            current = expression;
            return booleanExpression();
        };

        var booleanExpression = function() {
            if (!current) {
                return null;
            }
            var expr = terminalOrNegation();
            if (current) {
                expr = conjunctionOrDisjunction(expr);
            }
            return expr;
        };

        var conjunctionOrDisjunction = function(firstOperand) {
            if (current.operation == operationType.Or) {
                current = current.next;
                if (!current) {
                    throw new Error("Parsing error: expected second disjunction operand.");
                }
                return new disjunctionExpression(firstOperand, booleanExpression());
            }
            else {
                return new conjunctionExpression(firstOperand, booleanExpression());
            }
        };

        var terminalOrNegation = function() {
            if (current.operation == operationType.Not) {
                if (!current.next) {
                    throw new Error("Parsing error: expected terminal expression.");
                }
                current = current.next;
                return new negationExpression(terminal());
            }
            return terminal();
        };

        var terminal = function() {
            if (!current.isTerminal()) {
                throw new Error("Parsing error: expected terminal expression.");
            }
            var t = current;
            current = current.next;
            return new terminalExpression(t.operation, t.operands[0], t.operands[1]);
        };
    };

    var disjunctionExpression = function(left, right) {
        this.left = left;
        this.right = right;

        this.interpret = function() {
            return this.left.interpret() + " or " + this.right.interpret();
        };
    };
    
    var conjunctionExpression = function(left, right) {
        this.left = left;
        this.right = right;

        this.interpret = function() {
            return this.left.interpret() + " and " + this.right.interpret();
        };
    };

    var negationExpression = function(operand) {
        this.operand = operand;

        this.interpret = function() {
            return "not (" + this.operand.interpret() + ")";
        };
    };

    var terminalExpression = function(operation, field, value) {
        this.operation = operation;
        this.field = field;

        var processValue = function(val) {
            if (typeof val === "string") {
                return "'" + val + "'";
            }
            return val;
        };
        
        this.value = processValue(value);

        var logicalOperationAlias = {
            0: " eq ",
            1: " ne ",
            2: " gt ",
            3: " ge ",
            4: " lt ",
            5: " le ",
            9: "substringof(#1, #0) eq true",
            10: "startswith(#0, #1) eq true",
            11: "endswith(#0, #1) eq true"
        };

        this.interpret = function() {
            switch (this.operation) {
                case operationType.Eq:
                case operationType.Ne:
                case operationType.Gt:
                case operationType.Ge:
                case operationType.Lt:
                case operationType.Le:
                    return this.field + logicalOperationAlias[this.operation] + this.value;
                case operationType.Contains:
                case operationType.Starts:
                case operationType.Ends:
                    return logicalOperationAlias[this.operation]
                        .replace("#0", this.field).replace("#1", this.value);
                default:
                    throw new Error("Unsupported operation type");
            }
        };
    };

    var filterExpression = function (operation, operands) {
        this.operation = operation;
        this.operands = operands;
        this.next = null;
    };
    
    filterExpression.prototype.add = function (expression) {
        if (!this.next) {
            this.next = expression;
        }
        else {
            this.next.add(expression);
        }
    };
    
    filterExpression.prototype.isTerminal = function() {
        return this.operation != operationType.Not
            || this.operation != operationType.Or
            || this.operation != operationType.And;
    };

    var operationType = {
        Eq: 0,
        Ne: 1,
        Gt: 2,
        Ge: 3,
        Lt: 4,
        Le: 5,
        And: 6,
        Or: 7,
        Not: 8,
        Contains: 9,
        Starts: 10,
        Ends: 11
    };

    var context = function (uri) {
        this.uri = uri;
        this.queryOptions = null;
        this.filterHead = null;
    };
    
    context.prototype.ajax = function (callback) {
        var request = new ajax({
            uri: this.parseUri(),
            callback: callback
        });
        request.request();
        return request;
    };
    
    context.prototype.parseUri = function () {
        if (this.queryOptions) {
            return this.uri + "?" + this.queryOptions.parse();
        }
        return this.uri;
    };
    
    context.prototype.reveal = function () {
        var ctx = this;

        if (!this.revealingObjects) {
            this.revealingObjects = {};
        }
        var methods = Array.prototype.slice.call(arguments);
        var objectKey = methods.sort().join('');
        if (this.revealingObjects[objectKey]) {
            return this.revealingObjects[objectKey];
        }

        var revealingObject = {};
        var revealMethod = function (method) {
            revealingObject[method] = function () {
                return ctx[method].apply(ctx, arguments);
            };
        };
        for (var i = 0, len = arguments.length; i < len; i++) {
            revealMethod(arguments[i]);
        }
        return this.revealingObjects[objectKey] = revealingObject;
    };
    
    context.prototype.addExpression = function(type, operands, returnMethod) {
        var expression = new filterExpression(type, operands);
        if (!this.filterHead) {
            this.filterHead = expression;
            this.queryOptions = new filter(expression, this.queryOptions);
        }
        else {
            this.filterHead.add(expression);
        }
        returnMethod = returnMethod || "fromOr";
        return this[returnMethod]();
    };

    context.prototype.from = function () {
        return this.reveal("orderby", "select", "take", "skip", "join",
            "not", "equals", "notEquals", "greater", "greaterEquals",
            "less", "lessEquals", "contains", "starts", "ends");
    };
    
    context.prototype.fromOr = function () {
        return extend(this.from(), this.reveal("or"));
    };

    context.prototype.or = function () {
        return this.addExpression(operationType.Or, null, "from");
    };
    
    context.prototype.not = function () {
        return this.addExpression(operationType.Not, null, "from");
    };
    
    context.prototype.equals = function(field, value) {
        return this.addExpression(operationType.Eq, arguments);
    };
    
    context.prototype.notEquals = function(field, value) {
        return this.addExpression(operationType.Ne, arguments);
    };
    
    context.prototype.greater = function(field, value) {
        return this.addExpression(operationType.Gt, arguments);
    };
    
    context.prototype.greaterEquals = function(field, value) {
        return this.addExpression(operationType.Ge, arguments);
    };
    
    context.prototype.less = function(field, value) {
        return this.addExpression(operationType.Lt, arguments);
    };
    
    context.prototype.lessEquals = function(field, value) {
        return this.addExpression(operationType.Le, arguments);
    };
    
    context.prototype.contains = function(field, value) {
        return this.addExpression(operationType.Contains, arguments);
    };
    
    context.prototype.starts = function(field, value) {
        return this.addExpression(operationType.Starts, arguments);
    };
    
    context.prototype.ends = function(field, value) {
        return this.addExpression(operationType.Ends, arguments);
    };
    
    context.prototype.orderby = function () {
        this.queryOptions = new orderBy(arguments, this.queryOptions);
        return this.from();
    };
    
    context.prototype.take = function (number) {
        this.queryOptions = new top(number, this.queryOptions);
        return this.from();
    };
    
    context.prototype.skip = function (number) {
        this.queryOptions = new skip(number, this.queryOptions);
        return this.from();
    };
    
    context.prototype.select = function (callback) {
        this.ajax(callback);
    };
    
    context.prototype.join = function(propertyName) {
        this.queryOptions = new expand(propertyName, this.queryOptions);
        return this.from();
    };

    window.ODataLinq = {
        from: function (uri) {
            var ctx = new context(uri);
            return ctx.from();
        },
        ajaxHelper: ajaxHelper
    };
})(window);