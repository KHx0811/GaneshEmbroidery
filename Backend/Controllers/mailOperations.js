import { google } from 'googleapis';
import config from '../config.js';
import User from '../Models/user.js';
import Order from '../Models/orders.js';
import Product from '../Models/product.js';
import nodemailer from 'nodemailer';
import { downloadFileAsBuffer } from '../Services/googleDriveService.js';

const { gmail_client_id, gmail_client_secret, gmail_refresh_token, gmail_user_email } = config;

const redirect_uri = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(
    gmail_client_id,
    gmail_client_secret,
    redirect_uri
);

oauth2Client.setCredentials({
    refresh_token: gmail_refresh_token
});

const createTransporter = async () => {
  try {
    if (!gmail_client_id || !gmail_client_secret || !gmail_refresh_token || !gmail_user_email) {
      throw new Error('Gmail OAuth2 configuration incomplete. Please check GOOGLE_MAIL_CLIENT_ID, GOOGLE_MAIL_CLIENT_SECRET, GOOGLE_MAIL_REFRESH_TOKEN, and GOOGLE_MAIL_USER_EMAIL environment variables.');
    }

    console.log('Creating Gmail transporter with OAuth2...');
    
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmail_user_email,
        clientId: gmail_client_id,
        clientSecret: gmail_client_secret,
        refreshToken: gmail_refresh_token,
        accessToken: accessToken
      }
    });

    await transporter.verify();

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

export const sendPaymentConfirmationEmail = async (orderId, fromEmail = null) => {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.emailSent) {
      return { success: true, messageId: 'already_sent', message: 'Email already sent for this order' };
    }

    const user = await User.findById(order.userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    const dynamicFromEmail = fromEmail || gmail_user_email || 'ganeshembroidery99@gmail.com';

    const productDetails = await Promise.all(
      order.products.map(async (product) => {
        const productInfo = await Product.findById(product.productId).lean();
        return {
          ...product,
          productInfo
        };
      })
    );

    const designFilesAttachments = [];
    for (const product of productDetails) {
      if (product.productInfo) {
        const designFileInfo = getDesignFileInfo(product.productInfo, product.machine_type);
        
        if (designFileInfo) {
          if (Array.isArray(designFileInfo)) {
            for (const fileInfo of designFileInfo) {
              if (fileInfo.googleDriveId) {
                try {
                  const fileBuffer = await downloadFileAsBuffer(fileInfo.googleDriveId);
                  
                  if (fileBuffer.success) {
                    designFilesAttachments.push({
                      filename: fileBuffer.filename || fileInfo.fileName,
                      content: fileBuffer.buffer,
                      contentType: fileBuffer.mimeType
                    });
                  } else {
                    console.error(`Failed to download design file: ${fileBuffer.error}`);
                  }
                } catch (error) {
                  console.error(`Error downloading design file ${fileInfo.fileName}:`, error);
                }
              }
            }
          } 
          else if (designFileInfo.googleDriveId) {
            try {
              const fileBuffer = await downloadFileAsBuffer(designFileInfo.googleDriveId);
              
              if (fileBuffer.success) {
                designFilesAttachments.push({
                  filename: fileBuffer.filename || designFileInfo.fileName,
                  content: fileBuffer.buffer,
                  contentType: fileBuffer.mimeType
                });
              } else {
                console.error(`Failed to download design file: ${fileBuffer.error}`);
              }
            } catch (error) {
              console.error(`Error downloading design file for product ${product.productName}:`, error);
            }
          }
        }
      }
    }

    const emailContent = generatePaymentConfirmationHTML(order, user, productDetails, designFilesAttachments.length > 0);
    
    // Generate subject with unique product names
    const uniqueProductNames = [...new Set(productDetails.map(p => p.productName))];
    const productNames = uniqueProductNames.join(', ');
    const subjectLine = productNames.length > 50 ? 
      `${productNames.substring(0, 50)}... - Payment Confirmed` : 
      `${productNames} - Payment Confirmed`;
    
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `Ganesh Embroidery <${dynamicFromEmail}>`,
      to: user.email,
      subject: subjectLine,
      html: emailContent,
      attachments: designFilesAttachments
    };

    const result = await transporter.sendMail(mailOptions);
    
    await Order.findOneAndUpdate(
      { orderId },
      { 
        emailSent: true,
        emailSentAt: new Date(),
        emailStatus: 'sent',
        status: designFilesAttachments.length > 0 ? 'Mail Sent' : 'Paid'
      }
    );

    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    await Order.findOneAndUpdate(
      { orderId },
      { 
        emailSent: false,
        emailStatus: 'failed',
        emailError: error.message
      }
    );

    throw error;
  }
};

