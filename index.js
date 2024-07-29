const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('certificate'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { name, date, skill, issuingOrganization } = req.body;

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    // Extracted text from the PDF
    const extractedText = data.text;
    console.log(extractedText);
    // Simulate certificate content parsing
    const certificateData = {
      name: extractedText.includes(name) ? name : null,
      date: extractedText.includes(date) ? date : null,
      skill: extractedText.includes(skill) ? skill : null,
      issuingOrganization: extractedText.includes(issuingOrganization) ? issuingOrganization : null,
    };

    const isValid = certificateData.name === name &&
                    certificateData.date === date &&
                    certificateData.skill === skill &&
                    certificateData.issuingOrganization === issuingOrganization;

    res.send({ isValid, certificateData });
  } catch (error) {
    res.status(500).send('Error reading file.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
