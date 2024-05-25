interface BaseErrorOptions {
  title: string
  message: string
  code: number
}

export class BaseError extends Error {
  title: string
  code: number

  constructor({ title, message, code }: BaseErrorOptions) {
    super(message)
    this.name = "BaseError"
    this.title = title
    this.code = code
  }
}
