## Summary of Data Cleaning

## Task background: 
the dataset collected has the following issues: 
1. Missing values: There are a lot of missing values in the dataset such as the attribute Property_Features 
2. Long text: values of the attribute schools contains lone text which made analysis almost impossible
3. Value distribution: the value of the attribute address has highly diversified values which makes it hard to find pattern from it
4. Data type: the data type of the attribute price is in text which is hard to analyze. 

## Task specification: 
1. Task1 - Impute missing values: replace the missing values to the string 'nan' -- assigned to **Yuxin Mu**。#59 
2. Task2 - Break long text: use 2 attriutes to replace the attribute schools. One is the number of school, the other is the distance to the closest school. -- assigned to **Chuang Ma** #60
3. Task3 - Extract value: extract the suburb names like Diskson from each value of the attribute address.Use these values as new values of attribute address. -- assigned to **Yuxin Mu** #59
4. Task4 - Transform data type: extract the numerical value from attribute price and use this value as the attribute price。 -- assigned to **Anbo Wu** #61

## Criterion of complete
1. Task1：All missing values have been transformed and no more missing values are left.
2. Task2: The attribute schools is replaced by two attributes:the number of school and distance to the closest school. Values of these two attributes are extracted from the original attribtue correctly.
3. Task3: Suburb value are extracted from the original attribtue correctly.The values of attribute address is replaced by the suburb value.  
4. Task4: Numerical values are extracted from the attribute price and are used to replace the original values of attribtue price.

## Start date: 17th Sep
## Due date: 20th Sep