export const sendDesignFilesEmail = async (orderId, designFiles, fromEmail = null) => {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      throw new Error('Order not found');
    }

    const user = await User.findById(order.userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    const dynamicFromEmail = fromEmail || gmail_user_email || 'ganeshembroidery99@gmail.com';

    const productDetails = await Promise.all(
      order.products.map(async (product) => {
        const productInfo = await Product.findById(product.productId).lean();
        return {
          ...product,
          productInfo
        };
      })
    );

    const emailContent = generateDesignFilesHTML(order, user, productDetails, designFiles);
    
    // Generate subject with unique product names
    const uniqueProductNames = [...new Set(productDetails.map(p => p.productName))];
    const productNames = uniqueProductNames.join(', ');
    const subjectLine = productNames.length > 50 ? 
      `${productNames.substring(0, 50)}... - Design Files Ready` : 
      `${productNames} - Design Files Ready`;
    
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `Ganesh Embroidery <${dynamicFromEmail}>`,
      to: user.email,
      subject: subjectLine,
      html: emailContent,
      attachments: designFiles.map(file => ({
        filename: file.filename,
        path: file.path || file.url,
        cid: file.filename
      }))
    };

    const result = await transporter.sendMail(mailOptions);
    
    await Order.findOneAndUpdate(
      { orderId },
      { 
        status: 'Mail Sent',
        designFilesEmailSent: true,
        designFilesEmailSentAt: new Date()
      }
    );

    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending design files email:', error);
    throw error;
  }
};

