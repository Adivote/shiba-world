import React, { lazy, Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import ThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'

import * as routes from './routes'
import { lightTheme, darkTheme } from './themes'
import { UserFieldNames } from './hooks/useDatabaseQuery'

// Do not lazy load these routes as they are very popular so they should load fast
import Home from './containers/home'
import ViewAsset from './containers/view-asset'
import ViewSpecies from './containers/view-species'
import ViewSpeciesCategory from './containers/view-species-category'
import ViewCategory from './containers/view-category'
import ViewAllSpecies from './containers/view-all-species'

import PageHeader from './components/header'
import PageFooter from './components/footer'
import SearchResults from './components/search-results'
import SetupProfile from './components/setup-profile'
import Notices from './components/notices'
import ErrorBoundary from './components/error-boundary'
import LoadingIndicator from './components/loading-indicator'
import UnapprovedAssetsMessage from './components/unapproved-assets-message'
import Polls from './components/polls'

import useUserRecord from './hooks/useUserRecord'
import useSearchTerm from './hooks/useSearchTerm'
import useIsLoggedIn from './hooks/useIsLoggedIn'

// Lazy load these to improve performance (downloading and processing JS)
const Login = lazy(() => import('./containers/login'))
const SignUp = lazy(() => import('./containers/signup'))
const Logout = lazy(() => import('./containers/logout'))
const CreateAsset = lazy(() => import('./containers/create-asset'))
const EditAsset = lazy(() => import('./containers/edit-asset'))
const MyAccount = lazy(() => import('./containers/my-account'))
const Admin = lazy(() => import('./containers/admin'))
const AdminHistory = lazy(() => import('./containers/admin-history'))
const AdminUsers = lazy(() => import('./containers/admin-users'))
const AdminAssets = lazy(() => import('./containers/admin-assets'))
const AdminPolls = lazy(() => import('./containers/admin-polls'))
const PrivacyPolicy = lazy(() => import('./containers/privacy-policy'))
const Contributors = lazy(() => import('./containers/contributors'))
const ErrorContainer = lazy(() => import('./containers/error'))
const News = lazy(() => import('./containers/news'))
const Tags = lazy(() => import('./containers/tags'))
const Search = lazy(() => import('./containers/search'))
const ViewUser = lazy(() => import('./containers/view-user'))
const Stats = lazy(() => import('./containers/stats'))
const Users = lazy(() => import('./containers/users'))
const Activity = lazy(() => import('./containers/activity'))
const Requests = lazy(() => import('./containers/requests'))
const CreateRequest = lazy(() => import('./containers/create-request'))
const ViewRequest = lazy(() => import('./containers/view-request'))
const Streams = lazy(() => import('./containers/streams'))
const About = lazy(() => import('./containers/about'))
const AdultAssets = lazy(() => import('./containers/adult-assets'))
const ViewAuthor = lazy(() => import('./containers/view-author'))

const RouteWithMeta = ({ meta, component: Component, ...routeProps }) => {
  return (
    <Route
      {...routeProps}
      component={props => (
        <>
          {meta && (
            <Helmet>
              <title>{meta.title} | VRCArena</title>
              <meta name="description" content={meta.description} />
            </Helmet>
          )}
          <Component {...props} />
        </>
      )}
    />
  )
}

const MainContent = () => {
  const searchTerm = useSearchTerm()
  const isLoggedIn = useIsLoggedIn()
  const [, , username] = useUserRecord(UserFieldNames.username)

  if (searchTerm) {
    return <SearchResults />
  }

  if (isLoggedIn && !username) {
    return <SetupProfile />
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Switch>
        <Redirect
          // deprecated category
          from={routes.viewCategoryWithVar.replace(':categoryName', 'showcase')}
          to={routes.users}
        />
        <RouteWithMeta
          exact
          path={routes.home}
          component={Home}
          meta={{
            title: 'Browse assets for the species of VRChat',
            description:
              'Download and upload various kinds of assets and tutorials for the different species found in the online multiplayer VR social game VRChat.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.login}
          component={Login}
          meta={{
            title: 'Log in to manage assets',
            description:
              'Use the log in form to log in to your account so that you can manage assets.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.signUp}
          component={SignUp}
          meta={{
            title: 'Create a new account',
            description:
              'Use the form below to create a new account to begin uploading new assets for VRChat species.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.logout}
          component={Logout}
          meta={{
            title: 'Logging you out',
            description:
              'Visit this page to automatically log out of your account.'
          }}
        />
        <Redirect
          from={routes.browseWithVar.replace(':tagName', ':speciesName')}
          to={routes.viewSpeciesWithVar}
        />
        <Redirect from={routes.browseAssets} to={routes.home} />
        <RouteWithMeta
          exact
          path={routes.createAsset}
          component={CreateAsset}
          meta={{
            title: 'Upload a new asset',
            description: 'Create a new asset and upload the files for it.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.viewAssetWithVar}
          component={ViewAsset}
          // TODO: Use list title as page title
          meta={{
            title: 'View a single asset',
            description:
              'An overview of a single asset. Find out what the asset is for, how to use it and where to download it plus more.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.editAssetWithVar}
          component={EditAsset}
          meta={{
            title: 'Edit an asset',
            description:
              'Change the meta data about an asset and upload new files for it.'
          }}
        />
        <RouteWithMeta exact path={routes.admin} component={Admin} />
        <RouteWithMeta exact path={routes.adminUsers} component={AdminUsers} />
        <RouteWithMeta
          exact
          path={routes.adminHistory}
          component={AdminHistory}
        />
        <RouteWithMeta
          exact
          path={routes.adminAssets}
          component={AdminAssets}
        />
        <RouteWithMeta exact path={routes.adminPolls} component={AdminPolls} />
        <RouteWithMeta
          exact
          path={routes.myAccount}
          component={MyAccount}
          meta={{
            title: 'View details about your account',
            description:
              'An overview of your account including a way to change your username and see statistics of your account.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.privacyPolicy}
          component={PrivacyPolicy}
          meta={{
            title: 'Our privacy policy',
            description:
              'View the privacy policy of our website including what we do with your personal data.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.contributors}
          component={Contributors}
          meta={{
            title: 'People that have contributed',
            description: 'Thanks!'
          }}
        />
        <Route exact path={routes.viewSpeciesWithVar} component={ViewSpecies} />
        <Route
          exact
          path={routes.viewSpeciesCategoryWithVar}
          component={ViewSpeciesCategory}
        />
        <Route
          exact
          path={routes.viewCategoryWithVar}
          component={ViewCategory}
        />
        <Route exact path={routes.news} component={News} />
        <Route exact path={routes.tagsWithVar} component={Tags} />
        <Route exact path={routes.searchWithVar} component={Search} />
        <Route exact path={routes.viewAllSpecies} component={ViewAllSpecies} />
        <Route exact path={routes.viewUserWithVar} component={ViewUser} />
        <Route exact path={routes.stats} component={Stats} />
        <Route exact path={routes.users} component={Users} />
        <Route exact path={routes.activity} component={Activity} />
        <Route exact path={routes.requests} component={Requests} />
        <Route exact path={routes.createRequest} component={CreateRequest} />
        <Route exact path={routes.viewRequestWithVar} component={ViewRequest} />
        <Route exact path={routes.streams} component={Streams} />
        <Route exact path={routes.about} component={About} />
        <Route exact path={routes.adultAssets} component={AdultAssets} />
        <Route exact path={routes.viewAuthorWithVar} component={ViewAuthor} />
        <Route
          component={() => (
            <ErrorContainer code={404} message="Page not found" />
          )}
        />
      </Switch>
    </Suspense>
  )
}

export default () => {
  const darkModeEnabled = useSelector(
    ({ app: { darkModeEnabled } }) => darkModeEnabled
  )
  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkModeEnabled ? darkTheme : lightTheme}>
        <CssBaseline />
        <PageHeader />
        <main className="main">
          <Container maxWidth="lg">
            <Notices />
            <Polls />
            <UnapprovedAssetsMessage />
            <MainContent />
          </Container>
        </main>
        <PageFooter />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
