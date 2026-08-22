const path = require('path');
const fs = require('fs');
const { db } = require('../database/database');
const { logAudit } = require('../utils/auditLogger');

/**
 * Upload an employee document
 */
function uploadDocument(req, res, next) {
  try {
    const { employeeId, documentName, documentType } = req.body;
    if (!employeeId || !documentName || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, document name, and document type are required.'
      });
    }

    const empId = parseInt(employeeId, 10);
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(empId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Role check: HR or the employee themselves
    if (req.user.role !== 'HR' && (!req.employee || req.employee.id !== empId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot upload documents for other employees.'
      });
    }

    const filePath = req.file ? req.file.path : `uploads/docs/doc_${Date.now()}.pdf`;

    const stmt = db.prepare(`
      INSERT INTO documents (employee_id, document_name, document_type, file_path, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, DATETIME('now'))
    `);
    const resRow = stmt.run(empId, documentName.trim(), documentType, filePath, req.user.id);
    const docId = resRow.lastInsertRowid;

    logAudit(req.user.id, 'DOCUMENT_UPLOAD', 'DOCUMENT', docId, `Uploaded ${documentType} "${documentName}" for employee ID ${empId}`);

    const doc = db.prepare(`
      SELECT d.id, d.employee_id, d.document_name, d.document_type, d.created_at, u.name as uploaded_by_name
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = ?
    `).get(docId);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get documents for an employee
 */
function getEmployeeDocuments(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId || req.query.employeeId, 10);
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required.'
      });
    }

    // Role check: HR or the employee themselves
    if (req.user.role !== 'HR' && (!req.employee || req.employee.id !== employeeId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view these documents.'
      });
    }

    const documents = db.prepare(`
      SELECT d.id, d.employee_id, d.document_name, d.document_type, d.created_at, u.name as uploaded_by_name
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.employee_id = ?
      ORDER BY d.created_at DESC
    `).all(employeeId);

    return res.status(200).json({
      success: true,
      message: 'Documents retrieved',
      data: documents
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Securely stream / download a document
 */
function downloadDocument(req, res, next) {
  try {
    const documentId = parseInt(req.params.id, 10);
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // Role check: HR or the employee themselves
    if (req.user.role !== 'HR' && (!req.employee || req.employee.id !== doc.employee_id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this document.'
      });
    }

    const resolvedPath = path.resolve(process.cwd(), doc.file_path);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server storage.'
      });
    }

    res.download(resolvedPath, doc.document_name);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete document
 */
function deleteDocument(req, res, next) {
  try {
    const documentId = parseInt(req.params.id, 10);
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    if (req.user.role !== 'HR' && doc.uploaded_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only HR or document owner can delete this document.'
      });
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(documentId);

    // Delete file from disk if exists
    const resolvedPath = path.resolve(process.cwd(), doc.file_path);
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }

    logAudit(req.user.id, 'DOCUMENT_DELETE', 'DOCUMENT', documentId, `Deleted document "${doc.document_name}"`);

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDocument,
  getEmployeeDocuments,
  downloadDocument,
  deleteDocument
};
