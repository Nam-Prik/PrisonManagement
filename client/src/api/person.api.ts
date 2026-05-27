import type { CreatePersonDto, Person, UpdatePersonDto } from '../types/dto/person.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getPersons = async (): Promise<Person[]> => {
  const { data } = await http.get<ApiResponse<Person[]>>('/person')
  return data.data
}

export const getPersonById = async (id: number): Promise<Person> => {
  const { data } = await http.get<ApiResponse<Person>>(`/person/${id}`)
  return data.data
}

export const createPerson = async (dto: CreatePersonDto): Promise<Person> => {
  const { data } = await http.post<ApiResponse<Person>>('/person', dto)
  return data.data
}

export const updatePerson = async (id: number, dto: UpdatePersonDto): Promise<Person> => {
  const { data } = await http.put<ApiResponse<Person>>(`/person/${id}`, dto)
  return data.data
}

export const deletePerson = async (id: number): Promise<void> => {
  await http.delete(`/person/${id}`)
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const uploadDocument = async (file: File): Promise<string> => {
  const base64 = await fileToBase64(file)
  const { data } = await http.post<ApiResponse<{ key: string }>>('/person/document/upload', {
    base64,
    filename: file.name,
    contentType: file.type,
  })
  return data.data.key
}
