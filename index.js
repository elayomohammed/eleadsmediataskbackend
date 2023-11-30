const {MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// mongodb client instance
const client = new MongoClient(process.env.DBURL);

const app = express();

const port = process.env.port;
const host = process.env.host;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
})

app.use(express.json());
app.use(cors());

// Default route
app.get('/',(req, res, next) => {
    res.status(200).send("\nwelcome to eleads media backend's default endpoint...\nplease navigate to a valid endpoint...");
    next();
});

// Add single user details route
app.post('/insert', async (req, res, next) => {
    try{
        await client.connect();
        console.log('db connected succesfully...');
        const collection = client.db('eleads').collection('allUsersDetails');
        console.log('eleads db and collection connected succesfully...');
        const userDoc = {
            fName: req.body.fName,
            lName: req.body.lName,
            email: req.body.email,
            dob: req.body.dob,
            phone: req.body.phone,
            userID: req.body.userID
        };
        const insertTx = await collection.insertOne(userDoc);
        res.status(200).json(`user inserted successfully with the id: ${insertTx.insertedId}`);
    }catch(error){
        console.error(`insertion error: ${error}`);
    }finally{
        await client.close();
        console.log('db connection closed succesfully...');
    };
    next();
});

// retrieve all details in the db
app.get('/allEntries', async (req, res, next) => {
    try{
        await client.connect();
        const collection = client.db('eleads').collection('allUsersDetails');
        const getTx = await collection.find({}).toArray();
        res.status(200).send(getTx);
    }catch(error){
        console.log(`error getting all entries: ${error}`);
    }finally{
        await client.close();
        console.log('db connection closed successfully...');
    }
})

app.listen(port, host, () => {
    console.log(`server is live and listening on public port ${port}`);
});
