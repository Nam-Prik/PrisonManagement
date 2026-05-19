import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { MUGSHOT_BUCKET, s3Client } from '../lib/s3.js'

export async function getMugshotSignedUrl(key: string): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: MUGSHOT_BUCKET, Key: key }), {
    expiresIn: 3600,
  })
}
