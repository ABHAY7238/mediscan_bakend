const db = require('../db');
const Tesseract = require('tesseract.js');
const path = require('path');

exports.scanMedicine = async (req, res) => {
  try {
    const imagePath = path.resolve(__dirname, '../uploads', req.file.filename);

    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    const extractedText = text.toLowerCase();

    db.query("SELECT * FROM medicines", (err, results) => {
      if (err) return res.status(500).json({ success: false, error: "DB Error" });

      const matched = results.find(med =>
        extractedText.includes(med.name.toLowerCase()) ||
        extractedText.includes(med.generic_name.toLowerCase())
      );

      if (!matched) return res.json({ success: false });

      res.json({
        success: true,
        medicine: {
          name: matched.name,
          generic_name: matched.generic_name,
          dosage: matched.dosage,
          manufacturer: matched.manufacturer,
          image_url: matched.image_url || "",
          details: {
            uses: matched.uses,
            side_effects: matched.side_effects,
            dosage: matched.dosage_instruction,
            warnings: matched.warnings
          }
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
