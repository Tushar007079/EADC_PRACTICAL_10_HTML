const express = require('express');
const bodyParser = require('body-parser');
const Cloudant = require('@cloudant/cloudant');
const app = express();
const port = process.env.PORT || 7070;

// Cloudant credentials
const url = "https://apikey-v2-26aj3ozdvpr2f1cmuwbxky11mhbiubctlpomomvyprjj:531f952562337579bc0b3ef8cfea14bc@ed643cff-2d52-40c5-b33d-71ad7ff9e885-bluemix.cloudantnosqldb.appdomain.cloud";
const username = "apikey-v2-26aj3ozdvpr2f1cmuwbxky11mhbiubctlpomomvyprjj";
const password = "531f952562337579bc0b3ef8cfea14bc";
const databaseName = "tushar_practical_10";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname));


// Initialize Cloudant
const cloudant = Cloudant({ url: url, username: username, password: password });
const db = cloudant.db.use(databaseName);

// Get user data by ID
app.post('/api/get', (req, res) => {
    const id = req.body.id;
    db.get(id, (err, data) => {
        if (err) {
            res.status(404).send('User not found');
        } else {
            res.send(data);
        }
    }); 
});

// Add New User
app.post('/api/user', (req, res) => {
    const { _id, name, email, phone, city, country, pincode } = req.body;
    db.insert({ _id, name, email, phone, city, country, pincode }, (err, data) => {
        if (err) {
            res.status(500).send('Error adding user');
        } else {
            res.send(data);
        }
    });
});

// Update User Data
app.post('/api/update', (req, res) => {
    const { _id, _rev, name, email, phone, city, country, pincode } = req.body;
    if (!_id || !_rev) {
        res.status(400).send('Bad Request: Missing ID or Revision');
        return;
    }

    db.insert({ _id, _rev, name, email, phone, city, country, pincode }, (err, data) => {
        if (err) {
            res.status(500).send('Error updating user');
        } else {
            res.send(data);
        }
    });
});

// Delete User Data
app.post('/api/delete', (req, res) => {
    const { id, rev } = req.body; 
    if (!id || !rev) {
        res.status(400).send('Bad Request: Missing ID or Revision');
        return;
    }

    db.destroy(id, rev, (err, data) => {
        if (err) {
            console.error(err); // Log the error for debugging purposes
            res.status(500).send('Error deleting user: ' + err.message); // Send detailed error message
        } else {
            res.send(data);
        }
    });
});

// Get All Users Data
app.get('/api/all', (req, res) => {
    db.list({ include_docs: true }, (err, data) => {
        if (err) {
            res.status(500).send('Error fetching users');
        } else {
            const users = data.rows.map(row => row.doc);
            res.send(users);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});