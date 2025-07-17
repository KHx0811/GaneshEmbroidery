import Product from "../Models/product.js";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../Services/cloudinaryService.js";
import { uploadDesignFilesToGoogleDrive, deleteFileFromGoogleDrive, uploadLocalFilesToGoogleDrive, deleteFolderFromGoogleDrive, findFolderByName, checkFolderEmpty } from "../Services/googleDriveService.js";

const VALID_CATEGORIES = [
  'Kids', 
  'Bride', 
  'Boat Necks', 
  'One side', 
  'Lines', 
  'Mirrors', 
  'Birds', 
  'Animals', 
  'Manual Idles', 
  'Gods', 
  'Flowers'
];

const validateAndFixDesignFilesStructure = (designFiles) => {
  const defaultDesignFiles = {
    DST_BERNINA_14x8: { file_url: null, google_drive_id: null, file_name: null },
    DST_BROTHER_V3SE_12x8: { file_url: null, google_drive_id: null, file_name: null },
    DST_FULL: { file_url: null, google_drive_id: null, file_name: null },
    JEF_USHA_450_11x8: { file_url: null, google_drive_id: null, file_name: null },
    JEF_USHA_550_14x8: { file_url: null, google_drive_id: null, file_name: null },
    PES_BROTHER_BP3600_14x9_5: { file_url: null, google_drive_id: null, file_name: null }
  };

  if (!designFiles || typeof designFiles !== 'object') {
    return { ...defaultDesignFiles };
  }

  const validatedFiles = { ...defaultDesignFiles };

  Object.keys(defaultDesignFiles).forEach(key => {
    if (designFiles[key] && typeof designFiles[key] === 'object') {
      validatedFiles[key] = {
        file_url: designFiles[key].file_url || null,
        google_drive_id: designFiles[key].google_drive_id || null,
        file_name: designFiles[key].file_name || null
      };
    }
  });

  return validatedFiles;
};

const fixProductDesignFiles = (product) => {
  if (product && product.design_files) {
    product.design_files = validateAndFixDesignFilesStructure(product.design_files);
  }
  return product;
};

