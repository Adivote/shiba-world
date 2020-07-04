import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Helmet } from 'react-helmet'
import EditIcon from '@material-ui/icons/Edit'
import ReportIcon from '@material-ui/icons/Report'

import useDatabaseQuery, {
  CollectionNames,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import FormattedDate from '../formatted-date'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
import EndorseAssetButton from '../endorse-asset-button'
import TagChip from '../tag-chip'
import Heading from '../heading'
import Button from '../button'
import AssetThumbnail from '../asset-thumbnail'
import VideoPlayer from '../video-player'
import EndorsementList from '../endorsement-list'
import ApproveBtn from '../approve-asset-button'
import DeleteBtn from '../delete-asset-button'
import PinBtn from '../pin-asset-button'
import ImageGallery from '../image-gallery'

import * as routes from '../../routes'
import speciesMeta from '../../species-meta'
import { trackAction, actions } from '../../analytics'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  canApproveAsset,
  canEditAsset,
  isUrlAnImage,
  isUrlAVideo,
  isUrlNotAnImageOrVideo
} from '../../utils'
import { handleError } from '../../error-handling'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

import NotApprovedMessage from './components/not-approved-message'
import DeletedMessage from './components/deleted-message'
import IsPrivateMessage from './components/is-private-message'
import FileList from './components/file-list'
import ReportMessage from './components/report-message'
import PikapeteyDiscordMessage from './components/pikapetey-discord-message'
import ChildrenAssets from './components/children-assets'
import DownloadAssetButton from '../download-asset-button'
import VisitSourceButton from '../visit-source-button'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },

  cols: {
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForTabletsOrBelow]: {
      flexDirection: 'column'
    }
  },

  leftCol: {
    flex: 1
  },

  rightCol: {
    flexShrink: 0,
    marginLeft: '5%',

    [mediaQueryForTabletsOrBelow]: {
      margin: 0
    }
  },

  thumbAndTitle: {
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForTabletsOrBelow]: {
      flexDirection: 'column'
    }
  },

  titlesWrapper: {
    paddingLeft: '1rem',
    display: 'flex',
    alignItems: 'center'
  },

  thumbnailWrapper: {
    flexShrink: 0,
    width: '200px',

    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },

  thumbnail: {
    width: '100%',
    height: 'auto'
  },

  categoryMeta: {
    fontSize: '125%',
    marginBottom: '1rem'
  },

  // thumbnailAndControls: {
  //   display: 'flex',
  //   flexWrap: 'wrap'
  // },
  // thumbnailWrapper: {
  //   textAlign: 'center',
  //   '@media (max-width: 959px)': {
  //     flex: 1,
  //     marginBottom: '0.5rem'
  //   }
  // },
  subtitle: {
    marginTop: '0.5rem'
  },
  description: {
    margin: '2rem 0 1rem',
    '& A': { textDecoration: 'underline' }
  },
  downloadButton: {
    '& a': {
      color: 'inherit'
    }
  },
  // controls: {
  //   flex: 1,
  //   textAlign: 'right',
  //   '@media (max-width: 959px)': {
  //     textAlign: 'center'
  //   }
  // },
  // controlBtn: {
  //   marginLeft: '0.5rem'
  // },
  isAdultMsg: {
    fontSize: '33.3%'
  },
  createdByInTitle: {
    fontSize: '50%',

    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      display: 'block',
      marginTop: '0.5rem'
    }
  },
  control: {
    marginBottom: '0.5rem'
  },
  mobilePrimaryBtn: {
    display: 'none',

    [mediaQueryForTabletsOrBelow]: {
      display: 'block',
      marginTop: '1rem'
    }
  },
  noDownloadsMsg: {
    marginTop: '0.25rem',
    opacity: '0.5',
    display: 'block',
    textAlign: 'center'
  }
})

const allSpeciesLabel = 'All Species'

function getSpeciesDisplayNameBySpeciesName(speciesName) {
  if (!speciesName) {
    return allSpeciesLabel
  }
  if (!speciesMeta[speciesName]) {
    throw new Error(`Unknown species name ${speciesName}`)
  }
  return speciesMeta[speciesName].name
}

function getCategoryDisplayName(category) {
  return `${category.substr(0, 1).toUpperCase()}${category.substr(1)}`
}

function ReportButton({ assetId, onClick }) {
  const classes = useStyles()

  const onBtnClick = () => {
    onClick()
    trackAction(actions.REPORT_ASSET, {
      assetId
    })
  }

  return (
    <Button
      className={classes.controlBtn}
      color="default"
      icon={<ReportIcon />}
      onClick={onBtnClick}>
      Report
    </Button>
  )
}

