## Issue of the data cleaning result

## Background: 
After the data cleaning process (as can be seen from the Summary of data cleaning file), we had a 'cleaned' dataset. 
However, it has been identified that the dataset has not been fully cleaned and there are some issues in this dataset. These issues are
1. Price attribute: in the 'cleaned' dataset,  attribute price has too low value of 0 to 4. THis reflectes a problem in the data cleaning task4
2. This issue is not identified by the team's regular working process. This reflects a problem in team management. 
## Task specification: 
1. Task1 - find out the problems in the original cleaning process of the attribute price. do the task again   -- assigned to **Yuxin Mu** see #64
2. Task2 - reflect on why the mistake has not been identified by the team and what improvement and action should be taken in future -- assigned to **Yuxin Mu** see #65

## Criterion of complete
1. Task1：Numerical values are extracted from the attribute price and are used to replace the original values of attribtue price. If there is no numerical value or the numerical value is not relasitc (significantly less than the average value), use the string 'nan' as replacement. 
2. Task2: A reflection details why the issue is not identified, what process should be taken in the future. 


## Start date: 20th Sep
## Due date: 21th Sep
