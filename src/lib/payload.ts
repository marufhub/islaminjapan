import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

/** Shared Payload Local API client for server components and route handlers. */
export const getPayloadClient = (): Promise<Payload> => getPayload({ config })
