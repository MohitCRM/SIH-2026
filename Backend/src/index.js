require('dotenv').config();
const express = require('express');
const main = require('./config/db');
const applicantRoutes = require('./routes/applicant');
const officerRoutes = require('./routes/officer');
const ministryRoutes = require('./routes/ministry');

const app = express();

app.use(express.json());

app.use('/api/applicant', applicantRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/ministry', ministryRoutes);

const initialiseconnection = async () => {
    try {
        await Promise.all([main()]);
        console.log("DB Connected");
        app.listen(process.env.PORT, () => {
            console.log("Listening at port number : " + process.env.PORT);
        })
    }
    catch (err) {
        console.log("ERROR : " + err.message);
    }
}

initialiseconnection();

