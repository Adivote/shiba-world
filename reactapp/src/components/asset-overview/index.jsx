import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'
import useDatabase from '../../hooks/useDatabase'
import LoadingIcon from '../../components/loading'
import { Grid, List, Typography, Button, Chip, Paper } from '@material-ui/core'
import FormattedDate from '../formatted-date'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
import VotesList from '../votes-list'
import AddVoteForm from '../add-vote-form'
import FeatureListButton from '../feature-list-button'
import * as routes from '../../routes'
import withAuthProfile from '../../hocs/withAuthProfile'

const useCardRowStyles = makeStyles({
  media: {},
  listText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
    padding: '2rem'
  },
  cardImage: {
    maxWidth: '100%',
    height: 'auto'
  },
  cardRanking: {
    fontSize: '1.5rem',
    lineHeight: '1'
  },
  cardRankingValue: {
    fontSize: '3rem'
  },
  reason: {
    margin: '2rem 0',
    fontStyle: 'italic'
  },
  divider: {
    marginTop: 'auto'
  }
})

const CardRow = ({ ranking, imageUrl, cardName, reason }) => {
  const classes = useCardRowStyles()

  return (
    <>
      <Grid container>
        <Grid item xs={6} lg={2} />
        <Grid item xs={6} lg={10} style={{ padding: '1rem' }}>
          <Typography
            className={classes.cardRanking}
            gutterBottom
            component="p">
            <span className={classes.cardRankingValue}>#{ranking}</span>
          </Typography>
          <Typography
            gutterBottom
            component="h2"
            variant="h3"
            style={{ fontSize: '1rem' }}>
            {cardName}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {reason ? (
            <Typography className={classes.reason} component="p" variant="h6">
              {reason}
            </Typography>
          ) : (
            ''
          )}
        </Grid>
      </Grid>
    </>
  )
}

const isUrlAnImage = url =>
  url.indexOf('png') >= 0 || url.indexOf('jpg') >= 0 || url.indexOf('jpeg') >= 0

const FileResultThumbnail = ({ url }) => {
  return <img src={url} height={200} />
}

const getFilenameFromUrl = url =>
  url
    .replace('%2F', '/')
    .split('/')
    .pop()
    .split('?')
    .shift()
    .replace('%20', ' ')

const FileResult = ({ url }) => (
  <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
    {getFilenameFromUrl(url)}
    <br />
    {isUrlAnImage(url) ? (
      <FileResultThumbnail url={url} />
    ) : (
      <Button>
        <a href={url} target="_blank">
          Download
        </a>
      </Button>
    )}
  </Paper>
)

const useSingleListViewStyles = makeStyles({
  media: {}
})

const SingleListView = ({ assetId, auth, small = false }) => {
  const classes = useSingleListViewStyles()

  const [isLoading, isErrored, result] = useDatabase('assets', assetId)

  if (isLoading) {
    return <LoadingIcon />
  }

  if (isErrored || result === null) {
    return 'Error!'
  }

  const {
    title,
    description,
    createdAt,
    createdBy,
    tags,
    fileUrls,
    thumbnailUrl,
    modifiedAt,
    modifiedBy
  } = result

  return (
    <>
      <img src={thumbnailUrl} height={300} />
      <Typography
        variant="h1"
        style={{ fontSize: small ? '1.5rem' : '3rem', marginTop: '2rem' }}>
        <Link to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
          {title}
        </Link>
      </Typography>
      <Typography style={{ margin: '1rem 0' }} component="p">
        <Markdown source={description} />
      </Typography>
      <div>
        {tags
          ? tags.map(label => (
              <Chip
                key={label}
                label={label}
                style={{ marginRight: '0.25rem' }}
              />
            ))
          : '(no tags)'}
      </div>
      <Typography variant="h2" style={{ fontSize: '2rem', margin: '2rem 0' }}>
        Files
      </Typography>
      {fileUrls.map(fileUrl => (
        <FileResult key={fileUrl} url={fileUrl} />
      ))}
      <br />
      <div>
        {small ? (
          <Link to={`/assets/${assetId}`}>
            <Button color="primary">View Asset</Button>
          </Link>
        ) : auth && auth.uid === createdBy.id ? (
          <Link to={`/assets/${assetId}/edit`}>
            <Button color="primary">Edit Asset</Button>
          </Link>
        ) : null}
      </div>
      <Typography component="p" style={{ margin: '1rem 0' }}>
        Created {createdAt ? <FormattedDate date={createdAt} /> : '(unknown)'}{' '}
        by {createdBy ? createdBy.username : '(unknown)'}
      </Typography>
      {modifiedBy && (
        <Typography component="p" style={{ margin: '1rem 0' }}>
          Last modified <FormattedDate date={modifiedAt} /> by{' '}
          {modifiedBy ? modifiedBy.username : '(unknown)'}
        </Typography>
      )}
      {/* {!small && (
        <>
          <FeatureListButton assetId={assetId} />
          <Grid container>
            <Grid item xs={6}>
              <h2>Comments</h2>
              <CommentList assetId={assetId} />
              <h3>Add Comment</h3>
              <AddCommentForm assetId={assetId} />
            </Grid>
            <Grid item xs={6}>
              <h2>Votes</h2>
              <VotesList assetId={assetId} />
              <h3>Add Vote</h3>
              <AddVoteForm assetId={assetId} />
            </Grid>
          </Grid>
        </>
      )} */}
    </>
  )
}

export default withAuthProfile(SingleListView)
