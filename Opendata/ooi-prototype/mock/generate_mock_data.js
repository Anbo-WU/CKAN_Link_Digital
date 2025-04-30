import { faker } from '@faker-js/faker';
// Corrected import for ua-parser-js (Attempt 3: Named Class Import)
import { UAParser } from 'ua-parser-js'; // Import UAParser as a named export (class)
import mysql from 'mysql2';
import crypto from 'crypto';
import fs from 'fs';

// --- Configuration ---
const TOTAL_PARTICIPANTS = 1000;
const OUTPUT_SQL_FILE = 'insert_participants.sql';

// Probabilities & Ratios
const P_QR_INVITE = 0.45; // Approx 45% invited via QR
const P_PROVIDE_GENDER = 0.50; // 50% provide gender
const P_PROVIDE_AGE = 0.50; // 50% provide age
const P_PROVIDE_LOCATION = 0.25; // 25% provide location

// Geographic Simulation Parameters
const CANBERRA_LAT = -35.2809;
const CANBERRA_LON = 149.1300;
const INITIAL_RADIUS_KM = 5; // Initial spread around ANU/Canberra
const AUSTRALIA_SPREAD_THRESHOLD = 0.2; // Start spreading outside ACT after 20% generated
const INTERNATIONAL_SPREAD_THRESHOLD = 0.7; // Start adding international users after 70% generated
const ANU_IP_PREFIX = '150.203.'; // Example ANU-related IP range start
const CANBERRA_ISP_IPS = ['121.45.56.', '203.10.100.', '137.92.']; // Example Canberra ISP prefixes
const AUS_MAJOR_CITY_IPS = ['1.128.', '14.201.', '101.188.', '203.219.', '49.178.', '101.112.']; // Sydney, Melbourne etc.
const INT_EXAMPLE_IPS = ['114.114.', '8.8.', '202.96.']; // Simplified examples for China, US, etc. (Avoid private ranges like 192.168)

// Demographic Distributions
const GENDER_DIST = { female: 0.52, male: 0.47, other: 0.01 };
const AGE_MEAN_UG = 21; // Undergraduate age mean
const AGE_STDDEV_UG = 2.5;
const AGE_MEAN_PG = 28; // Average postgraduate age (blending domestic/international)
const AGE_STDDEV_PG = 5;
const UG_PROBABILITY = 0.7; // Probability of participant being undergraduate age

const LANGUAGE_DIST = {
    'English': 0.72,
    'Mandarin': 0.027,
    'Arabic': 0.014,
    'Vietnamese': 0.013,
    'Cantonese': 0.012,
    'Punjabi': 0.009,
    'Greek': 0.009,
    'Italian': 0.009,
    // Add more or adjust as needed, ensure sum is <= 1
};
const FALLBACK_LANGUAGE = 'English'; // Language if weighted random fails

// Browser/OS Distributions (Simplified weights)
const BROWSER_DIST = {
    'Chrome': 65,
    'Safari': 18, // Includes Mobile Safari
    'Edge': 5,
    'Firefox': 3,
    'Samsung Internet': 3,
    'Opera': 2,
};
const OS_DIST = {
    'Windows': 45,
    'iOS': 20, // Tied to Safari usually
    'Android': 20, // Tied to Chrome/Samsung Internet
    'Mac OS X': 12, // Tied to Safari/Chrome/Firefox
    'Linux': 3,
};
// --- End Configuration ---

const participants = [];
const participantIds = new Set();
let lastTimestamp = new Date('2024-03-10 10:00:00'); // Ensure timestamps increase

// Helper function for weighted random selection
function weightedRandom(distribution) {
    const rand = Math.random();
    let cumulative = 0;
    for (const item in distribution) {
        // Ensure the property belongs to the object itself
        if (Object.hasOwnProperty.call(distribution, item)) {
            cumulative += distribution[item];
            if (rand < cumulative) {
                return item;
            }
        }
    }
    // Fallback if sum of distribution < 1 or due to floating point issues
    const keys = Object.keys(distribution);
    return keys.length > 0 ? keys[0] : null;
}


// Helper function to get random timestamp after a given time
function getRandomTimestampAfter(startTime, maxMinutesToAdd = 60 * 24 * 2) { // Max 2 days between invites
    const minutesToAdd = Math.random() * maxMinutesToAdd;
    const newTime = new Date(startTime.getTime() + minutesToAdd * 60000);
    // Ensure minimum 1 second gap
    if (newTime <= startTime) {
        return new Date(startTime.getTime() + 1000);
    }
    return newTime;
}

// Helper to format timestamp for SQL
function formatSqlTimestamp(date) {
    if (!date) return 'NULL';
    return `'${date.toISOString().slice(0, 19).replace('T', ' ')}'`;
}

// Helper for SQL escaping (using mysql2 for reliability)
const dummyPool = mysql.createPool({ host: 'dummy' }); // Create pool once
function escapeSql(value) {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'number') return value;
    return dummyPool.escape(value); // Use pool's escape method
}

// Helper to generate random uppercase hex string
function generateRandomHex(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
}

