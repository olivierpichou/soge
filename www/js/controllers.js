angular.module('starter.controllers', ['sgData'])

    .controller('AppController', function($scope, $ionicModal, $timeout, $rootScope, $localstorage) {
        $scope.user = $localstorage.getObject('user');

    })

    .controller('LoginController', function($scope, $rootScope, $http, $state, $localstorage){

        $scope.user = $localstorage.getObject('user');
        if ($scope.user.login != undefined)
        {
            $state.go("app.home");
        }

        $scope.homeError = true;
        $scope.homeErrorMEssage = "";
        $scope.data = {};
        $scope.data.firstName = "";
        $scope.data.lastName = "";
        $scope.doLogin = function()
        {
            $http({
                method: 'POST',
                url: 'https://www.unitsupload.com/api/api.php?page=login',
                data: $scope.data
            }).then(function(response){
                console.log("Data rec = " + JSON.stringify(response.data));
                if (response.data.login == true)
                {
                    console.log("Login ok");
                    $localstorage.setObject('user', response.data);
                    $scope.homeError = false;
                    $scope.homeErrorMessage = "";
                    $state.go("app.home");
                    $rootScope.loggedIn = true;
                }
                else
                {
                    console.log("Login fail");
                    $scope.homeError = true;
                    $scope.homeErrorMessage = "Login incorrect.";
                }
            }, function(response){

                    console.log("error");
                    $scope.homeError = true;
                    $scope.homeErrorMessage = "Une erreur est survenue. Veuillez reessayer plus tard.";
            });
        };
    })

    .controller('AccountsController', function($scope, $localstorage, $state, $http){

        $scope.user = $localstorage.getObject('user');
        if ($scope.user.login == undefined)
        {
            $state.go("app.login");
        }
        $scope.accounts = [];
        $http.get("https://www.unitsupload.com/api/api.php?page=account&clientid=" + $scope.user.clientid).then(function(response){

            $scope.accounts = response.data;

        }, function(response){
            console.log("Get accounts error");
        });
    })

    .controller('ProductsController', function($scope, $localstorage, $state, $http){

        $scope.user = $localstorage.getObject('user');
        if ($scope.user.login == undefined)
        {
            $state.go("app.login");
        }
        $scope.products = [];
        $http.get("https://www.unitsupload.com/api/api.php?page=product").then(function(response){

            //for (var i in response.data)
            //{
            //    if (response.data[i].isin = $scope.user.isin)
            //    {
            //        $scope.products.push(response.data[i]);
            //    }
            //}
            $scope.products = response.data;
        }, function(response){
            console.log("Get accounts error");
        });
    })


    .controller('LogoutController', function($scope, $localstorage, $state){

        console.log("Do logout");
        $scope.user = {};
        $localstorage.setObject('user', {});
        $state.go("app.login");
    })


    .controller('HomeController', function($scope, $http, $sgData, $rootScope, $sce, $localstorage, $state)
    {


        $scope.user = $localstorage.getObject('user');
        if ($scope.user.login == undefined)
        {
            $state.go("app.login");
        }

        var data = [];
        var colors = ["#F7464A", "#46BFBD", "#FDB45C"];
        $scope.perf = 0;
        $scope.finalAmount = 0;
        $scope.homeChartLegend = "";
        $scope.homeChartCategoriesLegend = "";

        $http.get("https://www.unitsupload.com/api/api.php?page=account&clientid=" + $scope.user.clientid).then( function(response){

            var initialAmount = 0;
            for(var i in response.data)
            {
                initialAmount += parseInt(response.data[i].account_initialamount);
                $scope.finalAmount += parseInt(response.data[i].account_finalamount);
                data.push({
                    label: response.data[i].account_type,
                    value: parseInt(response.data[i].account_finalamount),
                    color: colors[i]
                });
            }
            $scope.perf = (($scope.finalAmount - initialAmount) / initialAmount * 100).toFixed(2);

            var ctx = document.getElementById("homeChart").getContext("2d");
            var homeChart = new Chart(ctx).Doughnut(data, {
                animateScale: false,
                tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> €",
                multiTooltipTemplate: "<%= value %> €"

            });

            $scope.homeChartLegend = $sce.trustAsHtml(homeChart.generateLegend());
        }, function(response){
            console.log("Error");
        });

        // Getting the second chart
        $http.get("https://www.unitsupload.com/api/api.php?page=account_track_record_composition_categories&id=" + $scope.user.clientid).then( function(response){
            console.log("Recuperation : " + response);
            var data2 = [];
            for(var i in response.data)
            {
                data2.push({
                    label: response.data[i].key,
                    value: parseInt(response.data[i].value),
                    color: colors[i]
                });
            }
            var ctx = document.getElementById("homeChartCategories").getContext("2d");
            var homeChartCategories = new Chart(ctx).Doughnut(data2, {
                animateScale: true,
                tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> €",
                multiTooltipTemplate: "<%= value %> €"
            });
            $scope.homeChartCategoriesLegend = $sce.trustAsHtml(homeChartCategories.generateLegend());
        }, function(response){
            console.log("Error chart 2");
        });
    })
    .controller('AccountController', function($scope, $http, $sgData, $rootScope, $sce, $localstorage, $stateParams, $state){

        $scope.user = $localstorage.getObject('user');
        if ($scope.user.login == undefined)
        {
            $state.go("app.login");
        }

        $scope.account = {};
        $scope.chartData = [];
        var colors = ["#2ecc71", "#2980b9", "#8e44ad", "#34495e", "#f39c12", "#d35400", "#c0392b", "#7f8c8d"];
        $http.get("https://www.unitsupload.com/api/api.php?page=account&id=" + $stateParams.accountId).then(function(response){
            $scope.account = response.data[0];
            console.log("We have the account id...");
            $http.get("https://www.unitsupload.com/api/api.php?page=account_analytics&id=" + $stateParams.accountId).then(function(response){
                for (var i in response.data)
                {
                    console.log("Amount = " + response.data[i].amount);
                    $scope.chartData.push({
                       value: parseFloat(response.data[i].amount).toFixed(2),
                        color: colors[i],
                        label: response.data[i].product_nom
                    });
                }

                $scope.accountPerformanceChartLegend = "";
                $scope.accountChartLegend = "";

                console.log("Data chart = " + JSON.stringify($scope.chartData));

                var ctx = document.getElementById("accountChart").getContext("2d");
                var accountChart = new Chart(ctx).Pie($scope.chartData, {
                    animateScale: true,
                    tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> €",
                    multiTooltipTemplate: "<%= value %> €"
                });
                $scope.accountChartLegend = $sce.trustAsHtml(accountChart.generateLegend());
            }, function(){
                console.log("Error 2");
            });

        }, function(){
            console.log("Error account g1");
        });


        var dataChart2 = {
            labels: ["FEV", "AVR", "JUI", "AOU", "OCT", "DEC", "FEV"],
            datasets: [
                {
                    label: "",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    label: "",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [28, 48, 40, 19, 86, 27, 90]
                }
            ]
        };

        var ctx = document.getElementById("accountPerformanceChart").getContext("2d");
        var accountPerformanceChart = new Chart(ctx).Line(dataChart2, {
            animateScale: true,
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> €",
            multiTooltipTemplate: "<%= value %> €"
        });
        $scope.accountPerformanceChartLegend = $sce.trustAsHtml(accountPerformanceChart.generateLegend());


    })
    .controller('ProductController', function($scope, $http, $sgData, $rootScope, $sce, $stateParams, $state, $localstorage){

        $scope.user = $localstorage.getObject('user');
        if ($scope.user.login == undefined)
        {
            $state.go("app.login");
        }

        var data = [];

        $http.get("https://www.unitsupload.com/api/api.php?page=product&isin=" + $stateParams.isin).then( function(response) {
            for (var i in response.data) {
                data.push({
                    isin: response.data[i].isin,
                    nom: response.data[i].nom,
                    assetclass: response.data[i].assetclass,
                    type: response.data[i].type,
                    pea: response.data[i].pea,
                    cto: response.data[i].cto,
                    zone: response.data[i].zone,
                    devise: response.data[i].devise,
                    management: response.data[i].management,
                    description: response.data[i].description
                });
            }
        }, function(response)
        {
            console.log("Error product api");
        });

        var dataChart = {
            labels: ["FEV", "AVR", "JUI", "AOU", "OCT", "DEC", "FEV"],
            datasets: [
                {
                    label: "Benchmark",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    label: "Apple",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [28, 48, 40, 19, 86, 27, 90]
                }
            ]
        };

        var ctx = document.getElementById("productChart").getContext("2d");
        var productChart = new Chart(ctx).Line(dataChart, {
            animateScale: true,
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> €",
            multiTooltipTemplate: "<%= value %> €"
        });
        $scope.productChartLegend = $sce.trustAsHtml(productChart.generateLegend());

    })
;