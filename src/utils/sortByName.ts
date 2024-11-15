/**
 * Compares two repository objects by their `nameWithOwner` property in a case-insensitive manner.
 *
 * @param a - The first repository object to compare.
 * @param b - The second repository object to compare.
 * @returns A negative number if `a` should come before `b`, a positive number if `a` should come after `b`, or 0 if they are equal.
 */
export const sortByName = (a: Label, b: Label): number => {
  // Use toUpperCase() to ignore character casing
  const keyA = a.name.toUpperCase()
  const keyB = b.name.toUpperCase()

  let comparison = 0
  if (keyA > keyB) {
    comparison = 1
  } else if (keyA < keyB) {
    comparison = -1
  }
  return comparison
}
