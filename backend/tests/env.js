// Tests connect to their own in-memory MongoDB, so only the JWT settings matter.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRATION_MINUTES = "15";