function getLabelForNonAuthorName(categoryName) {
  switch (categoryName) {
    case AssetCategories.article:
      return 'posted'
    default:
      return 'uploaded'
  }
}

function CreatedByMessage({ authorName, createdBy, categoryName }) {
  const classes = useStyles()

  return (
    <span className={classes.createdByInTitle}>
      {authorName ? (
        `by ${authorName}`
      ) : (
        <>
          {getLabelForNonAuthorName(categoryName)} by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
            {createdBy.username}
          </Link>
        </>
      )}
    </span>
  )
}

function getIsPikapeteyDiscordSourceUrl(sourceUrl) {
  return sourceUrl && sourceUrl.indexOf('channels/224293432498061313') !== -1
}

function Control({ children }) {
  const classes = useStyles()
  return <div className={classes.control}>{children}</div>
}

function MobilePrimaryBtn({ downloadUrls, sourceUrl, assetId }) {
  const classes = useStyles()

  // TODO: Use media query hook instead of css to show/hide
  return (
    <div className={classes.mobilePrimaryBtn}>
      {downloadUrls.length ? (
        <DownloadAssetButton isLarge={true} />
      ) : sourceUrl ? (
        <>
          <VisitSourceButton
            isLarge={true}
            assetId={assetId}
            sourceUrl={sourceUrl}
            isNoFilesAttached={downloadUrls.length === 0}
          />
          {/* <span className={classes.noDownloadsMsg}>
            (there are no available downloads for this asset)
          </span> */}
        </>
      ) : null}
    </div>
  )
}

