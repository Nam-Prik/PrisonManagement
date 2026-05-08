type RequestOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, string>
}

interface HttpResponse<T> {
  data: T
  status: number
}

type Body = Record<string, unknown> | unknown[]

class HttpClient {
  constructor(private readonly baseURL: string) {}

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions & { body?: Body } = {}
  ): Promise<HttpResponse<T>> {
    const { params, body, headers, ...rest } = options

    let url = `${this.baseURL}${path}`
    if (params) url += `?${new URLSearchParams(params)}`

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
      ...rest,
    })

    const json = (await response.json()) as T

    if (!response.ok) {
      const message = (json as { message?: string })?.message ?? response.statusText
      throw new Error(message)
    }

    return { data: json, status: response.status }
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>('GET', path, options)
  }

  post<T>(path: string, body?: Body, options?: RequestOptions) {
    return this.request<T>('POST', path, { ...options, body })
  }

  put<T>(path: string, body?: Body, options?: RequestOptions) {
    return this.request<T>('PUT', path, { ...options, body })
  }

  patch<T>(path: string, body?: Body, options?: RequestOptions) {
    return this.request<T>('PATCH', path, { ...options, body })
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>('DELETE', path, options)
  }
}

const http = new HttpClient(import.meta.env.VITE_API_URL ?? '/api')

export default http
