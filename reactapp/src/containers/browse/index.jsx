import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import speciesMeta from '../../species-meta'
import ErrorMessage from '../../components/error-message'
import tags from '../../tags'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'

// function firstLetterUppercase(text) {
//   return `${text.slice(0, 1).toUpperCase()}${text.slice(1)}`
// }

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  }
})

function Title({ tagName }) {
  return (
    <h1>
      {tagName && speciesMeta[tagName]
        ? speciesMeta[tagName].name
        : 'All Assets'}
    </h1>
  )
}

function Description({ tagName }) {
  const classes = useStyles()
  if (!tagName || !speciesMeta[tagName]) {
    return null
  }
  return (
    <Paper className={classes.root}>
      <Markdown>{speciesMeta[tagName].description}</Markdown>
    </Paper>
  )
}

function splitResultsIntoFilesAndTutorials(results) {
  return results.reduce(
    (newObj, asset) => {
      const isTutorial = asset.tags.includes(tags.tutorial)
      return {
        files: isTutorial ? newObj.files : newObj.files.concat(asset),
        tutorials: isTutorial
          ? newObj.tutorials.concat(asset)
          : newObj.tutorials
      }
    },
    { files: [], tutorials: [] }
  )
}

export default ({
  match: {
    params: { tagName }
  }
}) => {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  if (tagName) {
    whereClauses.push([AssetFieldNames.tags, Operators.ARRAY_CONTAINS, tagName])
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses.length ? whereClauses : undefined
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets by tag {tagName}</ErrorMessage>
  }

  const { files, tutorials } = splitResultsIntoFilesAndTutorials(results)

  return (
    <>
      <Title tagName={tagName} />
      <Description tagName={tagName} />
      <h2>Assets</h2>
      {!files.length ? 'No assets found' : <AssetResults assets={files} />}
      <h2>Tutorials</h2>
      {!tutorials.length ? (
        'No tutorials found'
      ) : (
        <AssetResults assets={tutorials} />
      )}
    </>
  )
}
