import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import type { Context } from 'hono'
import type { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto.js'
import { MUGSHOT_BUCKET, s3Client } from '../lib/s3.js'
import type { Person } from '../models/person.model.js'
import { personService } from '../services/person.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

async function uploadDocument(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const ext = filename.split('.').pop() || 'pdf'
  const key = `documents/${randomUUID()}.${ext}`
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

export const personController = {
  async getAll(c: Context) {
    const data = await personService.getAll()
    return c.json<ApiResponse<Person[]>>({ data, message: 'Persons retrieved successfully' })
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const person = await personService.getById(id)
    if (!person) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Person not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Person>>({ data: person, message: 'Person retrieved successfully' })
  },

  async create(c: Context, dto: CreatePersonDto) {
    const person = await personService.create(dto)
    return c.json<ApiResponse<Person>>(
      { data: person, message: 'Person created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdatePersonDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const person = await personService.update(id, dto)
    if (!person) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Person not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Person>>({ data: person, message: 'Person updated successfully' })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const deleted = await personService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Person not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Person deleted successfully' })
  },

  async uploadDocumentFile(c: Context) {
    const body = await c.req.json<{ base64?: string; filename?: string; contentType?: string }>()
    const { base64, filename, contentType } = body
    if (!base64 || !filename || !contentType) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'base64, filename, and contentType are required',
          statusCode: 400,
        },
        400
      )
    }
    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length > 10 * 1024 * 1024) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'File exceeds 10 MB limit', statusCode: 400 },
        400
      )
    }
    const key = await uploadDocument(buffer, filename, contentType)
    return c.json<ApiResponse<{ key: string }>>({ data: { key }, message: 'Document uploaded' })
  },
}
