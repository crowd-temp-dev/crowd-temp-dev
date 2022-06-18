import { User } from '../models/User/User'
import { hashPassword } from '../utils'

export default async function seedUser() {
  const password = await hashPassword('Qwerty$2')

  await User.create({
    email: 'fakeuser@gmail.com',
    password,
    name: 'Fake user',
    newsUpdate: false,
    role: 'tester',
    session: {},
    confirmed: true,
    confirmedAt: Date.now(),
  })
}
