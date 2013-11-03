var app = angular.module("GoRunnerApp", [], function ($routeProvider) {
	$routeProvider.when('/jobs', {
		title: "jobs",
		templateUrl: '/static/templates/jobs.html',
		controller: JobsCtl
	})
	.when('/jobs/:job', {
		title: "job",
		templateUrl: '/static/templates/job.html',
		controller: JobCtl
	})
	.when('/tasks', {
		title: "tasks",
		templateUrl: '/static/templates/tasks.html',
		controller: TasksCtl
	})
	.when('/tasks/:task', {
		title: "task",
		templateUrl: '/static/templates/task.html',
		controller: TaskCtl
	})
	.when('/triggers', {
		title: 'triggers',
		templateUrl: '/static/templates/triggers.html',
		controller: TriggersCtl
	})
	.when('/triggers/:trigger', {
		title: 'trigger',
		templateUrl: '/static/templates/trigger.html',
		controller: TriggerCtl
	})
	.when('/runs', {
		title: 'runs',
		templateUrl: '/static/templates/runs.html',
		controller: RunsCtl
	})
	.when('/runs/:run', {
		title: 'run',
		templateUrl: '/static/templates/run.html',
		controller: RunCtl
	})
	.otherwise({
		redirectTo: '/jobs'
	});
});

app.run(['$location', '$rootScope', function($location, $rootScope) {
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		if(current.$$route) {
			$rootScope.title = current.$$route.title;
		}
	});
}]);

app.factory('gorunner', function($http){
	return {
		getRecentRuns: function (success, failure) {
			$http({
				method: "GET",
				url: "/runs"
			})
			.success(success)
			.error(failure)
		},

		listJobs: function (success, failure) {
			$http({
				method: "GET",
				url: "/jobs"
			})
			.success(success)
			.error(failure);
		},

		getJob: function(name, success, failure) {
			$http({
				method: "GET",
				url: "/jobs/" + name
			})
			.success(success)
			.error(failure)
		},

		addJob: function(name, success, failure) {
			$http({
				method: "POST",
				url: "/jobs",
				data: {'name': name}
			})
			.success(success)
			.error(failure);
		},

		addTaskToJob: function(task, job, success, failure){
			$http({
				method: "POST",
				url: "/jobs/" + job + "/tasks",
				data: {task: task}
			})
			.success(success)
			.error(failure);
		},

		removeTaskFromJob: function(task_idx, job, success, failure) {
			$http({
				method: "DELETE",
				url: "/jobs/" + job + "/tasks/" + task_idx
			})
			.success(success)
			.error(failure);
		},

		listTasks: function(success, failure) {
			$http({
				method: "GET",
				url: "/tasks"
			})
			.success(success)
			.error(failure);
		},

		getTask: function(name, success, failure) {
			$http({
				method: "GET",
				url: "/tasks/" + name
			})
			.success(success)
			.error(failure);
		},

		addTask: function(name, success, failure) {
			$http({
				method: "POST",
				url: "/tasks",
				data: {name: name}
			})
			.success(success)
			.error(failure);
		},

		saveTask: function(name, script, success, failure) {
			$http({
				method: "PUT",
				url: "/tasks/" + name,
				data: {script: script}
			})
			.success(success)
			.error(failure);
		},

		listRuns: function(success, failure) {
			$http({
				method: "GET",
				url: "/runs"
			})
			.success(success)
			.error(failure);
		},

		getRun: function(run, success, failure) {
			$http({
				method: "GET",
				url: "/runs/" + run
			})
			.success(success)
			.error(failure);
		},

		runJob: function(job, success, failure) {
			$http({
				method: "POST",
				url: '/runs',
				data: {job: job}
			})
			.success(success)
			.error(failure);
		},

		listTriggers: function(success, failure) {
			$http({
				method: "GET",
				url: "/triggers"
			})
			.success(success)
			.error(failure);
		},

		getTrigger: function(name, success, failure) {
			$http({
				method: "GET",
				url: "/triggers/" + name
			})
			.success(success)
			.error(failure);
		},

		saveTrigger: function(name, cron, success, failure) {
			$http({
				method: "PUT",
				url: "/triggers/" + name,
				data: {cron: cron}
			})
			.success(success)
			.error(failure);
		},

		addTrigger: function(name, success, failure) {
			$http({
				method: "POST",
				url: "/triggers",
				data: {name: name}
			})
			.success(success)
			.error(failure);
		},

		deleteTrigger: function(name, success, failure) {
			$http({
				method: "DELETE",
				url: "/triggers/" + name
			})
			.success(success)
			.error(failure);
		}
	}
});

