/* jshint undef: true, unused: true */
/*global angular */

/*
 * Line below lets us save `this` as `TC`
 * to make properties look exactly the same as in the template
 */
//jscs:disable safeContextKeyword
(function () {
	'use strict';

	angular.module('todoCtrl', [])

	/**
	 * The main controller for the app. The controller:
	 * - retrieves and persists the model via the todoStorage service
	 * - exposes the model to the template and provides event handlers
	 */
	.controller('TodoCtrl', function TodoCtrl($scope, $location, $http, todoStorage) {
		var TC = this;
		var todos = TC.todos = todoStorage.get();

		TC.ESCAPE_KEY = 27;
		TC.editedTodo = {};
		TC.levels = [1, 2, 3, 4];
		TC.showLevels = false;
		TC.level = 2;

		// Get all todos
	    $http.get('https://blooming-falls-2697.herokuapp.com/api/v1/todos')
	        .success(function(data) {
	            TC.todos = data;
	            console.log(data);
	        })
	        .error(function(error) {
	            console.log('Error: ' + error);
	        });

		function resetTodo() {
			TC.level = 2;
			TC.newTodo = {text: '',level: TC.level, complete: false};
			TC.showLevels = false
		}

		resetTodo();

		if ($location.path() === '') {
			$location.path('/');
		}

		TC.location = $location;

		$scope.$watch('TC.location.path()', function (path) {
			TC.statusFilter = { '/active': {complete: false}, '/completed': {complete: true} }[path];
		});

		// 3rd argument `true` for deep object watching
		$scope.$watch('TC.todos', function () {
			TC.remainingCount = todos.filter(function (todo) { return !todo.complete; }).length;
			TC.allChecked = (TC.remainingCount === 0);

			// Save any changes to localStorage
			todoStorage.put(todos);
		}, true);

		TC.addTodo = function () {
			var newText = TC.newTodo.text = TC.newTodo.text.trim();
			if (newText.length === 0) {
				return;
			}
			TC.newTodo.level = TC.level;

			todos.push(TC.newTodo);
			resetTodo();
		};

		TC.editTodo = function (todo) {
			TC.editedTodo = todo;

			// Clone the original todo to restore it on demand.
			TC.originalTodo = angular.copy(todo);
		};

		TC.doneEditing = function (todo, index) {
			TC.editedTodo = {};
			todo.text = todo.text.trim();

			if (!todo.title) {
				TC.removeTodo(index);
			}
		};

		TC.revertEditing = function (index) {
			TC.editedTodo = {};
			todos[index] = TC.originalTodo;
		};

		TC.removeTodo = function (index) {
			todos.splice(index, 1);
		};

		TC.clearCompletedTodos = function () {
			TC.todos = todos = todos.filter(function (val) {
				return !val.complete;
			});
		};

		TC.markAll = function (complete) {
			todos.forEach(function (todo) {
				todo.complete = complete;
			});
		};

		TC.setLevel = function(level) {
			TC.level = level;
			TC.showLevels = !TC.showLevels;
		}
	});
})();
//jscs:enable
