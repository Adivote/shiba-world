import React from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import { trackAction, actions } from '../../analytics'
import Button from '../button'
import { handleError } from '../../error-handling'

export default ({ assetId }) => {
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, didSaveSucceedOrFail, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (isLoadingUser || isLoadingAsset || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (
    isErroredLoadingUser ||
    isErroredLoadingAsset ||
    didSaveSucceedOrFail === false
  ) {
    return <Button disabled>Error</Button>
  }

  if (!user) {
    return null
  }

  const { isApproved } = asset

  const onBtnClick = async () => {
    try {
      await save({
        isApproved: !isApproved,
        lastModifiedBy: userDocument,
        lastModifiedAt: new Date()
      })

      trackAction(
        isApproved ? actions.UNAPPROVE_ASSET : actions.APPROVE_ASSET,
        {
          assetId,
          userId: user && user.id
        }
      )
    } catch (err) {
      console.error('Failed to approve or unapprove asset', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isApproved ? 'Unapprove' : 'Approve'}
    </Button>
  )
}
