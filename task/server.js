const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.post('/createFile', (req, res) => {
    const folderPath = 'C:\Users\prakash\Desktop\nodejs\folder';

    const currentTimestamp = new Date().toISOString();
    const fileName = `${currentTimestamp}.txt`;
    const filePath = folderPath.concat(fileName);

    res.json({ message: 'File created successfully', fileName });

});

app.get('/getTextFiles', (req, res) => {
    const folderPath = 'C:\Users\prakash\Desktop\nodejs\folder';

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading files' });
        }
        const textFiles = files.filter((file) => path.extname(file) === '.txt');
        res.json({ textFiles });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});