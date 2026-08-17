const mongoose = require('mongoose');

// Guard against ever running the test suite against something that isn't
// clearly a dedicated test database -- deleteMany() below would otherwise
// be able to wipe real data.
if (!/-test$/.test(process.env.MONGO_URI || '')) {
  throw new Error(
    `Refusing to run tests: MONGO_URI ("${process.env.MONGO_URI}") does not look like a test database (expected it to end in "-test").`
  );
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.close();
});
