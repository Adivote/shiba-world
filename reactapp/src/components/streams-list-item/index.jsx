import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import ReactTwitchEmbedVideo from 'react-twitch-embed-video'

const useStyles = makeStyles({
  root: {
    width: '50%',
    flexShrink: 1
  }
})

export default ({ twitchUsername }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <LazyLoad>
        <ReactTwitchEmbedVideo
          channel={twitchUsername}
          targetId={`twitch-embed-${twitchUsername}`}
          width="100%"
          layout="video"
        />
      </LazyLoad>
    </div>
  )
}
