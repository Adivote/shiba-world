import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'

import { trackAction, actions } from '../../analytics'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

const useStyles = makeStyles({
  root: {
    marginLeft: '0.5rem'
  }
})

export default ({ assetId, url }) => {
  const classes = useStyles()
  const [assetDocument] = useDatabaseDocument(CollectionNames.Assets, assetId)
  const userId = useFirebaseUserId()
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)
  const [, , saveToDatabase] = useDatabaseSave(CollectionNames.Downloads)

  const onDownloadBtnClick = () => {
    trackAction(actions.DOWNLOAD_ASSET, {
      assetId,
      url
    })

    saveToDatabase({
      asset: assetDocument,
      createdBy: userDocument,
      createdAt: new Date()
    })
  }

  return (
    <Button
      className={classes.root}
      url={url}
      icon={<GetAppIcon />}
      onClick={onDownloadBtnClick}>
      Download
    </Button>
  )
}
