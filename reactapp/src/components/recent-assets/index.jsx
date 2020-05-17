import React from 'react'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../loading-indicator'
import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'

export default () => {
  const [, , user] = useUserRecord()

  const whereClauses = []

  if (user && user.enabledAdultContent !== true) {
    whereClauses.push([AssetFieldNames.isAdult, Operators.EQUALS, false])
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses.length ? whereClauses : undefined,
    5
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get the assets</ErrorMessage>
  }

  return <AssetResults assets={results} />
}
