<div align="right">![logo](./images/clinic-logo.png)
<div align="left">

# GitLab concept - Issue Boards

[GitLab issue boards](https://docs.gitlab.com/ee/user/project/issue_board.html) are the key tool we use to manage a project. Specifically, boards can be used to manage the progress of tasks and other issues through a specified workflow.

Each board comprises a set of columns that each represent a stage in a workflow. Within each column there is a list of issues that are at the associated stage of the workflow.

Each column is associated with a specific *label*. Issues that have that label will be displayed in the column.

For example, we may have a board to manage the workflow of Tasks. Each column (stage) on the boards will be associated with a label such as:

* Task | Backlog
* Task | In Progress
* Task | In Review
* Task | Completed

When such a board is displayed, all Tasks that are labeled *'Task | Backlog'* will be listed in the first column. Tasks that are labeled *'Task | In Progress'* will be listed in the second column, and so on.

Users can drag and drop tasks between columns to reflect the flow of work through the board.

![task management board](./images/task-management-board.png)

## Creating issues on boards

It is possible to create an issue directly within a column of an *Issue Board*. When this is done, the issue will be automatically given the label associated with the column.
