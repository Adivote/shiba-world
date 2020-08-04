import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'
import EditIcon from '@material-ui/icons/Edit'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'
import OwnerEditor from '../../components/owner-editor'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  AuthorFieldNames
} from '../../hooks/useDatabaseQuery'
import { createRef, canEditAuthor } from '../../utils'
import { trackAction } from '../../analytics'

function AssetsByAuthorId({ authorId }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [
      AssetFieldNames.author,
      Operators.EQUALS,
      createRef(CollectionNames.Authors, authorId)
    ],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets by author name</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} />
}

const useStyles = makeStyles({
  subtitle: {
    marginTop: '0'
  },
  findMoreAuthorsBtn: {
    marginTop: '3rem',
    textAlign: 'center'
  },
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      width: 'auto',
      height: '1em'
    }
  }
})

function FindMoreAuthorsBtn() {
  const classes = useStyles()

  return (
    <div className={classes.findMoreAuthorsBtn}>
      <Button
        url={routes.authors}
        onClick={() =>
          trackAction('ViewAuthor', 'Click find more authors button')
        }>
        Find More Authors
      </Button>
    </div>
  )
}

const analyticsCategory = 'ViewAuthor'

function showConnectHeading(author) {
  const {
    [AuthorFieldNames.discordServerInviteUrl]: discordServerInviteUrl,
    [AuthorFieldNames.discordUsername]: discordUsername,
    [AuthorFieldNames.websiteUrl]: websiteUrl,
    [AuthorFieldNames.email]: email,
    [AuthorFieldNames.twitterUsername]: twitterUsername,
    [AuthorFieldNames.gumroadUsername]: gumroadUsername
  } = author

  // not sustainable but it works for now
  return (
    discordServerInviteUrl ||
    discordUsername ||
    websiteUrl ||
    email ||
    twitterUsername ||
    gumroadUsername
  )
}

export default ({
  match: {
    params: { authorId }
  }
}) => {
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Authors,
    authorId
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get author</ErrorMessage>
  }

  if (!result) {
    return <ErrorMessage>The author does not exist</ErrorMessage>
  }

  const {
    [AuthorFieldNames.name]: name,
    [AuthorFieldNames.categories]: categories = [],
    [AuthorFieldNames.discordServerInviteUrl]: discordServerInviteUrl,
    [AuthorFieldNames.discordUsername]: discordUsername,
    [AuthorFieldNames.websiteUrl]: websiteUrl,
    [AuthorFieldNames.email]: email,
    [AuthorFieldNames.twitterUsername]: twitterUsername,
    [AuthorFieldNames.gumroadUsername]: gumroadUsername,
    [AuthorFieldNames.ownedBy]: ownedBy
  } = result

  return (
    <>
      <Helmet>
        <title>View assets created by author {name} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the assets that have been uploaded for the author ${name}.`}
        />
      </Helmet>

      <Heading variant="h1">
        <Link to={routes.viewAuthorWithVar.replace(':authorId', authorId)}>
          {name}
        </Link>
      </Heading>

      {ownedBy && (
        <Heading variant="h2" className={classes.subtitle}>
          by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', ownedBy.id)}>
            {ownedBy.username}
          </Link>
        </Heading>
      )}

      {categories.length ? (
        <>
          <Heading variant="h2">Specializing In</Heading>
          {categories.map(categoryName => categoryMeta[categoryName].name)}
        </>
      ) : null}

      {showConnectHeading(result) && <Heading variant="h2">Connect</Heading>}

      {discordUsername && (
        <>
          <span className={classes.icon}>
            <DiscordIcon />
          </span>{' '}
          {discordUsername}
          <br />
          <br />
        </>
      )}

      {websiteUrl && (
        <>
          <Button
            url={websiteUrl}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click view website button',
                authorId
              )
            }
            color="default"
            icon={<LaunchIcon />}>
            Visit Website
          </Button>{' '}
        </>
      )}

      {email && (
        <>
          <Button
            url={`mailto:${email}`}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click send email button',
                authorId
              )
            }
            color="default"
            icon={<LaunchIcon />}>
            Send Email
          </Button>{' '}
        </>
      )}

      {twitterUsername && (
        <>
          <Button
            url={`https://twitter.com/${twitterUsername}`}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click view twitter button',
                authorId
              )
            }
            color="default"
            icon={<LaunchIcon />}>
            Visit Twitter
          </Button>{' '}
        </>
      )}

      {gumroadUsername && (
        <>
          <Button
            url={`https://gumroad.com/${gumroadUsername}`}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click view gumroad button',
                authorId
              )
            }
            color="default"
            icon={<LaunchIcon />}>
            Visit Gumroad
          </Button>{' '}
        </>
      )}

      {discordServerInviteUrl && (
        <>
          <Button
            url={discordServerInviteUrl}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click join discord server button',
                authorId
              )
            }
            color="default"
            icon={<LaunchIcon />}>
            Join Discord Server
          </Button>{' '}
        </>
      )}

      {canEditAuthor(user, result) && (
        <>
          <Button
            url={routes.editAuthorWithVar.replace(':authorId', authorId)}
            icon={<EditIcon />}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click edit author button',
                authorId
              )
            }>
            Edit
          </Button>{' '}
          <OwnerEditor
            collectionName={CollectionNames.Authors}
            id={authorId}
            actionCategory="ViewAuthor"
          />
        </>
      )}
      <Heading variant="h2">Assets</Heading>
      <AssetsByAuthorId authorId={authorId} />
      <FindMoreAuthorsBtn />
    </>
  )
}
