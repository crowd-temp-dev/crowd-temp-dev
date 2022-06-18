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
          { length: 5 },
          (_, i) =>
            ({
              email: `fakeuser${i ? `-${i + 1}` : ''}@gmail.com`,
              password,
              name: `Fake user${i ? ` ${i + 1}` : ''}`,
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
