const User = require("../models/User");

describe("User Model", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("creates valid user", async () => {
    const user = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
      role: "admin",
    });

    expect(user.email).toBe("john@example.com");
  });

  test("rejects duplicate email", async () => {
    await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    await expect(
      User.create({
        name: "Duplicate",
        email: "john@example.com",
        password: "123456",
      })
    ).rejects.toThrow();
  });

  test("rejects invalid role", async () => {
    await expect(
      User.create({
        name: "Wrong Role",
        email: "role@test.com",
        password: "123456",
        role: "superhero",
      })
    ).rejects.toThrow();
  });
});
