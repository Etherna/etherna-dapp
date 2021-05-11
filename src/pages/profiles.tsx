import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ProfilesView from "@components/profile/ProfilesView"

const ProfilesPage = () => (
  <LayoutWrapper>
    <SEO title="Profiles" />
    <div className="p-8">
      <h1 className="mb-1">Profiles</h1>
      <p className="text-gray-700 dark:text-gray-300 mt-4">
        <span>Explore all the </span>
        <strong>Ethernauts</strong>
        <span>...</span>
      </p>

      <ProfilesView />
    </div>
  </LayoutWrapper>
)

export default ProfilesPage
