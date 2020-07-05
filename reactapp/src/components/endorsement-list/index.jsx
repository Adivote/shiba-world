import React from 'react'

import EndorsementListItem from '../endorsement-list-item'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDatabaseQuery, {
  CollectionNames,
  Operators,
  EndorsementFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'

export default ({ assetId }) => {
  if (!assetId) {
    throw new Error('Cannot render endorsement list: no asset ID')
  }

  const [parentDoc] = useDatabaseDocument(CollectionNames.Assets, assetId)
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Endorsements,
    [[EndorsementFieldNames.asset, Operators.EQUALS, parentDoc]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load endorsements</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No endorsements found</NoResultsMessage>
  }

  return (
    <>
      {results.map(result => (
        <EndorsementListItem key={result.id} endorsement={result} />
      ))}
    </>
  )
}
