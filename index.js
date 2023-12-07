const nodemailer = require('nodemailer');
const {MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// mongodb client instance
const client = new MongoClient(process.env.DBURL);

const app = express();

const port = process.env.port;
// const host = process.env.host;

function validatePhoneNumber(phoneNumber) {
    // Regular expression patterns for Nigeria and India phone numbers
    const nigeriaPattern = /^(?:\+234\d{10})|(?:0[89]\d{9})$/;
    const indiaPattern = /^(?:\+91\d{10})|(?:0[789]\d{9})$/;
  
    // Check if the phone number matches either pattern
    if (nigeriaPattern.test(phoneNumber) || indiaPattern.test(phoneNumber)) {
      return true;
    } else {
      return false;
    }
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
})

app.use(express.json());
app.use(cors());

// Default route
app.get('/api',(req, res, next) => {
    res.status(200).send("\nwelcome to eleads media backend's default endpoint...\nplease navigate to a valid endpoint...");
    next();
});

// Add single user details route
app.post('/api/insert', async (req, res, next) => {
    try{
        await client.connect();
        const collection = client.db('eleads').collection('allUsersDetails');
        console.log('eleads media db connected succesfully...');
        const userDoc = {
            fName: req.body.fName,
            lName: req.body.lName,
            email: req.body.email,
            dob: req.body.dob,
            phone: req.body.phone,
            userID: req.body.userID
        };

        if (validatePhoneNumber(userDoc.phone)) {
            const insertTx = await collection.insertOne(userDoc);

            const sendEmail = async () => {
                // email transporter
                const transporter = nodemailer.createTransport({
                    host: 'smtp.google.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'thefreethinkeer@gmail.com',
                        pass: process.env.TRNASPORTER_PASS
                    }
                });
                // mail configuration
                const mailParams = {
                    from: '"eLeads Media" thefreethinkeer@gmail.com',
                    to: userDoc.email,
                    subject: 'successfull input entry',
                    text: `your input for user ${userDoc.email} have been saved successfully to the server...`,
                    html: `<p>your input for user ${userDoc.email} have been saved successfully to the server...</p>`
                };
                transporter.sendMail(mailParams, (error, info) =>{
                    if(error){
                        console.log(error);
                    }else{
                        console.log('email sent', info.messageId);
                    }
                });
            };
            await sendEmail();
            res.status(200).json(`user inserted successfully with the id: ${insertTx.insertedId}`);
        }else{
            res.status(400).json('Failed to submit form, Wrong phone number format...');
        }
    }catch(error){
        console.error(`insertion error: ${error}`);
    }finally{
        await client.close();
        console.log('db connection closed succesfully...');
    };
    next();
});

// retrieve all details in the db
app.get('/api/allEntries', async (req, res, next) => {
    try{
        await client.connect();
        const collection = client.db('eleads').collection('allUsersDetails');
        console.log('eleads media db connected for retrieval tx');
        const getTx = await collection.find({}).toArray();
        res.status(200).send(getTx);
    }catch(error){
        console.log(`elayo says retrieval error: ${error}`);
    }finally{
        await client.close();
        console.log('eleads media db connection closed after retrieval tx');
    }
})

app.listen(port, () => {
    console.log(`server is live and listening on public port ${port}`);
});