// Generate ODAI ID
function generateOdaiId() {
    return `#ODAI-${generateRandomHex(8)}`;
}

// Generate Invitation Token
function generateInvitationToken() {
    // Using crypto for better randomness than simple hex
    return crypto.randomBytes(32).toString('hex');
}

// Generate plausible IP based on progress
function generateIpAddress(progressRatio) {
    let baseIp = '';
    const rand = Math.random();
    let prefixes;

    if (progressRatio < AUSTRALIA_SPREAD_THRESHOLD) { // Early stage: Canberra focus
        prefixes = [...ANU_IP_PREFIX ? [ANU_IP_PREFIX] : [], ...CANBERRA_ISP_IPS];
        if (Math.random() < 0.3) { // Add some wider Aus IPs even early
             prefixes.push(...AUS_MAJOR_CITY_IPS);
        }
    } else if (progressRatio < INTERNATIONAL_SPREAD_THRESHOLD) { // Mid stage: Australia wide
         prefixes = [...AUS_MAJOR_CITY_IPS, ...CANBERRA_ISP_IPS]; // Mix Aus major & Canberra
    } else { // Late stage: International mix
         if (Math.random() < 0.7) { // Still mostly Australia
              prefixes = [...AUS_MAJOR_CITY_IPS];
         } else { // Simplified International examples
               prefixes = INT_EXAMPLE_IPS;
         }
    }

    // Handle potential undefined prefixes if arrays are empty
    if (!prefixes || prefixes.length === 0) {
        prefixes = ['198.51.100.']; // Default fallback prefix if needed
    }
    baseIp = faker.helpers.arrayElement(prefixes);

    // Complete the IP - crude but functional for mock data
    // Count existing octets, generate remaining needed
    const existingOctets = baseIp.endsWith('.') ? baseIp.slice(0, -1).split('.').length : baseIp.split('.').length;
    const neededOctets = 4 - existingOctets;
    const suffix = Array.from({ length: neededOctets }, () => faker.number.int({ min: 1, max: 254 })).join('.');

    return baseIp + (baseIp.endsWith('.') ? '' : '.') + suffix;
}


// Generate realistic User Agent and parse it
function generateUserAgent() {
    const os = weightedRandom(OS_DIST);
    let browser = weightedRandom(BROWSER_DIST);

    // Make browser/OS slightly more consistent
    if (os === 'iOS') {
        browser = 'Safari'; // iOS almost exclusively uses Safari's engine
    } else if (os === 'Mac OS X') {
        browser = (Math.random() < 0.6) ? 'Safari' : (Math.random() < 0.7 ? 'Chrome' : 'Firefox'); // Safari/Chrome more likely
    } else if (os === 'Android') {
        browser = (Math.random() < 0.7) ? 'Chrome' : ((Math.random() < 0.5) ? 'Samsung Internet' : browser);
    } else if (os === 'Windows') {
        browser = (browser === 'Safari') ? 'Edge' : browser; // Safari very unlikely on Windows
    }

    // Use faker's agent generation - it's diverse but won't perfectly match weights
    const uaString = faker.internet.userAgent({ platform: os }); // Try to base on OS
    // Use 'new' assuming UAParser was imported as a class
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    return {
        user_agent_raw: uaString,
        browser_name: result.browser.name || browser, // Fallback to weighted choice
        browser_version: result.browser.version || null,
        os_name: result.os.name || os, // Fallback to weighted choice
        os_version: result.os.version || null,
    };
}

// Generate Location Point based on IP simulation (very approximate)
function generateLocation(progressRatio, ip) {
     if (Math.random() > P_PROVIDE_LOCATION) return null;

     let lat = CANBERRA_LAT;
     let lon = CANBERRA_LON;
     let radiusKm = INITIAL_RADIUS_KM * 5; // Start with a wider radius for optional data

     const isCanberraIP = ip.startsWith(ANU_IP_PREFIX) || CANBERRA_ISP_IPS.some(prefix => ip.startsWith(prefix));
     const isAusIP = AUS_MAJOR_CITY_IPS.some(prefix => ip.startsWith(prefix));

     if (progressRatio < AUSTRALIA_SPREAD_THRESHOLD && isCanberraIP) {
         radiusKm = INITIAL_RADIUS_KM * (1 + progressRatio * 5); // Slightly increase radius
     } else if (progressRatio < INTERNATIONAL_SPREAD_THRESHOLD && (isCanberraIP || isAusIP)) {
         // Rough approximation: pick a random spot in SE Australia (more likely if AusIP)
         lat = faker.location.latitude({ min: -40, max: -30 });
         lon = faker.location.longitude({ min: 140, max: 152 });
         radiusKm = 200; // Wider radius for city approximation
     } else { // Could be international or less specific Aus IP
         lat = faker.location.latitude();
         lon = faker.location.longitude();
         radiusKm = 500; // Very wide radius
     }

     // Add some random offset using faker's nearbyGPSCoordinate
     const [finalLat, finalLon] = faker.location.nearbyGPSCoordinate({
         origin: [lat, lon],
         radius: radiusKm, // faker uses km here
         isMetric: true
     });

     // Format for SQL POINT(lon, lat)
     return `POINT(${parseFloat(finalLon).toFixed(6)}, ${parseFloat(finalLat).toFixed(6)})`;
}

