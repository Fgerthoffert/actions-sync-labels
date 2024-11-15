/**
 * Calculates the increment for querying additional records.
 *
 * @param recordsInCollection - The number of records currently in the collection.
 * @param totalCount - The total number of records available.
 * @param maxIncrement - The maximum number of records that can be queried in one increment.
 * @returns The number of records to query in the next increment.
 */
export const calculateQueryIncrement = (
  recordsInCollection: number,
  totalCount: number,
  maxIncrement: number
): number => {
  let queryIncrement = maxIncrement
  if (totalCount === recordsInCollection) {
    queryIncrement = 0
  } else if (totalCount - recordsInCollection <= maxIncrement) {
    queryIncrement = totalCount - recordsInCollection
  }
  return queryIncrement
}
export default calculateQueryIncrement
