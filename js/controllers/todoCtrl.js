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
	.controller('TodoCtrl', function TodoCtrl($scope, $location, $http, $timeout) {
		var TC = this;
		var todos = TC.todos;

		TC.ESCAPE_KEY = 27;
		TC.editedTodo = {};
		TC.editedLevelTodo = {};
		TC.levels = [1, 2, 3, 4];
		TC.showLevels = false;
		TC.level = 2;
		TC.formData = {};
		TC.editingLevel = false;

		// Get all todos
	    $http.get('https://blooming-falls-2697.herokuapp.com/api/v1/todos')
	        .success(function(data) {
	            todos = TC.todos = data;
	            console.log(data);
	        })
	        .error(function(error) {
	            console.log('Error: ' + error);
	        }
	    );

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
			if(!todos){return;}
			TC.remainingCount = todos.filter(function (todo) { return !todo.complete; }).length;
			TC.allChecked = (TC.remainingCount === 0);
			
			// Save any changes to localStorage
			//todoStorage.put(todos);
		}, true);

		TC.addTodo = function () {
			var newText = TC.newTodo.text = TC.newTodo.text.trim();
			if (newText.length === 0) {
				return;
			}
			TC.newTodo.level = TC.level;

			TC.formData = {'text': newText, complete: false, level: TC.level};

			// Create a new todo
			$http.post('https://blooming-falls-2697.herokuapp.com/api/v1/todos', TC.formData)
			    .success(function(data) {
			        TC.formData = {};
			        todos = TC.todos = data;
			    })
			    .error(function(error) {
			        console.log('Error: ' + error);
			    }
			);

			todos.push(TC.newTodo);
			resetTodo();
		};

		TC.editTodo = function (todo) {
			TC.editedTodo = todo;

			// Clone the original todo to restore it on demand.
			TC.originalTodo = angular.copy(todo);
		};

		TC.editLevelTodo = function (todo) {
			TC.editedLevelTodo = todo;

			// Clone the original todo to restore it on demand.
			TC.originalTodo = angular.copy(todo);
		};

		TC.doneEditing = function (todo, index) {
			TC.editedTodo = {};
			todo.text = todo.text.trim();

			if (!todo.text) {
				TC.removeTodo(index);
			} else {
				// Update a todo
				$http.put('https://blooming-falls-2697.herokuapp.com/api/v1/todos/' + index, todo)
				    .success(function(data) {
				        TC.formData = {};
				        todos = TC.todos = data;
				    })
				    .error(function(error) {
				        console.log('Error: ' + error);
				    }
				);
			}
		};

		TC.doneEditingLevel = function() {
			TC.editedLevelTodo ={};
		}

		TC.revertEditing = function (index) {
			TC.editedTodo = {};
			todos[index] = TC.originalTodo;
		};

		TC.removeTodo = function (index) {
			//todos.splice(index, 1);

			// Delete a todo
			$http.delete('https://blooming-falls-2697.herokuapp.com/api/v1/todos/' + index)
			    .success(function(data) {
			        todos = TC.todos = data;
			    })
			    .error(function(data) {
			        console.log('Error: ' + data);
			    }
			);
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

		TC.updateLevel = function(level, todo) {
			// TC.level = level;
			// TC.showLevels = !TC.showLevels;
			// 
			
			todo.level = level;
			// Update a todo
			$http.put('https://blooming-falls-2697.herokuapp.com/api/v1/todos/' + todo.id, todo)
			    .success(function(data) {
			        TC.formData = {};
			        todos = TC.todos = data;
			    })
			    .error(function(error) {
			        console.log('Error: ' + error);
			    }
			);
			    
			doneEditingLevel();
		}
	});
})();
//jscs:enable
