export const testSourceLong = `Today:
	- item #1 @recur(2) @due(2022-01-18)
	- item #2 @recur(2) @due(2022-01-18)
	- a due item @due(2022-01-13)
	- another due item @due(2022-01-14)

Future:
	- item #5 @annual(11/1) @due(anything)P @due(2022-11-01)
	- an item that should recur today @recur(1) @due(2022-01-22)
	- item #4 @annual(11/1) @due(2022-11-01)
	- item #6 @annual(11/1) @due(2022-11-01)
	- savor @recur(2) @due(2022-01-18)
	
Archive:
	- an item that should recur today @due(2022-01-17) @done(22-01-21 20:51) @project(Today)
	- item #2 @due(2022-01-12) @done(22-01-16 16:52) @project(Today)
	- item #3 @done(2020-01-03) @project(Today)
	- item #4 @done(2020-01-03) @project(Today)`;
