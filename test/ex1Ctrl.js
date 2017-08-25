
app.controller('ex1Ctrl', function($scope, $http, $interval) {
    
    
    // --------------------------------------------------------------

    $scope.reload = function () {
	
	// Get new copy of content from server
        $http.get("ex1datetime.php")
	    .then(function(response) {
		$scope.timestamp01 = response.data;
	    });
	
    }

    // --------------------------------------------------------------


    // Main
    $scope.items = {};
    
    // Load the content the first time
    $scope.reload();

});