export const registerProduct = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        status: "error",
        message: "Access denied. Only admins can register products.",
        data: null
      });
    }

    const { product_name, categories, price, design_type, image, description, selected_format, design_files } = req.body;
    
    console.log('Received registration data:', {
      product_name,
      categories,
      price,
      design_type,
      description,
      selected_format,
      design_files_count: design_files ? design_files.length : 0
    });
    
    if (!product_name || !categories || !Array.isArray(categories) || categories.length === 0 || !price || !design_type || !image) {
      return res.status(400).json({ 
        status: "error",
        message: "All required fields must be provided (product_name, categories (array), price, design_type, image)",
        data: null
      });
    }

    if (!selected_format || !design_files || !Array.isArray(design_files) || design_files.length === 0) {
      return res.status(400).json({ 
        status: "error",
        message: "Selected format and design files are required",
        data: null
      });
    }

    const validCategories = VALID_CATEGORIES;
    
    const cleanCategories = categories.filter(cat => cat && typeof cat === 'string' && cat.trim() !== '');
    
    if (cleanCategories.length === 0) {
      return res.status(400).json({ 
        status: "error",
        message: "At least one valid category is required",
        data: null
      });
    }
    
    const invalidCategories = cleanCategories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      return res.status(400).json({ 
        status: "error",
        message: `Invalid categories: ${invalidCategories.join(', ')}. Must be one or more of: ${validCategories.join(', ')}`,
        data: null
      });
    }

    const validDesignTypes = [
      'DST-BERNINA-14x8', 
      'DST-BROTHER-V3SE-12x8', 
      'DST-FULL', 
      'JEF-USHA-450-11x8', 
      'JEF-USHA-550-14x8', 
      'PES-BROTHER-BP3600-14x9.5'
    ];
    if (!validDesignTypes.includes(design_type)) {
      return res.status(400).json({ 
        status: "error",
        message: "Invalid design type. Must be one of: " + validDesignTypes.join(', '),
        data: null
      });
    }

    if (!validDesignTypes.includes(selected_format)) {
      return res.status(400).json({ 
        status: "error",
        message: "Invalid selected format. Must be one of: " + validDesignTypes.join(', '),
        data: null
      });
    }

    console.log('Uploading image to Cloudinary...');
    const cleanProductName = product_name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const imagePublicId = `embroidery-designs/${cleanProductName}_image`;
    
    const cloudinaryResult = await uploadImageToCloudinary(image, 'embroidery-designs', imagePublicId);
    
    if (!cloudinaryResult.success) {
      return res.status(500).json({ 
        status: "error",
        message: "Failed to upload image to Cloudinary: " + cloudinaryResult.error,
        data: null
      });
    }

    let existingProduct = await Product.findOne({ product_name: product_name.trim() });
    let productDesignFiles = {};

    if (existingProduct) {
      productDesignFiles = validateAndFixDesignFilesStructure(existingProduct.design_files);
      console.log(`Product "${product_name}" exists. Adding format "${selected_format}"...`);
    } else {
      productDesignFiles = validateAndFixDesignFilesStructure(null);
      console.log(`Creating new product "${product_name}" with format "${selected_format}"...`);
    }

    console.log('Processing design files for upload to Google Drive...');
    const processedFiles = {};
    
    for (let i = 0; i < design_files.length; i++) {
      const fileData = design_files[i];
      if (fileData && fileData.data && fileData.data.startsWith('data:')) {
        const base64Data = fileData.data.split(',')[1];
        const fileName = fileData.fileName || `${product_name}_${selected_format}_${i + 1}.${fileData.extension || 'dst'}`;
        
        processedFiles[`${selected_format}_file_${i + 1}`] = {
          buffer: Buffer.from(base64Data, 'base64'),
          fileName: fileName,
          mimeType: fileData.mimeType || 'application/octet-stream',
          format: selected_format
        };
      }
    }

    if (Object.keys(processedFiles).length > 0) {
      const driveResult = await uploadDesignFilesToGoogleDrive(processedFiles, product_name, selected_format);
      
      if (driveResult.success) {
        const dbKey = selected_format.replace(/-/g, '_').replace(/\./g, '_');
        
        if (productDesignFiles.hasOwnProperty(dbKey)) {
          if (existingProduct && productDesignFiles[dbKey] && productDesignFiles[dbKey].google_drive_id) {
            const existingIds = Array.isArray(productDesignFiles[dbKey].google_drive_id) 
              ? productDesignFiles[dbKey].google_drive_id 
              : [productDesignFiles[dbKey].google_drive_id];
            
            console.log(`Cleaning up existing files for ${selected_format}...`);
            for (const fileId of existingIds) {
              if (fileId) {
                try {
                  await deleteFileFromGoogleDrive(fileId);
                  console.log(`Successfully deleted old file: ${fileId}`);
                } catch (error) {
                  console.warn(`Could not delete old file ${fileId}:`, error.message);
                }
              }
            }
          }

          const fileUrls = [];
          const fileIds = [];
          const fileNames = [];
          
          for (const [fileKey, uploadResult] of Object.entries(driveResult.uploadResults)) {
            if (uploadResult.success) {
              fileUrls.push(uploadResult.downloadUrl);
              fileIds.push(uploadResult.fileId);
              fileNames.push(uploadResult.fileName);
              
              if (uploadResult.isReplacement) {
                console.log(`File ${uploadResult.fileName} was replaced successfully`);
              } else {
                console.log(`File ${uploadResult.fileName} was uploaded successfully`);
              }
            }
          }
          
          productDesignFiles[dbKey] = {
            file_url: fileUrls.length === 1 ? fileUrls[0] : fileUrls,
            google_drive_id: fileIds.length === 1 ? fileIds[0] : fileIds,
            file_name: fileNames.length === 1 ? fileNames[0] : fileNames
          };
        } else {
          console.warn(`Database key "${dbKey}" not found in product design files structure`);
        }
      } else {
        if (driveResult.isConfigurationError) {
          console.warn('Google Drive not configured, saving product without file uploads:', driveResult.error);
          
          const dbKey = selected_format.replace(/-/g, '_').replace(/\./g, '_');
          
          if (productDesignFiles.hasOwnProperty(dbKey)) {
            const fileNames = [];
            
            for (const [fileKey, fileData] of Object.entries(processedFiles)) {
              if (fileData && fileData.fileName) {
                fileNames.push(fileData.fileName);
              }
            }
            
            productDesignFiles[dbKey] = {
              file_url: null,
              google_drive_id: null,
              file_name: fileNames.length === 1 ? fileNames[0] : fileNames,
              note: 'Files uploaded but Google Drive integration not configured'
            };
          } else {
            console.warn(`Database key "${dbKey}" not found in product design files structure`);
          }
        } else {
          return res.status(500).json({ 
            status: "error",
            message: "Failed to upload design files to Google Drive: " + driveResult.error,
            data: null
          });
        }
      }
    }

    let savedProduct;

    if (existingProduct) {
      existingProduct.design_files = productDesignFiles;
      existingProduct.categories = cleanCategories;
      existingProduct.updated_at = Date.now();
      savedProduct = await existingProduct.save();
      
      return res.status(200).json({ 
        status: "success",
        message: `Format "${selected_format}" added to existing product successfully`,
        data: {
          product: savedProduct,
          cloudinary: {
            image_url: cloudinaryResult.url,
            public_id: cloudinaryResult.public_id
          },
          action: 'format_added'
        }
      });
    } else {
      const newProduct = new Product({
        product_name,
        categories: cleanCategories,
        price: parseFloat(price),
        design_type,
        image: cloudinaryResult.url,
        cloudinary_image_id: cloudinaryResult.public_id,
        design_files: productDesignFiles,
        description: description || ''
      });

      savedProduct = await newProduct.save();

      return res.status(201).json({ 
        status: "success",
        message: "Product registered successfully",
        data: {
          product: savedProduct,
          cloudinary: {
            image_url: cloudinaryResult.url,
            public_id: cloudinaryResult.public_id
          },
          action: 'new_product'
        }
      });
    }

  } catch (error) {
    console.error("Error registering product:", error);
    
    let errorMessage = "Internal server error";
    let statusCode = 500;
    
    if (error.message?.includes('timeout')) {
      errorMessage = "Upload timeout. Please try with smaller files.";
      statusCode = 408;
    } else if (error.message?.includes('network') || error.message?.includes('ECONNRESET')) {
      errorMessage = "Network error. Please check your connection and try again.";
      statusCode = 503;
    } else if (error.message?.includes('size') || error.message?.includes('large')) {
      errorMessage = "File size too large. Please reduce file sizes and try again.";
      statusCode = 413;
    } else if (error.message?.includes('Google Drive')) {
      errorMessage = "File storage error. Please try again.";
      statusCode = 503;
    } else if (error.message?.includes('Cloudinary')) {
      errorMessage = "Image upload error. Please try again.";
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(statusCode).json({ 
      status: "error",
      message: errorMessage,
      data: null
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, design_type, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (category) {
      query.categories = { $in: [category] };
    }
    
    if (design_type) {
      query.design_type = design_type;
    }
    
    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    return res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      data: {
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_products: total,
          products_per_page: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null
      });
    }
    
    const fixedProduct = fixProductDesignFiles(product);
    
    return res.status(200).json({
      status: "success",
      message: "Product retrieved successfully",
      data: { product: fixedProduct }
    });
    
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Only admins can update products.",
        data: null
      });
    }
    
    const { id } = req.params;
    const { product_name, categories, price, image, description, design_files } = req.body;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null
      });
    }
    
    product.design_files = validateAndFixDesignFilesStructure(product.design_files);
    
    if (product_name) product.product_name = product_name;
    if (categories && Array.isArray(categories)) {
      const validCategories = VALID_CATEGORIES;
      
      const cleanCategories = categories.filter(cat => cat && typeof cat === 'string' && cat.trim() !== '');
      
      if (cleanCategories.length === 0) {
        return res.status(400).json({ 
          status: "error",
          message: "At least one valid category is required",
          data: null
        });
      }
      
      const invalidCategories = cleanCategories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return res.status(400).json({ 
          status: "error",
          message: `Invalid categories: ${invalidCategories.join(', ')}. Must be one or more of: ${validCategories.join(', ')}`,
          data: null
        });
      }
      product.categories = cleanCategories;
    }
    if (price) product.price = parseFloat(price);
    if (description !== undefined) product.description = description; // Allow empty description
    
    if (image && image !== product.image) {
      const cloudinaryResult = await uploadImageToCloudinary(image, 'embroidery-designs');
      
      if (cloudinaryResult.success) {
        if (product.cloudinary_image_id) {
          await deleteImageFromCloudinary(product.cloudinary_image_id);
        }
        
        product.image = cloudinaryResult.url;
        product.cloudinary_image_id = cloudinaryResult.public_id;
      }
    }
    
    if (design_files && typeof design_files === 'object' && Object.keys(design_files).length > 0) {
      const processedFiles = {};
      
      for (const [machineType, fileArray] of Object.entries(design_files)) {
        if (Array.isArray(fileArray) && fileArray.length > 0) {
          const fileData = fileArray[0]; // Take first file for current structure
          if (fileData && fileData.data && fileData.data.startsWith('data:')) {
            const base64Data = fileData.data.split(',')[1];
            processedFiles[machineType] = {
              buffer: Buffer.from(base64Data, 'base64'),
              fileName: fileData.fileName || `${product.product_name}_${machineType}.${fileData.extension || 'dst'}`,
              mimeType: fileData.mimeType || 'application/octet-stream'
            };
          }
        }
      }
      
      if (Object.keys(processedFiles).length > 0) {
        const driveResult = await uploadDesignFilesToGoogleDrive(processedFiles, product.product_name);
        
        if (driveResult.success) {
          for (const [machineType, uploadResult] of Object.entries(driveResult.uploadResults)) {
            if (uploadResult.success) {
              const dbKey = machineType.replace(/-/g, '_').replace(/\./g, '_');
              
              if (product.design_files[dbKey] && product.design_files[dbKey].google_drive_id) {
                try {
                  await deleteFileFromGoogleDrive(product.design_files[dbKey].google_drive_id);
                } catch (error) {
                  console.warn(`Failed to delete old file:`, error.message);
                }
              }
              
              product.design_files[dbKey] = {
                file_url: uploadResult.downloadUrl,
                google_drive_id: uploadResult.fileId,
                file_name: uploadResult.fileName
              };
            }
          }
        }
      }
    }
    
    product.updated_at = Date.now();
    await product.save();
    
    return res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: { product }
    });
    
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Only admins can delete products.",
        data: null
      });
    }
    
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null
      });
    }

    console.log('Deleting product:', product.product_name);
    console.log('Product data structure:', JSON.stringify(product, null, 2));

    if (product.cloudinary_image_id) {
      console.log('Deleting Cloudinary image:', product.cloudinary_image_id);
      try {
        const cloudinaryResult = await deleteImageFromCloudinary(product.cloudinary_image_id);
        console.log('Cloudinary delete result:', cloudinaryResult);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    if (product.design_files && typeof product.design_files === 'object') {
      console.log('Processing design files for deletion...');
      
      const processedMachineTypes = new Set();
      
      for (const [machineType, fileData] of Object.entries(product.design_files)) {
        console.log(`Processing ${machineType}:`, fileData);
        
        if (fileData && typeof fileData === 'object') {
          const googleDriveIds = fileData.google_drive_id;
          
          if (googleDriveIds) {
            if (Array.isArray(googleDriveIds)) {
              console.log(`Deleting ${googleDriveIds.length} files for ${machineType}`);
              for (const fileId of googleDriveIds) {
                try {
                  const driveResult = await deleteFileFromGoogleDrive(fileId);
                  console.log(`Drive delete result for ${fileId}:`, driveResult);
                } catch (error) {
                  console.error(`Error deleting file ${fileId} from Google Drive:`, error);
                }
              }
            } 
            else {
              console.log(`Deleting single file for ${machineType}: ${googleDriveIds}`);
              try {
                const driveResult = await deleteFileFromGoogleDrive(googleDriveIds);
                console.log(`Drive delete result for ${googleDriveIds}:`, driveResult);
              } catch (error) {
                console.error(`Error deleting file ${googleDriveIds} from Google Drive:`, error);
              }
            }
            
            processedMachineTypes.add(machineType);
          } else {
            console.log(`No Google Drive ID found for ${machineType}`);
          }
        }
      }
      
      console.log('Attempting to delete empty folders...');
      
      try {
        const productFolderResult = await findFolderByName(product.product_name);
        
        if (productFolderResult.success) {
          const productFolderId = productFolderResult.folder.id;
          console.log(`Found product folder: ${product.product_name} (${productFolderId})`);
          
          for (const machineType of processedMachineTypes) {
            try {
              const machineTypeFolderResult = await findFolderByName(machineType, productFolderId);
              
              if (machineTypeFolderResult.success) {
                const machineTypeFolderId = machineTypeFolderResult.folder.id;
                console.log(`Found machine type folder: ${machineType} (${machineTypeFolderId})`);
                
                const folderEmptyCheck = await checkFolderEmpty(machineTypeFolderId);
                if (folderEmptyCheck.success && folderEmptyCheck.isEmpty) {
                  const deleteFolderResult = await deleteFolderFromGoogleDrive(machineTypeFolderId);
                  console.log(`Machine type folder deletion result:`, deleteFolderResult);
                } else {
                  console.log(`Machine type folder ${machineType} is not empty, skipping deletion`);
                }
              }
            } catch (error) {
              console.error(`Error handling machine type folder ${machineType}:`, error);
            }
          }
          
          const productFolderEmptyCheck = await checkFolderEmpty(productFolderId);
          if (productFolderEmptyCheck.success && productFolderEmptyCheck.isEmpty) {
            console.log(`Product folder ${product.product_name} is empty, deleting...`);
            const deleteProductFolderResult = await deleteFolderFromGoogleDrive(productFolderId);
            console.log(`Product folder deletion result:`, deleteProductFolderResult);
          } else {
            console.log(`Product folder ${product.product_name} is not empty, keeping it`);
          }
        } else {
          console.log(`Product folder ${product.product_name} not found in Google Drive`);
        }
      } catch (error) {
        console.error('Error during folder cleanup:', error);
      }
    }

    await Product.findByIdAndDelete(id);
    console.log('Product deleted from database successfully');

    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully from database, Cloudinary, and Google Drive",
      data: null
    });
    
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const getProductsBySearch = async (req, res) => {
  try {
    const { search, category, design_type, min_price, max_price, page = 1, limit = 12 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (design_type) {
      query.design_type = design_type;
    }
    
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }
    
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .select('product_name category price design_type image description created_at') // Exclude design files for public search
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    return res.status(200).json({
      status: "success",
      message: "Products found successfully",
      data: {
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_products: total,
          products_per_page: parseInt(limit)
        },
        filters: {
          search: search || null,
          category: category || null,
          design_type: design_type || null,
          price_range: {
            min: min_price ? parseFloat(min_price) : null,
            max: max_price ? parseFloat(max_price) : null
          }
        }
      }
    });
    
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const getProductWithDesignFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null
      });
    }
    
    const fixedProduct = fixProductDesignFiles(product);
    
    if (user) {
      return res.status(200).json({
        status: "success",
        message: "Product retrieved successfully",
        data: { 
          product: fixedProduct,
          has_design_files: Object.values(fixedProduct.design_files).some(file => file && file.file_url),
          user_authenticated: true
        }
      });
    } else {
      const publicProduct = {
        _id: fixedProduct._id,
        product_name: fixedProduct.product_name,
        category: fixedProduct.category,
        price: fixedProduct.price,
        design_type: fixedProduct.design_type,
        image: fixedProduct.image,
        description: fixedProduct.description,
        created_at: fixedProduct.created_at
      };
      
      return res.status(200).json({
        status: "success",
        message: "Product retrieved successfully",
        data: { 
          product: publicProduct,
          has_design_files: Object.values(fixedProduct.design_files).some(file => file && file.file_url),
          user_authenticated: false,
          message: "Login to access design files"
        }
      });
    }
    
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const getValidCategories = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "Valid categories retrieved successfully",
      data: {
        categories: VALID_CATEGORIES
      }
    });
  } catch (error) {
    console.error("Error getting valid categories:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const getProductCategories = async (req, res) => {
  try {
    const categoriesResult = await Product.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories" } },
      { $sort: { _id: 1 } }
    ]);
    
    const categories = categoriesResult.map(item => item._id);
    const designTypes = await Product.distinct('design_type');
    
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" }
        }
      }
    ]);
    
    return res.status(200).json({
      status: "success",
      message: "Product categories retrieved successfully",
      data: {
        categories: categories.sort(),
        design_types: designTypes.sort(),
        price_range: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        total_products: await Product.countDocuments()
      }
    });
    
  } catch (error) {
    console.error("Error getting categories:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find()
      .select('product_name category price design_type image description created_at')
      .sort({ created_at: -1 })
      .limit(parseInt(limit));
    
    return res.status(200).json({
      status: "success",
      message: "Featured products retrieved successfully",
      data: { products }
    });
    
  } catch (error) {
    console.error("Error getting featured products:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

export const deleteMachineType = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Only admins can delete machine types.",
        data: null
      });
    }
    
    const { id, machineType } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null
      });
    }

    console.log(`Deleting machine type ${machineType} from product:`, product.product_name);

    const dbKey = machineType.replace(/-/g, '_').replace(/\./g, '_');
    
    if (!product.design_files || !product.design_files[dbKey]) {
      return res.status(404).json({
        status: "error",
        message: "Machine type not found in product",
        data: null
      });
    }

    const fileData = product.design_files[dbKey];
    
    if (fileData.google_drive_id) {
      const googleDriveIds = fileData.google_drive_id;
      
      if (Array.isArray(googleDriveIds)) {
        console.log(`Deleting ${googleDriveIds.length} files for ${machineType}`);
        for (const fileId of googleDriveIds) {
          try {
            const driveResult = await deleteFileFromGoogleDrive(fileId);
            console.log(`Drive delete result for ${fileId}:`, driveResult);
          } catch (error) {
            console.error(`Error deleting file ${fileId} from Google Drive:`, error);
          }
        }
      } else {
        console.log(`Deleting single file for ${machineType}: ${googleDriveIds}`);
        try {
          const driveResult = await deleteFileFromGoogleDrive(googleDriveIds);
          console.log(`Drive delete result for ${googleDriveIds}:`, driveResult);
        } catch (error) {
          console.error(`Error deleting file ${googleDriveIds} from Google Drive:`, error);
        }
      }
    }

    product.design_files[dbKey] = {
      file_url: null,
      google_drive_id: null,
      file_name: null
    };

    try {
      const productFolderResult = await findFolderByName(product.product_name);
      
      if (productFolderResult.success) {
        const machineTypeFolderResult = await findFolderByName(machineType, productFolderResult.folder.id);
        
        if (machineTypeFolderResult.success) {
          const folderEmptyCheck = await checkFolderEmpty(machineTypeFolderResult.folder.id);
          if (folderEmptyCheck.success && folderEmptyCheck.isEmpty) {
            const deleteFolderResult = await deleteFolderFromGoogleDrive(machineTypeFolderResult.folder.id);
            console.log(`Machine type folder deletion result:`, deleteFolderResult);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting machine type folder:', error);
    }

    await product.save();

    return res.status(200).json({
      status: "success",
      message: `Machine type ${machineType} deleted successfully`,
      data: {
        product: product,
        deletedMachineType: machineType
      }
    });
    
  } catch (error) {
    console.error("Error deleting machine type:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
      data: null
    });
  }
};

