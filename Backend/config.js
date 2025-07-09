import dotenv from 'dotenv';

dotenv.config();

export default{
    mongo_uri: process.env.MONGO_URI,
    port: process.env.PORT || 5000,
    jwt_secret: process.env.JWT_SECRET,
    google_oauth_client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    google_oauth_client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    client_url: process.env.CLIENT_URL,
    server_url: process.env.SERVER_URL,
    google_drive_client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
    google_drive_client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    google_drive_redirect_uri: process.env.GOOGLE_DRIVE_REDIRECT_URI,
    google_drive_refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
};