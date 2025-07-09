import { google } from 'googleapis';
import config from '../config.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Readable } from 'stream';

const { google_drive_client_id, google_drive_client_secret, google_drive_redirect_uri, google_drive_refresh_token } = config;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const oauth2Client = new google.auth.OAuth2(
    google_drive_client_id,
    google_drive_client_secret,
    google_drive_redirect_uri
);

oauth2Client.setCredentials({ refresh_token: google_drive_refresh_token });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const ROOT_FOLDER_NAME = 'Embroidery_Designs';

export const checkGoogleDriveConfig = () => {
    const requiredConfigs = [
        google_drive_client_id,
        google_drive_client_secret,
        google_drive_redirect_uri,
        google_drive_refresh_token
    ];

    const isConfigured = requiredConfigs.every(config => config && config.trim() !== '');

    return {
        isConfigured,
        missing: requiredConfigs.map((config, index) => {
            const names = ['client_id', 'client_secret', 'redirect_uri', 'refresh_token'];
            return !config || config.trim() === '' ? names[index] : null;
        }).filter(Boolean)
    };
};

export const createFolder = async (folderName, parentFolderId = null) => {
    try {
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        if (parentFolderId) {
            folderMetadata.parents = [parentFolderId];
        }

        const response = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id, name',
        });

        return {
            success: true,
            folderId: response.data.id,
            folderName: response.data.name
        };
    } catch (error) {
        console.error('Error creating folder:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const findFolder = async (folderName, parentFolderId = null) => {
    try {
        let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        
        if (parentFolderId) {
            query += ` and '${parentFolderId}' in parents`;
        }

        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
        });

        if (response.data.files.length > 0) {
            return {
                success: true,
                found: true,
                folderId: response.data.files[0].id,
                folderName: response.data.files[0].name
            };
        } else {
            return {
                success: true,
                found: false,
                folderId: null,
                folderName: null
            };
        }
    } catch (error) {
        console.error('Error searching for folder:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const getOrCreateFolder = async (folderName, parentFolderId = null) => {
    try {
        const findResult = await findFolder(folderName, parentFolderId);
        
        if (!findResult.success) {
            return findResult;
        }

        if (findResult.found) {
            return {
                success: true,
                folderId: findResult.folderId,
                folderName: findResult.folderName,
                created: false
            };
        } else {
            const createResult = await createFolder(folderName, parentFolderId);
            
            if (createResult.success) {
                return {
                    success: true,
                    folderId: createResult.folderId,
                    folderName: createResult.folderName,
                    created: true
                };
            } else {
                return createResult;
            }
        }
    } catch (error) {
        console.error('Error in getOrCreateFolder:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const uploadFileToFolder = async (fileData, folderId) => {
    try {
        const { buffer, fileName, mimeType } = fileData;

        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        const media = {
            mimeType: mimeType,
            body: stream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink',
        });

        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return {
            success: true,
            fileId: response.data.id,
            fileName: response.data.name,
            webViewLink: response.data.webViewLink,
            downloadUrl: `https://drive.google.com/uc?id=${response.data.id}&export=download`
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const uploadLocalFilesToGoogleDrive = async (filePaths, productName, machineType) => {
    try {
        const configCheck = checkGoogleDriveConfig();
        if (!configCheck.isConfigured) {
            return {
                success: false,
                isConfigurationError: true,
                error: `Google Drive not configured. Missing: ${configCheck.missing.join(', ')}`
            };
        }

        const cleanProductName = productName.replace(/[^a-zA-Z0-9]/g, '_');
        const cleanMachineType = machineType.replace(/[^a-zA-Z0-9]/g, '_');

        const rootFolderResult = await getOrCreateFolder(ROOT_FOLDER_NAME);
        if (!rootFolderResult.success) {
            return {
                success: false,
                error: `Failed to create root folder: ${rootFolderResult.error}`
            };
        }

        const productFolderResult = await getOrCreateFolder(cleanProductName, rootFolderResult.folderId);
        if (!productFolderResult.success) {
            return {
                success: false,
                error: `Failed to create product folder: ${productFolderResult.error}`
            };
        }

        const machineTypeFolderResult = await getOrCreateFolder(cleanMachineType, productFolderResult.folderId);
        if (!machineTypeFolderResult.success) {
            return {
                success: false,
                error: `Failed to create machine type folder: ${machineTypeFolderResult.error}`
            };
        }

        const uploadResults = {};
        
        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];
            
            try {
                if (!fs.existsSync(filePath)) {
                    uploadResults[`file_${i + 1}`] = {
                        success: false,
                        error: `File not found: ${filePath}`
                    };
                    continue;
                }

                const fileBuffer = fs.readFileSync(filePath);
                const fileName = path.basename(filePath);
                const mimeType = getMimeType(fileName);

                const fileData = {
                    buffer: fileBuffer,
                    fileName: fileName,
                    mimeType: mimeType
                };

                const uploadResult = await uploadFileToFolder(fileData, machineTypeFolderResult.folderId);
                uploadResults[`file_${i + 1}`] = uploadResult;

            } catch (error) {
                uploadResults[`file_${i + 1}`] = {
                    success: false,
                    error: error.message
                };
            }
        }

        return {
            success: true,
            uploadResults: uploadResults,
            folderStructure: {
                rootFolder: { id: rootFolderResult.folderId, name: ROOT_FOLDER_NAME },
                productFolder: { id: productFolderResult.folderId, name: cleanProductName },
                machineTypeFolder: { id: machineTypeFolderResult.folderId, name: cleanMachineType }
            }
        };

    } catch (error) {
        console.error('Error uploading local files to Google Drive:', error);
        return {
            success: false,
            error: error.message
        };
    }
};


export const uploadDesignFilesToGoogleDrive = async (filesData, productName, selectedFormat = null) => {
    try {
        const configCheck = checkGoogleDriveConfig();
        if (!configCheck.isConfigured) {
            return {
                success: false,
                isConfigurationError: true,
                error: `Google Drive not configured. Missing: ${configCheck.missing.join(', ')}`
            };
        }

        const cleanProductName = productName.replace(/[^a-zA-Z0-9]/g, '_');

        const rootFolderResult = await getOrCreateFolder(ROOT_FOLDER_NAME);
        if (!rootFolderResult.success) {
            return {
                success: false,
                error: `Failed to create root folder: ${rootFolderResult.error}`
            };
        }

        const productFolderResult = await getOrCreateFolder(cleanProductName, rootFolderResult.folderId);
        if (!productFolderResult.success) {
            return {
                success: false,
                error: `Failed to create product folder: ${productFolderResult.error}`
            };
        }

        const machineType = selectedFormat || 'general';
        const cleanMachineType = machineType.replace(/[^a-zA-Z0-9]/g, '_');
        
        const machineTypeFolderResult = await getOrCreateFolder(cleanMachineType, productFolderResult.folderId);
        if (!machineTypeFolderResult.success) {
            return {
                success: false,
                error: `Failed to create machine type folder: ${machineTypeFolderResult.error}`
            };
        }

        const uploadResults = {};
        
        for (const [fileKey, fileData] of Object.entries(filesData)) {
            try {
                const uploadResult = await uploadFileToFolder(fileData, machineTypeFolderResult.folderId);
                uploadResults[fileKey] = uploadResult;
            } catch (error) {
                uploadResults[fileKey] = {
                    success: false,
                    error: error.message
                };
            }
        }

        return {
            success: true,
            uploadResults: uploadResults,
            folderStructure: {
                rootFolder: { id: rootFolderResult.folderId, name: ROOT_FOLDER_NAME },
                productFolder: { id: productFolderResult.folderId, name: cleanProductName },
                machineTypeFolder: { id: machineTypeFolderResult.folderId, name: cleanMachineType }
            }
        };

    } catch (error) {
        console.error('Error uploading design files to Google Drive:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const deleteFileFromGoogleDrive = async (fileId) => {
    try {
        console.log(`Attempting to delete file from Google Drive: ${fileId}`);
        
        const result = await drive.files.delete({
            fileId: fileId,
        });

        console.log(`Successfully deleted file ${fileId} from Google Drive`);
        return {
            success: true,
            message: 'File deleted successfully',
            fileId: fileId
        };
    } catch (error) {
        console.error(`Error deleting file ${fileId} from Google Drive:`, error);
        
        // If file doesn't exist (404), consider it a success since the goal is achieved
        if (error.code === 404 || error.message.includes('File not found')) {
            console.log(`File ${fileId} not found in Google Drive (already deleted or doesn't exist)`);
            return {
                success: true,
                message: 'File not found (already deleted)',
                fileId: fileId
            };
        }
        
        return {
            success: false,
            error: error.message,
            fileId: fileId,
            code: error.code
        };
    }
};

export const deleteFolderFromGoogleDrive = async (folderId) => {
    try {
        console.log(`Attempting to delete folder from Google Drive: ${folderId}`);
        
        const folderInfo = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, mimeType'
        });
        
        console.log(`Found folder: ${folderInfo.data.name}`);
        
        const files = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType)'
        });
        
        for (const file of files.data.files) {
            try {
                await drive.files.delete({ fileId: file.id });
                console.log(`Deleted file: ${file.name} (${file.id})`);
            } catch (error) {
                console.error(`Error deleting file ${file.name}:`, error);
            }
        }
        
        await drive.files.delete({ fileId: folderId });
        
        console.log(`Successfully deleted folder ${folderInfo.data.name} (${folderId})`);
        return {
            success: true,
            message: 'Folder deleted successfully',
            folderId: folderId,
            folderName: folderInfo.data.name,
            deletedFiles: files.data.files.length
        };
    } catch (error) {
        console.error(`Error deleting folder ${folderId} from Google Drive:`, error);
        
        if (error.code === 404 || error.message.includes('File not found')) {
            console.log(`Folder ${folderId} not found in Google Drive (already deleted or doesn't exist)`);
            return {
                success: true,
                message: 'Folder not found (already deleted)',
                folderId: folderId
            };
        }
        
        return {
            success: false,
            error: error.message,
            folderId: folderId,
            code: error.code
        };
    }
};