export default ({ assetId, small = false }) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [isReportMessageOpen, setIsReportMessageOpen] = useState()

  useEffect(() => {
    if (result && !result.title) {
      handleError(new Error(`Asset with ID ${assetId} does not exist`))
    }
  }, [result ? result.title : null])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (
    isErrored ||
    result === null ||
    (!user && result && result.isApproved === false)
  ) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const {
    id,
    title,
    description,
    category,
    species,
    createdAt,
    createdBy,
    tags,
    fileUrls,
    thumbnailUrl,
    isApproved,
    lastModifiedAt,
    lastModifiedBy,
    sourceUrl,
    videoUrl,
    isDeleted,
    isAdult,
    isPrivate,
    authorName,
    children
  } = result

  if (!title) {
    return (
      <ErrorMessage>Asset does not exist. Maybe it was deleted?</ErrorMessage>
    )
  }

  const downloadUrls = fileUrls
    .filter(isUrlNotAnImageOrVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const imageUrls = fileUrls
    .filter(isUrlAnImage)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const videoUrls = fileUrls
    .filter(isUrlAVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>
          {title} | Uploaded by {createdBy.username} | VRCArena
        </title>
        <meta
          name="description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewAssetWithVar.replace(':assetId', id)
          )}
        />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:site_name" content="VRCArena" />
      </Helmet>
      {isReportMessageOpen && <ReportMessage assetId={id} />}
      {isApproved === false && <NotApprovedMessage />}
      {isDeleted === true && <DeletedMessage />}
      {isPrivate === true && <IsPrivateMessage />}
      {getIsPikapeteyDiscordSourceUrl(sourceUrl) ? (
        <PikapeteyDiscordMessage />
      ) : null}

      <div className={classes.thumbAndTitle}>
        <div className={classes.thumbnailWrapper}>
          <AssetThumbnail url={thumbnailUrl} className={classes.thumbnail} />
        </div>
        <div className={classes.titlesWrapper}>
          <Heading variant="h1">
            <Link to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
              {title}
            </Link>{' '}
            <CreatedByMessage
              authorName={authorName}
              createdBy={createdBy}
              categoryName={category}
            />
          </Heading>
        </div>
      </div>

      <MobilePrimaryBtn
        downloadUrls={downloadUrls}
        sourceUrl={sourceUrl}
        assetId={assetId}
      />

      <div className={classes.cols}>
        <div className={classes.leftCol}>
          {videoUrl && <VideoPlayer url={videoUrl} />}

          <div className={classes.description}>
            <Heading variant="h2">Description</Heading>
            <Markdown source={description} />
          </div>

          {downloadUrls.length ? (
            <>
              <Heading variant="h2">Files</Heading>
              <FileList assetId={id} fileUrls={downloadUrls} />
            </>
          ) : null}

          {videoUrls.length ? (
            <>
              <Heading variant="h2">Videos</Heading>
              <FileList assetId={id} fileUrls={videoUrls} />
            </>
          ) : null}

          {imageUrls.length ? (
            <>
              <Heading variant="h2">Images</Heading>
              <ImageGallery urls={imageUrls} />
            </>
          ) : null}

          {children && children.length ? (
            <>
              <Heading variant="h2">Linked Assets</Heading>
              <ChildrenAssets assetChildren={children} />
            </>
          ) : null}

          <Heading variant="h2">Meta</Heading>
          <div className={classes.categoryMeta}>
            {category && (
              <div>
                {species.length ? (
                  <>
                    <Link
                      to={routes.viewSpeciesWithVar.replace(
                        ':speciesName',
                        species[0]
                      )}>
                      {getSpeciesDisplayNameBySpeciesName(species[0])}
                    </Link>
                    {' - '}
                    <Link
                      to={routes.viewSpeciesCategoryWithVar
                        .replace(':speciesName', species[0])
                        .replace(':categoryName', category)}>
                      {getCategoryDisplayName(category)}
                    </Link>
                  </>
                ) : (
                  <>
                    {allSpeciesLabel} -{' '}
                    <Link
                      to={routes.viewCategoryWithVar.replace(
                        ':categoryName',
                        category
                      )}>
                      {getCategoryDisplayName(category)}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            {tags
              ? tags.map(tagName => <TagChip key={tagName} tagName={tagName} />)
              : '(no tags)'}
          </div>
          <Typography component="p" style={{ margin: '1rem 0' }}>
            Uploaded{' '}
            {createdAt ? <FormattedDate date={createdAt} /> : '(unknown)'} by{' '}
            {createdBy ? (
              <Link
                to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
                {createdBy.username}
              </Link>
            ) : (
              '(unknown)'
            )}
          </Typography>
          {lastModifiedBy && (
            <Typography component="p" style={{ margin: '1rem 0' }}>
              Last modified <FormattedDate date={lastModifiedAt} /> by{' '}
              {lastModifiedBy ? (
                <Link
                  to={routes.viewUserWithVar.replace(
                    ':userId',
                    lastModifiedBy.id
                  )}>
                  {lastModifiedBy.username}
                </Link>
              ) : (
                '(unknown)'
              )}
            </Typography>
          )}
          {isAdult && (
            <Typography component="p" style={{ margin: '1rem 0' }}>
              Marked as NSFW
            </Typography>
          )}
        </div>

        <div className={classes.rightCol}>
          <div className={classes.controls}>
            {sourceUrl && (
              <Control>
                <VisitSourceButton
                  assetId={assetId}
                  sourceUrl={sourceUrl}
                  isNoFilesAttached={downloadUrls.length === 0}
                />
              </Control>
            )}
            {downloadUrls.length ? (
              <Control>
                <DownloadAssetButton assetId={id} url={downloadUrls[0]} />
              </Control>
            ) : null}
            <Control>
              <ReportButton
                assetId={id}
                onClick={() => setIsReportMessageOpen(true)}
              />
            </Control>
            <Control>
              <EndorseAssetButton assetId={id} />
            </Control>

            {canEditAsset(user, createdBy) ? (
              <>
                <Heading variant="h4">Owner Actions</Heading>
                <Control>
                  <Button
                    url={routes.editAssetWithVar.replace(':assetId', assetId)}
                    color="default"
                    icon={<EditIcon />}>
                    Edit Asset
                  </Button>
                </Control>
              </>
            ) : null}
            {canApproveAsset(user) && (
              <Heading variant="h4">Editor Actions</Heading>
            )}
            {canApproveAsset(user) && (
              <Control>
                <ApproveBtn assetId={assetId} />
              </Control>
            )}
            {canApproveAsset(user) && (
              <Control>
                <DeleteBtn assetId={assetId} />
              </Control>
            )}
            {canApproveAsset(user) && (
              <Control>
                <PinBtn assetId={assetId} />
              </Control>
            )}
          </div>
        </div>
      </div>

      <Heading variant="h2">Comments</Heading>
      <CommentList collectionName={CollectionNames.Assets} parentId={assetId} />
      <AddCommentForm
        collectionName={CollectionNames.Assets}
        parentId={assetId}
      />
      <Heading variant="h2">Endorsements</Heading>
      <EndorsementList assetId={assetId} />
    </div>
  )
}
