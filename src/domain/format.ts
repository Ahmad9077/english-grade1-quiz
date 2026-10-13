const digits = new Intl.NumberFormat('ar-EG')

export function arabicNumber(value: number): string {
  return digits.format(value)
}
