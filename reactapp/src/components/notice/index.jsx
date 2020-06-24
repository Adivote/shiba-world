import React from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { writeStorage } from '@rehooks/local-storage'
import CloseIcon from '@material-ui/icons/Close'
import Markdown from 'react-markdown'
import useStorage, { keys } from '../../hooks/useStorage'
import { trackAction, actions } from '../../analytics'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2, 2),
    marginBottom: '1rem',
    position: 'relative'
  },
  message: {
    marginTop: theme.spacing(1),
    '& p:last-child': {
      marginBottom: 0
    }
  },
  hideBtn: {
    position: 'absolute',
    padding: '0.5rem',
    top: 0,
    right: 0,
    '&:hover': {
      cursor: 'pointer'
    }
  }
}))

export default ({ id, title, message }) => {
  const classes = useStyles()
  const [hiddenNotices] = useStorage(keys.hiddenNotices, [])
  const onHideBtnClick = () => {
    writeStorage(keys.hiddenNotices, hiddenNotices.concat([id]))

    trackAction(actions.HIDE_NOTICE, {
      id
    })
  }

  if (hiddenNotices.includes(id)) {
    return null
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" component="h3">
        {title}
      </Typography>
      <div className={classes.message}>
        <Markdown source={message} />
      </div>
      <div className={classes.hideBtn} onClick={onHideBtnClick}>
        <CloseIcon />
      </div>
    </Paper>
  )
}
