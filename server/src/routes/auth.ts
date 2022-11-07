import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import axios from 'axios'

import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/me', { onRequest: [authenticate] }, async request => {
    await request.jwtVerify()

    return { user: request.user }
  })

  fastify.post('/users', async request => {
    const createdUserBody = z.object({
      access_token: z.string()
    })

    const { access_token } = createdUserBody.parse(request.body)

    const { data: userData } = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url()
    })

    const userInfo = userInfoSchema.parse(userData)

    const getOrCreateUser = async () => {
      const foundUser = await prisma.user.findUnique({
        where: {
          googleId: userInfo.id
        }
      })

      if (foundUser) return foundUser

      const createdUser = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture
        }
      })

      return createdUser
    }

    const user = await getOrCreateUser()

    const token = fastify.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl
      },
      {
        sub: user.id,
        expiresIn: '7 days'
      }
    )

    return { token }
  })
}
