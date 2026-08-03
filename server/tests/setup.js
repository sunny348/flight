// Runs before every test file. Provides the environment the app's modules read
// at import time so nothing calls process.exit or throws while loading:
//   - jwtHelpers exits if JWT secrets are missing
//   - authController initialises firebase-admin from FIREBASE_* vars
//   - the Amadeus client is constructed from AMADEUS_* vars
process.env.NODE_ENV = "test";

const setDefault = (key, value) => {
  if (!process.env[key]) process.env[key] = value;
};

setDefault("JWT_SECRET", "test_jwt_secret_value_please_change");
setDefault("REFRESH_TOKEN_SECRET", "test_refresh_secret_value_please_change");
setDefault("JWT_EXPIRES_IN", "1h");
setDefault("REFRESH_TOKEN_EXPIRES_IN", "7d");
setDefault("JWT_EXPIRES_IN_SECONDS", "3600");
setDefault("REFRESH_TOKEN_EXPIRES_IN_SECONDS", "604800");
setDefault("CORS_ORIGIN", "http://localhost:3000");

// Dummy Amadeus creds so the SDK constructor doesn't throw on import.
setDefault("AMADEUS_CLIENT_ID", "test_amadeus_id");
setDefault("AMADEUS_CLIENT_SECRET", "test_amadeus_secret");

// Dummy Firebase service-account fields so admin.credential.cert() is satisfied.
setDefault("FIREBASE_TYPE", "service_account");
setDefault("FIREBASE_PROJECT_ID", "test-project");
setDefault("FIREBASE_PRIVATE_KEY_ID", "test-key-id");
setDefault("FIREBASE_PRIVATE_KEY", "test-private-key");
setDefault("FIREBASE_CLIENT_EMAIL", "test@test-project.iam.gserviceaccount.com");
setDefault("FIREBASE_CLIENT_ID", "test-client-id");
setDefault("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth");
setDefault("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token");
setDefault(
  "FIREBASE_AUTH_PROVIDER_X509_CERT_URL",
  "https://www.googleapis.com/oauth2/v1/certs"
);
setDefault("FIREBASE_CLIENT_X509_CERT_URL", "https://example.com/cert");
