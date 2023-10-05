export default class Fraction {
  public numerator: number
  public denominator: number

  constructor(fraction: string)
  constructor(numerator: number, denominator: number)

  constructor(numerator: number | string, denominator?: number) {
    if (typeof numerator === "string") {
      const fractionRegex = /^(-?\d+)\/(-?\d+)$/
      if (!fractionRegex.test(numerator)) {
        throw new Error("Invalid fraction")
      }

      const [num, den] = (numerator as string).split("/")
      this.numerator = parseInt(num ?? "0")
      this.denominator = parseInt(den ?? "0")
    } else {
      this.numerator = numerator
      this.denominator = denominator || 1
    }
  }

  static findPeriodDigits(decimal: number) {
    const [num, den] = decimal.toString().split(".")

    if (!num || !den) {
      throw new Error("Invalid decimal")
    }

    const isStringRepeating = (s: string) => (s + s).indexOf(s, 1) < s.length
    const repeatingString = (s: string) => s.slice(0, (s + s).indexOf(s, 1))
    const isRoundedDenominator =
      Array.from(den.slice(0, -1)).every((digit, i, self) => digit === self[0]) &&
      parseInt(den.slice(-1)) === parseInt(den[0]) + 1

    const periodicDenominator = isRoundedDenominator ? den.slice(0, -1) : den

    if (periodicDenominator.length < 3 || !isStringRepeating(periodicDenominator)) {
      return {
        isPeriodic: false,
        repeatingDigits: "",
      }
    }

    const repeatingDigits = repeatingString(periodicDenominator)

    return {
      isPeriodic: true,
      repeatingDigits,
    }
  }

  static fromDecimal(decimal: number) {
    const [num, den] = decimal.toString().split(".")

    if (!num || !den) {
      throw new Error("Invalid decimal")
    }

    const { isPeriodic, repeatingDigits } = Fraction.findPeriodDigits(decimal)

    if (isPeriodic) {
      const multiplier = Math.pow(10, repeatingDigits.length)
      let numerator = parseInt(num + repeatingDigits) // mult by multiplier
      numerator -= parseInt(num) // remove the non-periodic part
      const denominator = multiplier - 1

      return new Fraction(numerator, denominator)
    }

    const denominator = Math.pow(10, den.length)
    const numerator = parseInt(num + den)
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const divisor = gcd(numerator, denominator)

    return new Fraction(numerator / divisor, denominator / divisor)
  }

  static fromString(fraction: string) {
    return new Fraction(fraction)
  }

  static fromNumDen(numerator: number, denominator: number) {
    return new Fraction(numerator, denominator)
  }

  toString() {
    return `${this.numerator}/${this.denominator}`
  }

  valueOf() {
    return this.numerator / this.denominator
  }

  add(fraction: Fraction) {
    return new Fraction(
      this.numerator * fraction.denominator + fraction.numerator * this.denominator,
      this.denominator * fraction.denominator
    )
  }

  aub(fraction: Fraction) {
    return new Fraction(
      this.numerator * fraction.denominator - fraction.numerator * this.denominator,
      this.denominator * fraction.denominator
    )
  }
  mul(fraction: Fraction) {
    return new Fraction(
      this.numerator * fraction.numerator,
      this.denominator * fraction.denominator
    )
  }

  div(fraction: Fraction) {
    return new Fraction(
      this.numerator * fraction.denominator,
      this.denominator * fraction.numerator
    )
  }
}
