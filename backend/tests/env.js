// Values dotenv-safe requires; tests never read a .env file.
process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "0";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRATION_MINUTES = "15";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskflow-unused";
process.env.MONGO_URI_TESTS = process.env.MONGO_URI_TESTS || "mongodb://127.0.0.1:27017/taskflow-unused";
