import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    width: 200,
    margin: '1rem',
    position: 'relative',
    paddingBottom: '2rem'
  },
  media: {
    height: 200
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0
  }
})

function truncateTextAndAddEllipsis(text) {
  return text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

export default function AssetItem({
  asset: { id, title, description, thumbnailUrl }
}) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
          <CardMedia
            className={classes.media}
            image={thumbnailUrl}
            title={`Thumbnail for ${title}`}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {truncateTextAndAddEllipsis(description)}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
      <CardActions className={classes.actions}>
        <Button size="small" color="primary">
          <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>View</Link>
        </Button>
      </CardActions>
    </Card>
  )
}