app.controller('MainCtl', function ($scope, gorunner) {
	$scope.refreshRuns = function() {
		gorunner.getRecentRuns(function(data){
			$scope.recent = data;
		}, function(data) {
			$scope.recent = [];
		});
	};

	$scope.refreshRuns();
});

function JobsCtl($scope, gorunner) {
	gorunner.listJobs(function (data) {
		$scope.jobs = data;
	}, function () {
		alert("Error loading jobs");
	});

	$scope.quickRun = function(job) {
		gorunner.runJob(job, function(){
			$scope.refreshRuns();
		}, function(){
			alert("Failed to start job " + job);
		});
	};

	$scope.promptJob = function() {
		var name = prompt("Enter name of job:");
		if(name) {
			gorunner.addJob(name, function(){
				window.location = "/#/jobs/" + name;
			}, function(){
				alert("Error adding job " + name);
			})
		}
	}
}

function JobCtl($scope, $routeParams, gorunner) {
	$scope.job = $routeParams.job;

	$scope.refreshJob = function(){
		gorunner.getJob($routeParams.job, function(data){
			$scope.job = data;
		}, function(){
			alert("Error loading " + name);
		});
	};

	$scope.tasks = [];
	$scope.refreshTasks = function(){
		gorunner.listTasks(function(data) {
			for(var i=0; i<data.length; i++) {
				$scope.tasks.push(data[i].name);
			}
		}, function(data) {
			alert("Error loading tasks");
		});
	};

	$scope.removeTask = function(idx) {
		gorunner.removeTaskFromJob(idx, $routeParams.job, function(){
			$scope.refreshJob();
		}, function(){
			alert("Failed to remove task");
		})
	};

	$scope.addTaskToJob = function(task) {
		gorunner.addTaskToJob(task, $routeParams.job, function(){
			$scope.refreshJob();
		}, function() {
			alert("Failed to add task to job");
		});
	};

	$scope.refreshJob();
	$scope.refreshTasks();
}

function TasksCtl($scope, gorunner) {
	gorunner.listTasks(function(data) {
		$scope.tasks = data;
	}, function(data) {
		alert("Error loading tasks");
	});

	$scope.promptTask = function() {
		var name = prompt("Enter name of task:");
		if(name) {
			gorunner.addTask(name, function(){
				window.location = "/#/tasks/" + name;
			}, function(){
				alert("Error adding task " + name);
			})
		}
	}
}

function TaskCtl($scope, $routeParams, gorunner) {
	gorunner.getTask($routeParams.task, function(data) {
		$scope.task = data;
	}, function(data) {
		alert("Error loading task " + $routeParams.task)
	});

	$scope.saveTask = function() {
		gorunner.saveTask($scope.task.name, $scope.task.script, function(){
			window.location = "/#/tasks";
		}, function(){
			alert("Save failed");
		})
	}
}

function RunsCtl($scope, gorunner) {
	gorunner.listRuns(function(data) {
		$scope.runs = data;
	}, function(data) {
		alert("Failed to list runs");
	})
}

function RunCtl($scope, $routeParams, gorunner) {
	gorunner.getRun($routeParams.run, function(data) {
		$scope.run = data;
	}, function(data) {
		alert("Failed to get run " + $routeParams.run);
	})
}

function TriggersCtl($scope, gorunner) {
	$scope.refreshTriggers = function(){
		gorunner.listTriggers(function(data){
			$scope.triggers = data;
		}, function() {
			alert("Failed to load triggers");
		})
	};

	$scope.refreshTriggers();

	$scope.deleteTrigger = function(name) {
		gorunner.deleteTrigger(name, function(){
			$scope.refreshTriggers();
		}, function(){
			alert("Failed to delete trigger " + name);
		});
	};

	$scope.promptTrigger = function(){
		var name = prompt("Enter a name for the new trigger");
		if(name) {
			gorunner.addTrigger(name, function(){
				$scope.refreshTriggers();
			}, function(){
				alert("Failed to load triggers");
			})
		}
	}
}

function TriggerCtl($scope, $routeParams, gorunner) {
	$scope.getTrigger = function(name) {
		gorunner.getTrigger(name, function(data){
			$scope.trigger = data;
		}, function(){
			alert("Failed to get trigger " + $routeParams.trigger);
		});
	};

	$scope.getTrigger($routeParams.trigger);

	$scope.saveTrigger = function() {
		gorunner.saveTrigger($scope.trigger.name, $scope.trigger.schedule, function(){
			window.location = "/#/triggers";
		}, function() {
			alert("Failed to save trigger");
		})
	};
}