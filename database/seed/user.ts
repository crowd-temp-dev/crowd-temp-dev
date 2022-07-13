import DB from '..'
import { User } from '../models/User/User'
import { hashPassword } from '../utils'

export default async function seedUser() {
  const password = await hashPassword('Qwerty$2')

  await DB.transaction(async (transaction) => {
    const userLength = await User.count({ transaction })

    if (!userLength) {
      await User.bulkCreate(
        Array.from(
          { length: 10000 },
          (_, i) =>
            ({
              email: `fakeuser${i ? `-${i}` : ''}@unbug.crowd`,
              password,
              firstName: `Fake`,
              lastName: `User${i ? ` ${i}` : ''}`,
              newsUpdate: false,
              role: 'tester',
              session: {},
              confirmed: true,
              confirmedAt: Date.now(),
            } as User)
        ),
        { transaction }
      )
    }
  })
}
