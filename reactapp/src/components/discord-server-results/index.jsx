import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import DiscordServerResultsItem from '../discord-server-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({ discordServers }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {discordServers.map(discordServer => (
        <DiscordServerResultsItem
          key={discordServer.id}
          discordServer={discordServer}
        />
      ))}
    </div>
  )
}
