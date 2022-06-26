import { hash, compare } from 'bcrypt'

/**
 * @name hashPassword
 * @description
 * Hashes password with bcrypt
 * @param {string} password Raw password to be hashed
 * @returns `Promise<string>`
 * **/
export async function hashPassword(password: string): Promise<string> {
  const getHash = await hash(password, Number(process.env.SALT_ROUNDS))

  return getHash
}

/**
 * @name matchPassword
 * @description
 * Compares the hashed password
 * @param {string} password - Raw password to check if it matches the hashed password
 * @returns {Promise<boolean>}
 * **/
export async function matchPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const match = await compare(password, hash)

  return match
}

export const userRoleRegExpString = '^(?:tester|user)$'
