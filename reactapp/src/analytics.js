import { inDevelopment } from './environment'

const categories = {
  ROUTING: 'Routing',
  AUTH: 'Auth',
  ASSETS: 'Assets',
  APP: 'App'
}

export const actions = {
  // APP
  NAVIGATE: 'Navigate',
  OPEN_NAV_MENU: 'OpenNavMenu',
  CLOSE_NAV_MENU: 'CloseNavMenu',

  // AUTH
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  SIGNUP: 'SignUp',
  CHANGE_USERNAME: 'ChangeUsername',

  // SEARCH
  FOCUS_SEARCH: 'FocusSearch',
  CHANGE_SEARCH_TERM: 'ChangeSearchTerm',

  // ASSETS
  COMMENT_ON_ASSET: 'CommentOnAsset',
  DOWNLOAD_ASSET: 'DownloadAsset',
  DOWNLOAD_ASSET_FILE: 'DownloadAssetFile',
  ENDORSE_ASSET: 'EndorseAsset',
  APPROVE_ASSET: 'ApproveAsset',
  DELETE_ASSET: 'DeleteAsset',

  // ACCOUNT
  TOGGLE_ENABLED_ADULT_CONTENT: 'ToggleEnabledAdultContent',

  HIDE_NOTICE: 'HideNotice',
  TOGGLE_DARK_MODE: 'ToggleDarkMode'
}

const actionDetails = {
  // ROUTING

  [actions.NAVIGATE]: {
    category: categories.ROUTING
  },
  [actions.OPEN_NAV_MENU]: {
    category: categories.ROUTING
  },
  [actions.CLOSE_NAV_MENU]: {
    category: categories.ROUTING
  },

  // AUTH

  [actions.LOGIN]: {
    category: categories.AUTH
  },
  [actions.LOGOUT]: {
    category: categories.AUTH
  },
  [actions.SIGNUP]: {
    category: categories.AUTH
  },
  [actions.CHANGE_USERNAME]: {
    category: categories.AUTH
  },

  // SEARCH

  [actions.FOCUS_SEARCH]: {
    category: categories.LISTS
  },
  [actions.CHANGE_SEARCH_TERM]: {
    category: categories.LISTS
  },

  // ASSETS

  [actions.COMMENT_ON_ASSET]: {
    category: categories.ASSETS
  },
  [actions.DOWNLOAD_ASSET_FILE]: {
    category: categories.ASSETS
  },
  [actions.DOWNLOAD_ASSET]: {
    category: categories.ASSETS
  },
  [actions.ENDORSE_ASSET]: {
    category: categories.ASSETS
  },
  [actions.APPROVE_ASSET]: {
    category: categories.ASSETS
  },
  [actions.DELETE_ASSET]: {
    category: categories.ASSETS
  },

  // OTHER - APP
  [actions.HIDE_NOTICE]: {
    category: categories.APP
  },
  [actions.TOGGLE_DARK_MODE]: {
    category: categories.APP
  }
}

export const trackAction = (name, payload) => {
  if (inDevelopment()) {
    return
  }

  const { category } = actionDetails[name]

  window.gtag('event', name, {
    event_category: category,
    event_label: JSON.stringify(payload)
  })
}