// --- Root Participant ---
console.log('Initializing root participant...');
const rootUser = {
    id: 1,
    odai_id: '#ODAI-INIT',
    invitation_token: '99e59ab90d4f11f0ba97020017012d97',
    invited_by_participant_id: null,
    experiment_id: '01',
    ip_address: generateIpAddress(0), // Generate IP for root based on initial stage
    gender: null,
    age: null,
    location: null,
    preferred_language: 'English',
    ...generateUserAgent(),
    invited_via_qr: false,
    created_at: lastTimestamp,
    demographics_submitted_at: null,
};
participants.push(rootUser);
participantIds.add(1);
console.log('Root participant initialized.');

// --- Generate Remaining Participants ---
console.log(`Generating ${TOTAL_PARTICIPANTS - 1} additional participants...`);
for (let i = 2; i <= TOTAL_PARTICIPANTS; i++) {
    const progressRatio = (i - 1) / (TOTAL_PARTICIPANTS - 1);

    // Select inviter (simple random selection from existing for this example)
    const inviterId = faker.helpers.arrayElement(Array.from(participantIds));
    const inviter = participants[inviterId - 1]; // Assumes IDs are sequential and array is 0-indexed

    // Ensure inviter exists (should always be true here but good practice)
    if (!inviter) {
        console.error(`Could not find inviter with ID ${inviterId} for participant ${i}`);
        continue; // Skip this participant
    }

    const createdAt = getRandomTimestampAfter(inviter.created_at);
    lastTimestamp = createdAt; // Keep track of the latest timestamp

    const ip = generateIpAddress(progressRatio);
    const location = generateLocation(progressRatio, ip);

    // Determine if optional data is provided for this user
    const providesGender = Math.random() < P_PROVIDE_GENDER;
    const providesAge = Math.random() < P_PROVIDE_AGE;
    // Location provision is determined inside generateLocation based on P_PROVIDE_LOCATION

    const newUser = {
        id: i,
        odai_id: generateOdaiId(),
        invitation_token: generateInvitationToken(),
        invited_by_participant_id: inviterId,
        experiment_id: '01', // Keep simple for now
        ip_address: ip,
        gender: providesGender ? weightedRandom(GENDER_DIST) : null,
        age: providesAge ?
             Math.round(faker.number.int(
                 Math.random() < UG_PROBABILITY ?
                 { min: Math.max(17, AGE_MEAN_UG - 2*AGE_STDDEV_UG), max: AGE_MEAN_UG + 2*AGE_STDDEV_UG } :
                 { min: Math.max(22, AGE_MEAN_PG - 2*AGE_STDDEV_PG), max: AGE_MEAN_PG + 2*AGE_STDDEV_PG }
             )) : null,
        location: location, // generated based on probability and IP inside function
        preferred_language: weightedRandom(LANGUAGE_DIST) || FALLBACK_LANGUAGE,
        ...generateUserAgent(),
        invited_via_qr: Math.random() < P_QR_INVITE,
        created_at: createdAt,
        demographics_submitted_at: null, // Will be set below if needed
    };

    // Set demographics_submitted_at only if at least one optional field was provided
    if (newUser.gender !== null || newUser.age !== null || newUser.location !== null) {
         newUser.demographics_submitted_at = getRandomTimestampAfter(createdAt, 60 * 24); // Submitted within 1 day
    }

    participants.push(newUser);
    participantIds.add(i);

    // Log progress occasionally
    if (i % 100 === 0) {
        console.log(`Generated ${i} participants...`);
    }
}

// --- Generate SQL INSERT Statements ---
console.log(`Generating SQL INSERT statements to ${OUTPUT_SQL_FILE}...`);
// Use fs.createWriteStream for potentially large output
const fileStream = fs.createWriteStream(OUTPUT_SQL_FILE, { encoding: 'utf8' });

const columns = Object.keys(participants[0]).join(', '); // Get columns from first participant

participants.forEach(p => {
    const values = Object.keys(p).map(key => { // Ensure order matches columns
        const val = p[key];
        // Special handling for POINT data
        if (key === 'location' && typeof val === 'string' && val.startsWith('POINT(')) {
             return val; // Keep POINT literal as is
        }
        // Special handling for timestamps
        if (val instanceof Date) {
            return formatSqlTimestamp(val);
        }
        return escapeSql(val);
    }).join(', ');

    fileStream.write(`INSERT INTO participants (${columns}) VALUES (${values});\n`);
});

fileStream.end(); // Close the stream

fileStream.on('finish', () => {
    console.log(`Successfully generated ${TOTAL_PARTICIPANTS} INSERT statements into ${OUTPUT_SQL_FILE}`);
    // Close the dummy pool used for escaping after file writing is done
    dummyPool.end(err => {
        if (err) {
            console.error('Error closing dummy MySQL pool:', err);
        }
    });
});

fileStream.on('error', (err) => {
    console.error(`Error writing to SQL file: ${err}`);
     dummyPool.end(); // Attempt to close pool even on error
});