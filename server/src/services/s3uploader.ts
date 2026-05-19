import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { MUGSHOT_BUCKET, s3Client } from '../lib/s3.js'

export async function uploadMugshot(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const ext = filename.split('.').pop() || 'jpg'
  const key = `mugshots/${randomUUID()}.${ext}`
  await s3Client.send(
    new PutObjectCommand({
      Bucket: MUGSHOT_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )
  return key
}
