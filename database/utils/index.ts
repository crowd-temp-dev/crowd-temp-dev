import { hash, compare } from 'bcrypt'
import { alphabets } from '../../utils'

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

export const getTokenValue = () => {
  const randomBoolean = () => {
    return Boolean(Math.round(Math.random()))
  }

  const randomize = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const numbers = Array.from(
    {
      length: 10,
    },
    (_, i) => i
  )

  return Array.from(
    {
      length: 6,
    },
    () => {
      return randomBoolean() ? randomize(alphabets) : randomize(numbers)
    }
  )
    .join('')
    .toUpperCase()
}
