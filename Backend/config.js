import dotenv from 'dotenv';

dotenv.config();

export default{
    mongo_uri: process.env.MONGO_URI,
    port: process.env.PORT || 5000,
    jwt_secret: process.env.JWT_SECRET,
    session_secret: process.env.SESSION_SECRET,

    google_oauth_client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    google_oauth_client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,

    client_url: process.env.CLIENT_URL,
    server_url: process.env.SERVER_URL,

    google_drive_client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
    google_drive_client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    google_drive_redirect_uri: process.env.GOOGLE_DRIVE_REDIRECT_URI,
    google_drive_refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,

    gmail_client_id: process.env.GOOGLE_MAIL_CLIENT_ID,
    gmail_client_secret: process.env.GOOGLE_MAIL_CLIENT_SECRET,
    gmail_refresh_token: process.env.GOOGLE_MAIL_REFRESH_TOKEN,

    gmail_user_email: process.env.GOOGLE_MAIL_USER_EMAIL,
    gmail_user_password: process.env.GOOGLE_MAIL_USER_PASSWORD,
    
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET,

    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS,
};