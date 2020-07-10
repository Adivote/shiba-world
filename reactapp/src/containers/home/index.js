import React from 'react'
import { Link } from 'react-router-dom'

import RecentAssets from '../../components/recent-assets'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import SpeciesBrowser from '../../components/species-browser'
import AllTagsBrowser from '../../components/all-tags-browser'
import Polls from '../../components/polls'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import useSearchTerm from '../../hooks/useSearchTerm'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

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
      <Polls />
      <Heading variant="h2">
        <Link to={routes.viewAllSpecies}>Species</Link>
      </Heading>
      <BodyText>
        Select a species to browse their assets, tutorials, avatars and news.
      </BodyText>
      <SpeciesBrowser />
      <Heading variant="h2">
        <Link to={routes.news}>Recent News</Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.article} />
      <RecentAssets limit={5} categoryName={AssetCategories.article} />
      <Heading variant="h2">
        <Link
          to={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.accessory
          )}>
          Recent Accessories
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.accessory} />
      <RecentAssets limit={5} categoryName={AssetCategories.accessory} />
      <Heading variant="h2">
        <Link
          to={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.animation
          )}>
          Recent Animations
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.animation} />
      <RecentAssets limit={5} categoryName={AssetCategories.animation} />
      <Heading variant="h2">
        <Link
          to={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.tutorial
          )}>
          Recent Tutorials
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.tutorial} />
      <RecentAssets limit={5} categoryName={AssetCategories.tutorial} />
      <Heading variant="h2">
        <Link
          to={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.world
          )}>
          Recent Worlds
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.world} />
      <RecentAssets limit={5} categoryName={AssetCategories.world} />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
