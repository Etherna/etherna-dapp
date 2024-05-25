import { BaseError } from "./base-error"

export class FundsMissingError extends BaseError {
  constructor() {
    super({
      title: "Funds missing",
      message: "You need to be signed in and have some funds to access this resource.",
      code: 401,
    })
  }
}
