const bcrypt = require('../util/bcrypt')

test('Function properly encrpyts passwords | Password: "aaa" | After encryption must not be "aaa"', () => {
  expect(
    bcrypt.hash("a")
    ).not.toBe("a")
})
test('Function properly deciphers hashed passwords | Password: "aaa" | Encrpted "aaa" and normal "aaa" are seen as equal', async () => {
  password = "aaa"
  hashed = await bcrypt.hash("aaa")
  check = await bcrypt.compare(password, hashed)

  expect(check).toBe(true)
})