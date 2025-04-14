import pandas as pd

# Load the dataset
df = pd.read_csv('C:\\Users\\DoeunHan\\Desktop\\/final_cleaned_data.csv')

# Full quality check script
def quality_check(df):
    # Columns to check for negative values
    columns_to_check_negative = ['price', 'bedrooms', 'bathrooms', 'parking', 'number_of_schools', 'closest_school']
    
    # Check for negative values
    negative_values = df[(df[columns_to_check_negative] < 0).any(axis=1)]
    
    # Check for rows with NaN values
    nan_rows = df[df.isna().any(axis=1)]
    
    # Check for rows where price is <= 200
    low_price_rows = df[df['price'] <= 200]
    
    # Check for rows where bedrooms are 0
    zero_bedroom_rows = df[df['bedrooms'] == 0]
    
    # Save the results to CSV files
    nan_file_path = 'C:\\Users\\DoeunHan\\Desktop\\rows_with_nan_values.csv'
    low_price_file_path = 'C:\\Users\\DoeunHan\\Desktop\\rows_with_price_below_200.csv'
    zero_bedroom_file_path = 'C:\\Users\\DoeunHan\\Desktop\\rows_with_zero_bedrooms.csv'
    
    nan_rows.to_csv(nan_file_path, index=False)
    low_price_rows.to_csv(low_price_file_path, index=False)
    zero_bedroom_rows.to_csv(zero_bedroom_file_path, index=False)
    
    return {
        "negative_values": negative_values,
        "nan_rows": nan_rows,
        "low_price_rows": low_price_rows,
        "zero_bedroom_rows": zero_bedroom_rows,
        "nan_file": nan_file_path,
        "low_price_file": low_price_file_path,
        "zero_bedroom_file": zero_bedroom_file_path
    }

# Check for negative values in specific fields and output which fields have negatives
def check_negative_fields(df, columns_to_check):
    negative_columns = {}
    for column in columns_to_check:
        if (df[column] < 0).any():
            negative_columns[column] = df[df[column] < 0][column].values
    return negative_columns

# Running the quality check
quality_check_results = quality_check(df)

# Checking for fields with negative values
columns_to_check_negative = ['price', 'bedrooms', 'bathrooms', 'parking', 'number_of_schools', 'closest_school']
negative_fields = check_negative_fields(df, columns_to_check_negative)

# Output the negative fields and values if found
print(negative_fields)