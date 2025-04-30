<div align="right">![logo](./images/clinic-logo.png)
<div align="left">

# Risk Log

A set of *Issue Boards* can be used to manage risks to your project.

While this may not an ideal way to manage risks, it does work and has the significant advantage of being integrated within your GitLab project. That is, any descriptions, actions etc. can contain references to other GitLab project items. Risk work flow can also be managed and reported in the same way as decisions, tasks and feedback.

## Risk State

The following labels are used to represent a Risk's state. A *Risk Log* board based on these labels will show the risks that have occurred and those that have not.

* **Risk | Identified**

	Risks are initially created in the *Risk | Identified* state and assigned _Treatment_, _Severity_ and _Likelihood_ labels (see below).

* **Risk | Occurred**

	 If a Risk *occurs*, it will be moved to the *Risk | Occurred* state. When this happens, the *Risk* becomes an *Issue* which will require work to resolve. This work should be managed using the normal [Task Management](./setup-task-management-board.md) work flow.
	 
	 * **Tasks will be created.** The tasks required to deal with the issue will be created on the [Task Management](./setup-task-management-board.md) board. The new task descriptions should include a link back to the *Risk*.
	 
		The risk's *Activity Log* should updated to explain what happened and to include links to the new *Tasks*.

	* **Team Members will be assigned to do the work.** Team members will be assigned to the new tasks by adding *Assignee* labels. These team members will be responsible for completing the tasks.
	* **Task progress will be managed like any other task.** Tasks will be moved through the [Task Management](./setup-task-management-board.md) work flow as work is completed by the assignees. The assignees will also maintain a record of key actions in the task *Activity Logs* and will record time spent in *Time Records*.	 

## Risk Treatment

Risks can be labeled using one of the following labels to indicate proposed treatment. A *Risk Log - By Treatment* board based on these labels will show risks organised by *Treatment*.

* Risk | Treatment | Accept
* Risk | Treatment | Mitigate
* Risk | Treatment | Transfer

Refer to [TechLauncher Note - Risk Management](https://comp.anu.edu.au/TechLauncher/files/Jan22%20-%20Risk%20Management.pdf) for the meaning of these terms.

## Risk Severity

Risks can be labeled using one of the following labels to indicate risk severity. A *Risk Log - By Severity* board based on these labels will show risks organised by *Severity*.

* Risk | Severity | Low
* Risk | Severity | Medium
* Risk | Severity | High

Note that you may choose to use a different set of terms to represent *Risk Severity*.

## Risk Likelihood

Risks can be labeled using one of the following labels to represent risk likelihood. A *Risk Log - By Likelihood* board based on these labels will show risks organised by *Likelihood*.

* Risk | Likelihood | Low
* Risk | Likelihood | Medium
* Risk | Likelihood | High

Note that you may choose to use a different set of terms to represent *Risk Likelihood*.
