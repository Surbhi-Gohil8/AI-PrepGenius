import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdfParse(dataBuffer);
    const text = data.text || '';
    if (!text.trim()) {
      throw new Error('PDF appears to be image-based or contains no extractable text. Please upload a text-based PDF.');
    }
    return text;
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

export const extractTextFromDOCX = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value || '';
  } catch (error: any) {
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
};

export const extractResumeText = async (filePath: string, mimetype: string): Promise<string> => {
  if (mimetype === 'application/pdf' || filePath.endsWith('.pdf')) {
    return extractTextFromPDF(filePath);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    filePath.endsWith('.docx') ||
    filePath.endsWith('.doc')
  ) {
    return extractTextFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported resume file type: ${mimetype}`);
  }
};
