import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
import PocketBase from 'pocketbase'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // before
  const pb = new PocketBase(PUBLIC_POCKETBASE_URL)

  pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '')
  if (pb.authStore.isValid) {
    try {
      await pb.collection('users').authRefresh()
    } catch (_) {
      pb.authStore.clear()
    }
  }

  event.locals.pb = pb
  event.locals.user = structuredClone(pb.authStore.model)

  const response = await resolve(event)

  // after
  response.headers.set(
    'set-cookie',
    pb.authStore.exportToCookie({ httpOnly: false })
  )

  return response
}