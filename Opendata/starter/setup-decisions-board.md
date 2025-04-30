<div align="right">![logo](./images/clinic-logo.png)
<div align="left">

# Decision Log

An *Decision Log* board based on the following labels can be used to maintain a record of important decisions. No other decision-related documentation will be required.

* **Decision | Required**

	This list contains all decisions that need to be made. Their descriptions should outline the background and need for the decision as well as any know options.
	
* **Decision | Under Consideration**

	Decisions will be moved to this state, when they are being actively considered. Often, this will be during a meeting.
	
	All discussion and activities undertaken to help make the decision (eg. prototyping, research, user interaction) should be recorded in the decision *Activity Log*.
	
* **Decision | Made**

	Decisions will be moved to this state when they have been made.	When this happens, work will be required to implement the decision. This work should be managed using the normal [Task Management](./setup-task-management-board.md) work flow.
	 
	 * **Tasks will be created.** The tasks required to implement the decision will be created on the [Task Management](./setup-task-management-board.md) board. The new task descriptions should include a link back to the applicable *Decision*.
	 
		The decision's *Activity Log* should updated to include links to the new *Tasks*.

	* **Team Members will be assigned to do the work.** Team members will be assigned to the new tasks by adding applicable *Assignee* labels. These team members will be responsible for completing the tasks.
	* **Task progress will be managed like any other task.** Tasks will be moved through the [Task Management](./setup-task-management-board.md) work flow as work is completed by the assignees. The assignees will also maintain a record of key actions in the task *Activity Logs* and will record time spent in *Time Records*.	 

## Decisions and Meetings

Note that if decisions are made during a meeting, the agenda and/or minutes for that meeting should simply contain a link to an issue with the *Decision | Identified* or *Decision | Made* labels. Then during the meeting, any discussion regarding the decision can be posted directly to the decision issue *Activity Log*.
