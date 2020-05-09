import React, { useState } from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import withAuthProfile from '../../hocs/withAuthProfile'
import AssetEditor from '../../components/asset-editor'
import withRedirectOnNotAuth from '../../hocs/withRedirectOnNotAuth'
import withEditorsOnly from '../../hocs/withEditorsOnly'

const requiredFields = ['title', 'description', 'thumbnailUrl']

const CreateAsset = ({ auth }) => {
  const [invalidFieldName, setInvalidFieldName] = useState('')
  const [isSaving, isSuccess, save] = useDatabaseSave('assets')
  const userId = auth.uid
  const [userDocument] = useDatabaseDocument('users', userId)

  if (isSaving) {
    return 'Creating...'
  }

  if (isSuccess) {
    return 'Asset created successfully!'
  }

  return (
    <>
      <h1>Create Asset</h1>
      {invalidFieldName && `Field ${invalidFieldName} is invalid!`}
      <AssetEditor
        onSubmit={newFields => {
          for (const fieldName of requiredFields) {
            if (!newFields[fieldName]) {
              setInvalidFieldName(fieldName)
              return
            }
          }

          save({ ...newFields, createdAt: new Date(), createdBy: userDocument })
        }}
      />
    </>
  )
}

export default withRedirectOnNotAuth(
  withEditorsOnly(withAuthProfile(CreateAsset))
)
