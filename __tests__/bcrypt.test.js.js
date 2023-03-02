const bcrypt = require('../util/bcrypt')

test('Function properly encrpyts passwords | Password: "abc" | After encryption must not be "abc"', async () => {
  password = "abc"
  hashed = await bcrypt.hash(password)
  expect(
    bcrypt.hash(hashed)
    ).not.toBe(password)
})
test('Function properly deciphers hashed passwords | Password: "aaa" | Encrpted "aaa" and normal "aaa" are seen as equal using the comparison function', async () => {
  password = "aaa"
  hashed = await bcrypt.hash("aaa")
  check = await bcrypt.compare(password, hashed)

  expect(check).toBe(true)
})