import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import * as routes from '../../routes'
import Heading from '../../components/heading'

const useStyles = makeStyles({
  table: {
    width: '100%'
  }
})

function ApproveButton({ assetId }) {
  const [isSaving, didSaveSucceedOrFail, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  const approve = () => {
    save({
      isApproved: true
    })
  }

  if (isSaving) {
    return 'Approving...'
  }

  if (didSaveSucceedOrFail === true) {
    return 'Approved!'
  }

  if (didSaveSucceedOrFail === false) {
    return 'Failed to approve'
  }

  return (
    <Button variant="contained" onClick={approve}>
      Approve
    </Button>
  )
}

function AssetsTable({ assets }) {
  const classes = useStyles()

  return (
    <Paper>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Controls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map(({ id, title, createdBy }) => (
            <TableRow key={id}>
              <TableCell>
                <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
                  {title}
                </Link>
              </TableCell>
              <TableCell>{createdBy.username}</TableCell>
              <TableCell>
                <ApproveButton assetId={id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

function UnapprovedAssets() {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    [[AssetFieldNames.isApproved, Operators.EQUALS, false]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get unapproved assets</ErrorMessage>
  }

  if (!results.length) {
    return 'None found :)'
  }

  return <AssetsTable assets={results} />
}

export default () => {
  const [isLoadingProfile, isErrorLoadingProfile, user] = useUserRecord()

  if (isLoadingProfile) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingProfile) {
    return <ErrorMessage>Failed to load your user profile</ErrorMessage>
  }

  if (!user.isEditor) {
    return <NoPermissionMessage />
  }

  return (
    <div>
      <Heading variant="h1">Unapproved assets</Heading>
      <UnapprovedAssets />
    </div>
  )
}
