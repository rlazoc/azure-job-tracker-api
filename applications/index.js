/// DEFINITIONS ///

require('dotenv').config();
const express = require('express');
const { Client } = require('@notionhq/client'); // destruct Client object from @notionhq/client ({Client: Class, otherProp: value})
const cors = require('cors');

const app = express(); // this is the server
const port = process.env.PORT || 8080;

/// NOTION ///
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

/// EXPRESS/SERVER
app.use(cors());

app.get('/', async (req, res) => {
    res.send('Welcome to the Notion Job Tracker API!');
});

app.get('/applications', async (req, res) => {
    if (!databaseId) {
        return res.status(500).json({ error: 'Notion Database ID is not configured.'});
    }
    try {
        const response =  await notion.databases.query({
            database_id: databaseId
        });
        const applications = response.results.map((page) => {
            return {
                id: page.id,
                company: page.properties['Company Name'].title[0]?.plain_text,
                position: page.properties['Position'].rich_text[0]?.plain_text,
                status: page.properties['Status'].select?.name,
                date: page.properties['Date Applied'].date?.start
            };
        });
        res.json(applications); // clean output of job applications
    } catch (error) {
        console.error('Error fetching from Notion:', error);
        res.status(500).json({ error: 'Failed to fetch data from Notion.' });
    }
});

app.listen(port, () => {
    console.log(`Server is on http://localhost:${port}`);
});