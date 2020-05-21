import React from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { TwitterFollowButton } from 'react-twitter-embed'
import {
  openMenu as openMenuAction,
  closeMenu as closeMenuAction
} from '../../modules/app'
import { makeStyles } from '@material-ui/core/styles'
import {
  Grid,
  Drawer,
  Button,
  ListItemIcon,
  MenuItem,
  MenuList,
  Typography,
  Divider
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import * as routes from '../../routes'
import Searchbar from '../../components/searchbar'
import useUserRecord from '../../hooks/useUserRecord'

const navItems = [
  {
    label: 'Home',
    url: routes.home
  },
  {
    label: 'Assets',
    url: routes.browseAssets
  },
  {
    label: 'Tutorials',
    url: routes.browseTutorials
  },
  {
    label: 'Upload',
    url: routes.createAsset,
    requiresAuth: true
  },
  {
    label: 'Your Account',
    url: routes.myAccount,
    requiresAuth: true
  },
  {
    label: 'Login',
    url: routes.login,
    requiresNotAuth: true
  },
  {
    label: 'Sign Up',
    url: routes.signUp,
    requiresNotAuth: true
  },
  {
    label: 'Logout',
    url: routes.logout,
    requiresAuth: true
  },
  {
    label: 'Contributors',
    url: routes.contributors
  },
  {
    label: 'Unapproved',
    url: routes.unapproved,
    requiresEditor: true
  }
]

const useStyles = makeStyles({
  header: {
    padding: '1rem 1rem',
    borderBottom: '1px solid #260b36',
    marginBottom: '4rem',
    background: 'linear-gradient(20deg, #6e4a9e, #240b36)',
    '@media (min-width: 600px)': {
      padding: '2rem 2rem'
    }
  },
  gridColSearchbar: {
    '@media (max-width: 959px)': {
      order: '3'
    }
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.2',
    textDecoration: 'none !important',
    color: 'white',
    display: 'block',
    padding: '1rem',
    textTransform: 'uppercase',
    '@media (min-width: 960px)': {
      padding: '1rem 0'
    }
  },
  menuToggleButton: {
    '@media (min-width: 960px)': {
      display: 'none'
    }
  },
  menuToggleIcon: {
    width: '4rem',
    height: '3rem',
    fill: 'white'
  },
  menuList: {
    width: '280px'
  },
  menuListLink: {
    color: 'inherit',
    textDecoration: 'none'
  },
  listItemIcon: {
    color: '#240b36'
  },
  menuItemLink: {
    display: 'block',
    width: '100%',
    height: '100%'
  },
  drawer: {
    '@media (min-width: 960px)': {
      display: 'none'
    }
  },
  desktopMenu: {
    marginTop: '1rem',
    display: 'none',
    '@media (min-width: 960px)': {
      display: 'flex'
    }
  },
  desktopMenuItem: {
    color: '#FFF',
    '& a': {
      padding: '1rem',
      color: 'inherit'
    },
    '&:first-child a': {
      paddingLeft: '0'
    }
  }
})

const NavigationLink = props => {
  const classes = useStyles()
  return <Link {...props} className={classes.menuItemLink} />
}

function canShowMenuItem(menuItem, user) {
  if (menuItem.requiresAuth && !user) {
    return false
  }
  if (menuItem.requiresNotAuth && user) {
    return false
  }
  if (menuItem.requiresEditor && (!user || user.isEditor !== true)) {
    return false
  }
  return true
}

const DrawerContainer = ({ user, isMenuOpen, closeMenu }) => {
  const classes = useStyles()

  return (
    <Drawer
      className={classes.drawer}
      anchor="right"
      open={isMenuOpen}
      onClose={() => closeMenu()}>
      <MenuList className={classes.menuList}>
        <MenuItem>VRC Arena</MenuItem>
      </MenuList>
      <Divider />
      <MenuList className={classes.menuList}>
        {navItems
          .filter(navItem => canShowMenuItem(navItem, user))
          .map(({ label, url }) => (
            <MenuItem button key={url} onClick={() => closeMenu()}>
              <NavigationLink
                className={classes.menuListLink}
                color="primary"
                variant="inherit"
                to={url}>
                <Typography component="div" style={{ display: 'flex' }}>
                  <ListItemIcon className={classes.listItemIcon}>
                    <ChevronRightIcon />
                  </ListItemIcon>
                  {label}
                </Typography>
              </NavigationLink>
            </MenuItem>
          ))}
      </MenuList>
      <TwitterFollowButton screenName="VRCArena" />
    </Drawer>
  )
}

function DesktopMenu({ user }) {
  const classes = useStyles()
  return (
    <div className={classes.desktopMenu}>
      {navItems
        .filter(navItem => canShowMenuItem(navItem, user))
        .map(({ label, url }) => (
          <div className={classes.desktopMenuItem}>
            <Link to={url}>{label}</Link>
          </div>
        ))}
    </div>
  )
}

const PageHeader = ({ isMenuOpen, openMenu, closeMenu }) => {
  const classes = useStyles()
  const [, , user] = useUserRecord()

  return (
    <header className={classes.header}>
      <Grid container>
        <Grid item xs={8} md={4} lg={4} align="left">
          <Link to={routes.home} className={classes.logo}>
            VRC Arena
          </Link>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          lg={4}
          className={classes.gridColSearchbar}
          align="center">
          <Searchbar />
        </Grid>
        <Grid item xs={4} align="right">
          <Button
            className={classes.menuToggleButton}
            onClick={() => openMenu()}>
            <MenuIcon className={classes.menuToggleIcon} />
            <span hidden>Menu</span>
          </Button>
        </Grid>
      </Grid>
      <DrawerContainer
        user={user}
        closeMenu={closeMenu}
        isMenuOpen={isMenuOpen}
      />
      <DesktopMenu user={user} />
    </header>
  )
}

const mapStateToProps = ({ app: { isMenuOpen } }) => ({
  isMenuOpen
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      openMenu: openMenuAction,
      closeMenu: closeMenuAction
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageHeader)