const generatePaymentConfirmationHTML = (order, user, productDetails, hasAttachments = false) => {
  const uniqueProductNames = [...new Set(productDetails.map(p => p.productName))];
  const productNames = uniqueProductNames.join(', ');
  const mainProductName = uniqueProductNames.length === 1 ? uniqueProductNames[0] : 
    `${uniqueProductNames[0]} ${uniqueProductNames.length > 1 ? `and ${uniqueProductNames.length - 1} other design${uniqueProductNames.length > 2 ? 's' : ''}` : ''}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation - ${mainProductName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
        .header { background: linear-gradient(135deg, #D8B46A, #E6C77A); color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { padding: 20px 0; }
        .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .product-item { border-bottom: 1px solid #eee; padding: 15px 0; }
        .product-item:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #4caf50; text-align: right; margin-top: 15px; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .product-highlight { background: linear-gradient(135deg, #e8f5e8, #f1f8e9); padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #4caf50; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Confirmed!</h1>
          <h2 style="margin: 10px 0; font-size: 22px;">${mainProductName}</h2>
          <p>Thank you for your purchase, ${user.username}!</p>
        </div>
        
        <div class="content">
          <div class="product-highlight">
            <h3 style="color: #2e7d32; margin-top: 0;">✅ Your Design${uniqueProductNames.length > 1 ? 's' : ''} Confirmed</h3>
            <p style="color: #2e7d32; font-size: 16px; margin: 5px 0;">
              <strong>${productNames}</strong>
            </p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">
              Reference: Order #${order.orderId}
            </p>
          </div>
          
          <p>Your payment has been successfully processed. Here are your design details:</p>
          
          <div class="order-details">
            <h3>Design Information</h3>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <p><strong>Payment Status:</strong> <span style="color: #4caf50;">✅ Paid</span></p>
          </div>

          <div class="order-details">
            <h3>Your Design${uniqueProductNames.length > 1 ? 's' : ''}</h3>
            ${productDetails.map(product => `
              <div class="product-item">
                <h4 style="color: #2e7d32;">🎨 ${product.productName}</h4>
                <p><strong>Machine Type:</strong> ${product.machine_type}</p>
                <p><strong>Category:</strong> ${product.productInfo?.category || 'N/A'}</p>
                <p><strong>Quantity:</strong> ${product.quantity}</p>
                <p><strong>Price:</strong> ₹${product.price}</p>
              </div>
            `).join('')}
            
            <div class="total">
              Total Amount: ₹${order.totalAmount}
            </div>
          </div>

          ${hasAttachments ? `
          <div class="order-details">
            <h3>📎 Your Design Files Are Attached!</h3>
            <p style="color: #4caf50; font-weight: bold;">Your embroidery design files for "${productNames}" are attached to this email!</p>
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <h4 style="color: #ff9800; margin-top: 0;">📋 How to Use Your Design Files</h4>
              <ol style="color: #f57c00;">
                <li>Download all attached files to your computer</li>
                <li>Transfer the files to your embroidery machine via USB or memory card</li>
                <li>Load the design in your machine's embroidery software</li>
                <li>Start embroidering your beautiful "${mainProductName}" design!</li>
              </ol>
            </div>
          </div>
          ` : ''}

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #4caf50; margin-top: 0;">What's Next for Your "${mainProductName}" Design?</h4>
            ${hasAttachments ? `
            <ul style="color: #2e7d32;">
              <li>✅ Your "${productNames}" design files are attached to this email</li>
              <li>Download the attached files to your computer</li>
              <li>Transfer the files to your embroidery machine via USB or memory card</li>
              <li>Load the design and start embroidering!</li>
              <li>Keep backup copies of your design files</li>
            </ul>
            ` : `
            <ul style="color: #2e7d32;">
              <li>Your "${productNames}" design is now being processed</li>
              <li>Our team will prepare your embroidery design files</li>
              <li>You'll receive your "${mainProductName}" design files via email within 24-48 hours</li>
              <li>Files will be in the machine format you selected</li>
            </ul>
            `}
          </div>

          <p>If you have any questions about your "${mainProductName}" design, please contact our support team.</p>
        </div>

        <div class="footer">
          <p>Thank you for choosing Ganesh Embroidery!</p>
          <p>© 2025 Ganesh Embroidery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateDesignFilesHTML = (order, user, productDetails, designFiles) => {
  const uniqueProductNames = [...new Set(productDetails.map(p => p.productName))];
  const productNames = uniqueProductNames.join(', ');
  const mainProductName = uniqueProductNames.length === 1 ? uniqueProductNames[0] : 
    `${uniqueProductNames[0]} ${uniqueProductNames.length > 1 ? `and ${uniqueProductNames.length - 1} other design${uniqueProductNames.length > 2 ? 's' : ''}` : ''}`;
    
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Design Files Are Ready - ${mainProductName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
        .header { background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { padding: 20px 0; }
        .files-section { background-color: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .file-item { background-color: white; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4caf50; }
        .instructions { background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        .product-highlight { background: linear-gradient(135deg, #e8f5e8, #f1f8e9); padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #4caf50; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Design Files Are Ready!</h1>
          <h2 style="margin: 10px 0; font-size: 22px;">${mainProductName}</h2>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">
            Reference: Order #${order.orderId}
          </p>
        </div>
        
        <div class="content">
          <div class="product-highlight">
            <h3 style="color: #2e7d32; margin-top: 0;">✅ Design Files Ready</h3>
            <p style="color: #2e7d32; font-size: 16px; margin: 5px 0;">
              <strong>${productNames}</strong>
            </p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">
              Your embroidery design files are attached and ready to use!
            </p>
          </div>
          
          <p>Dear ${user.username},</p>
          <p>Great news! Your "${mainProductName}" embroidery design files have been prepared and are attached to this email.</p>

          <div class="files-section">
            <h3>📁 Your Design Files</h3>
            ${designFiles.map(file => `
              <div class="file-item">
                <strong>${file.filename}</strong>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">${file.description || 'Embroidery design file'}</p>
              </div>
            `).join('')}
          </div>

          <div class="instructions">
            <h4 style="color: #ff9800; margin-top: 0;">📋 How to Use Your "${mainProductName}" Design Files</h4>
            <ol style="color: #f57c00;">
              <li>Download all attached files to your computer</li>
              <li>Transfer the files to your embroidery machine via USB or memory card</li>
              <li>Select the appropriate file format for your machine</li>
              <li>Load the "${mainProductName}" design and start embroidering!</li>
            </ol>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #4caf50; margin-top: 0;">💡 Tips for Your "${mainProductName}" Design</h4>
            <ul style="color: #2e7d32;">
              <li>Keep backup copies of your design files</li>
              <li>Test the design on a sample fabric first</li>
              <li>Check your machine's manual for specific file loading instructions</li>
              <li>Contact us if you need help with any file format</li>
            </ul>
          </div>

          <p>We hope you enjoy creating beautiful embroidery with your "${mainProductName}" design!</p>
        </div>

        <div class="footer">
          <p>Happy Embroidering with your "${mainProductName}" design!</p>
          <p>Ganesh Embroidery Team</p>
          <p>© 2025 Ganesh Embroidery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getDesignFileInfo = (product, machineType) => {
  const machineTypeMap = {
    'DST-BERNINA-14x8': 'DST_BERNINA_14x8',
    'DST-BROTHER-V3SE-12x8': 'DST_BROTHER_V3SE_12x8', 
    'DST-FULL': 'DST_FULL',
    'JEF-USHA-450-11x8': 'JEF_USHA_450_11x8',
    'JEF-USHA-550-14x8': 'JEF_USHA_550_14x8',
    'PES-BROTHER-BP3600-14x9.5': 'PES_BROTHER_BP3600_14x9_5',
    
    'DST_BERNINA_14x8': 'DST_BERNINA_14x8',
    'DST_BROTHER_V3SE_12x8': 'DST_BROTHER_V3SE_12x8',
    'DST_FULL': 'DST_FULL',
    'JEF_USHA_450_11x8': 'JEF_USHA_450_11x8',
    'JEF_USHA_550_14x8': 'JEF_USHA_550_14x8',
    'PES_BROTHER_BP3600_14x9_5': 'PES_BROTHER_BP3600_14x9_5'
  };

  const fieldName = machineTypeMap[machineType];
  
  if (!fieldName || !product.design_files || !product.design_files[fieldName]) {
    return null;
  }

  const designFile = product.design_files[fieldName];
  
  if (Array.isArray(designFile.google_drive_id)) {
    return designFile.google_drive_id.map((id, index) => ({
      googleDriveId: id,
      fileName: designFile.file_name[index],
      fileUrl: designFile.file_url[index]
    }));
  }
  
  return {
    googleDriveId: designFile.google_drive_id,
    fileName: designFile.file_name,
    fileUrl: designFile.file_url
  };
};

export const sendTestEmail = async (email, fromEmail = null) => {
  try {
    const dynamicFromEmail = fromEmail || gmail_user_email || 'ganeshembroidery99@gmail.com';
    console.log(`Sending test email from: ${dynamicFromEmail} to: ${email}`);

    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `Ganesh Embroidery <${dynamicFromEmail}>`,
      to: email,
      subject: 'Test Email from Ganesh Embroidery',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify Gmail integration is working.</p>
        <p>From: ${dynamicFromEmail}</p>
        <p>To: ${email}</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

export const testGmailConfig = async () => {
  try {
    console.log('Testing Gmail configuration...');
    
    const requiredVars = { 
      gmail_client_id, 
      gmail_client_secret, 
      gmail_refresh_token, 
      gmail_user_email 
    };
    const missing = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing environment variables: ${missing.join(', ')}`
      };
    }
    
    const transporter = await createTransporter();
    
    return {
      success: true,
      message: 'Gmail OAuth2 configuration is valid',
      userEmail: gmail_user_email
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};