export const getFileInfo = async (fileId) => {
    try {
        const response = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime'
        });

        return {
            success: true,
            fileInfo: response.data
        };
    } catch (error) {
        console.error('Error getting file info:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const findFolderByName = async (folderName, parentFolderId = null) => {
    try {
        let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        
        if (parentFolderId) {
            query += ` and '${parentFolderId}' in parents`;
        }
        
        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)'
        });
        
        if (response.data.files && response.data.files.length > 0) {
            return {
                success: true,
                folder: response.data.files[0]
            };
        }
        
        return {
            success: false,
            message: 'Folder not found'
        };
    } catch (error) {
        console.error('Error finding folder:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const checkFolderEmpty = async (folderId) => {
    try {
        const files = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id)'
        });
        
        return {
            success: true,
            isEmpty: files.data.files.length === 0,
            fileCount: files.data.files.length
        };
    } catch (error) {
        console.error('Error checking folder contents:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const getMimeType = (fileName) => {
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes = {
        '.dst': 'application/octet-stream',
        '.pes': 'application/octet-stream',
        '.jef': 'application/octet-stream',
        '.exp': 'application/octet-stream',
        '.vp3': 'application/octet-stream',
        '.hus': 'application/octet-stream',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
};

export const downloadFileAsBuffer = async (fileId) => {
    try {
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, {
            responseType: 'stream'
        });

        // Get file info for filename
        const fileInfo = await drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType, size'
        });

        return new Promise((resolve, reject) => {
            const chunks = [];
            response.data.on('data', chunk => chunks.push(chunk));
            response.data.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({
                    success: true,
                    buffer: buffer,
                    filename: fileInfo.data.name,
                    mimeType: fileInfo.data.mimeType,
                    size: fileInfo.data.size
                });
            });
            response.data.on('error', error => {
                reject({
                    success: false,
                    error: error.message
                });
            });
        });
    } catch (error) {
        console.error('Error downloading file from Google Drive:', error);
        return {
            success: false,
            error: error.message
        };
    }
};