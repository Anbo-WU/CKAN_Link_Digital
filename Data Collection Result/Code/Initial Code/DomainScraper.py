import requests
from bs4 import BeautifulSoup
import csv

# URL of the webpage to scrape
url = 'https://www.domain.com.au/rent/canberra-act/?availableto=2024-08-26&excludedeposittaken=1'
# The target website to be scraped

# Send a GET request to the webpage
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Prepare the CSV file
with open('rental_properties.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    # Write the header
    writer.writerow(["No.", "Rent Price", "Location", "Bedroom", "Bathroom", "Parking", "House Type"])

    # Find all property listings
    properties = soup.find_all('div', class_='listing-result')

    for index, property in enumerate(properties, start=1):
        try:
            # Extract relevant information
            rent_price = property.find('p', class_='listing-result__price').text.strip()
            location = property.find('span', class_='listing-result__address').text.strip()
            bedrooms = property.find('span', class_='listing-result__bedrooms').text.strip()
            bathrooms = property.find('span', class_='listing-result__bathrooms').text.strip()
            parking = property.find('span', class_='listing-result__car-spaces').text.strip()
            house_type = property.find('span', class_='listing-result__property-type').text.strip()

            # Write the property information to the CSV file
            writer.writerow([index, rent_price, location, bedrooms, bathrooms, parking, house_type])
        except AttributeError:
            # Handle cases where a particular property might not have all the information
            continue

print("Data has been scraped and saved to rental_properties.csv")