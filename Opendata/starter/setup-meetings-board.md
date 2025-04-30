<div align="right">![logo](./images/clinic-logo.png)
<div align="left">

# Meeting Boards

Maintaining meeting agenda, minutes and follow up actions can be a tedious process. However, GitLab can make the process easier and more useful.

You can manage meetings using *Issue Boards* - one for each type of meeting (eg. Team, Client, Tutorial). All stakeholders (including your examiners) will be able to see the state of all meetings and access meeting details from these boards. No other documentation will be required.

## Team Meetings

The *Team Meetings* board is based on the following labels:

* **Meeting | Team | Planned**

	This list contains all planned meetings. They will probably only contain a proposed meeting date and location at this stage of the work flow.

	Note that the meeting's *Activity Log* will be active and could be used to discuss/negotiate the proposed meeting date and location.

* **Meeting | Team | Agenda Available**

	When an agenda has been added to a *Meeting*, it can be moved to this stage of the work flow.
	
	Note that, because we are using GitLab, agenda can include links to applicable documents, code, tasks, decisions, and risks etc. and can be discussed/negotiated in the associated *Activity Log*.

* **Meeting | Team | Being Minuted**

	*Meetings* will be in this state while they are underway and until all minutes are completed.
	
	Minutes should be kept as posts to the meeting *Activity Log*.
	
	Meetings will often result in actions that involve changes to decisions, risks, tasks and other artefacts. It is important that all tasks required to complete such actions are created during the minuting process. The minutes should include links to such tasks.
	
	Note that we have seen some students write minutes directly into GitLab during the meeting - in real-time. This can ensure an accurate record and will eliminate the necessity to write minutes at a later time. 

	Audio recordings can also be added to the Meeting *Activity Log*.
	
* **Meeting | Team | Being Actioned**

	Once a meeting has ended and minutes have been recorded (as posts in the meeting *Activity Log*), it can be moved to the *Being Actioned* column.

	In this state, the team will be working on tasks identified in the meeting minutes by moving them through the [Task Management](./setup-task-management-board.md) work flow.

* **Meeting | Team | All Actions Completed**

	Once all meeting actions have been completed the meeting can be moved to the *All Actions Completed* state.
	
## Client Meetings

The *Client Meetings* board adopts the same workflow as *Team Meetings* board and is based on the following labels:

* Meeting | Client | Planned
* Meeting | Client | Agenda Available
* Meeting | Client | Being Minuted
* Meeting | Client | Being Actioned
* Meeting | Client | All Actions Completed

## Tutorial Meetings

The *Tutorial Meetings* board adopts the same workflow as *Team Meetings* board and is based on the following labels:

* Meeting | Tutorial | Planned
* Meeting | Tutorial | Agenda Available
* Meeting | Tutorial | Being Minuted
* Meeting | Tutorial | Being Actioned
* Meeting | Tutorial | All Actions Completed

## Other meetings

If your team has regular meetings with other stakeholders, such as *The TechLauncher Clinic*, you can create additional boards like those described above.
