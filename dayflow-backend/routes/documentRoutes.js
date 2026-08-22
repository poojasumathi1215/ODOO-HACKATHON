const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer storage
const uploadDir = path.resolve(process.cwd(), 'uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authMiddleware);

// POST /api/documents - Upload document
router.post('/', upload.single('file'), documentController.uploadDocument);

// GET /api/documents - Get employee documents
router.get('/', documentController.getEmployeeDocuments);
router.get('/:employeeId', documentController.getEmployeeDocuments);

// GET /api/documents/download/:id - Download document safely
router.get('/download/:id', documentController.downloadDocument);

// DELETE /api/documents/:id - Delete document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
