import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'

import RecentAssets from '../../components/recent-assets'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'

import * as routes from '../../routes'
import speciesMeta from '../../species-meta'
import categoryMeta from '../../category-meta'
import useSearchTerm from '../../hooks/useSearchTerm'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  root: {
    width: 250,
    margin: '0.5rem'
  },
  media: {
    height: 250
  },
  speciesBrowser: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

const Species = ({ name, title, description, imageUrl }) => {
  const classes = useStyles()
  const url = routes.viewSpeciesWithVar.replace(':speciesName', name)

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={url}>
          <CardMedia
            className={classes.media}
            image={imageUrl}
            title={`Thumbnail for ${name}`}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {description}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  )
}

const SpeciesBrowser = () => {
  const classes = useStyles()
  return (
    <div className={classes.speciesBrowser}>
      {Object.entries(speciesMeta).map(
        ([name, { name: title, shortDescription, thumbnailUrl }]) => (
          <Species
            key={name}
            name={name}
            title={title}
            description={shortDescription}
            imageUrl={thumbnailUrl}
          />
        )
      )}
    </div>
  )
}

function RecentAssetDescription({ categoryName }) {
  return <BodyText>{categoryMeta[categoryName].shortDescription}</BodyText>
}

export default () => {
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Heading variant="h2">Species</Heading>
      <BodyText>
        Select a species to browse their assets, tutorials, avatars and news.
      </BodyText>
      <SpeciesBrowser />
      <Heading variant="h2">Recent News</Heading>
      <RecentAssetDescription categoryName={AssetCategories.article} />
      <RecentAssets limit={5} categoryName={AssetCategories.article} />
      <Heading variant="h2">Recent Accessories</Heading>
      <RecentAssetDescription categoryName={AssetCategories.accessory} />
      <RecentAssets limit={5} categoryName={AssetCategories.accessory} />
      <Heading variant="h2">Recent Animations</Heading>
      <RecentAssetDescription categoryName={AssetCategories.animation} />
      <RecentAssets limit={5} categoryName={AssetCategories.animation} />
      <Heading variant="h2">Recent Tutorials</Heading>
      <RecentAssetDescription categoryName={AssetCategories.tutorial} />
      <RecentAssets limit={5} categoryName={AssetCategories.tutorial} />
      <Heading variant="h2">Recent Avatars</Heading>
      <RecentAssetDescription categoryName={AssetCategories.avatar} />
      <RecentAssets limit={5} categoryName={AssetCategories.avatar} />
    </>
  )
}
