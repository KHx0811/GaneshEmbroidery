import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import config from '../config.js';

const { 
  gmail_client_id, 
  gmail_client_secret, 
  gmail_refresh_token, 
  gmail_user_email,
  smtp_user,
  smtp_pass 
} = config;

const redirect_uri = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(
  gmail_client_id,
  gmail_client_secret,
  redirect_uri
);

oauth2Client.setCredentials({
  refresh_token: gmail_refresh_token
});

const createGmailTransporter = async () => {
  try {
    if (!gmail_client_id || !gmail_client_secret || !gmail_refresh_token || !gmail_user_email) {
      throw new Error('Gmail OAuth2 configuration incomplete');
    }

    
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmail_user_email,
        clientId: gmail_client_id,
        clientSecret: gmail_client_secret,
        refreshToken: gmail_refresh_token,
        accessToken: accessToken.token
      }
    });

    await transporter.verify();
    
    return transporter;
  } catch (error) {
    console.error('❌ Gmail OAuth2 transporter failed:', error.message);
    throw error;
  }
};

const createBrevoTransporter = () => {
  try {
    if (!smtp_user || !smtp_pass) {
      throw new Error('Brevo SMTP configuration incomplete');
    }

    
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: smtp_user,
        pass: smtp_pass
      }
    });

    return transporter;
  } catch (error) {
    console.error('Brevo SMTP transporter failed:', error.message);
    throw error;
  }
};

export const sendEmail = async (mailOptions) => {
  let transporter = null;
  let method = '';

  try {
    try {
      transporter = await createGmailTransporter();
      method = 'Gmail OAuth2';
      
      mailOptions.from = gmail_user_email;
      
    } catch (gmailError) {
      
      transporter = createBrevoTransporter();
      method = 'Brevo SMTP';
      
      mailOptions.from = smtp_user || process.env.SENDER_EMAIL;
    }

    if (!transporter) {
      throw new Error('No email transporter available');
    }


    const result = await transporter.sendMail(mailOptions);
    
    
    return {
      success: true,
      messageId: result.messageId,
      method: method
    };

  } catch (error) {
    console.error(`Email sending failed via ${method}:`, error.message);
    
    if (method === 'Gmail OAuth2') {
      try {
        transporter = createBrevoTransporter();
        mailOptions.from = smtp_user || process.env.SENDER_EMAIL;
        
        const result = await transporter.sendMail(mailOptions);
        
        
        return {
          success: true,
          messageId: result.messageId,
          method: 'Brevo SMTP (fallback)'
        };
      } catch (fallbackError) {
        console.error('Brevo SMTP fallback also failed:', fallbackError.message);
        throw new Error(`All email methods failed. Gmail: ${error.message}, Brevo: ${fallbackError.message}`);
      }
    }
    
    throw error;
  }
};
export default sendEmail;
