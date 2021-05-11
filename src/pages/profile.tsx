import { useParams } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ProfileView from "@components/profile/ProfileView"

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <LayoutWrapper>
      <SEO title="Profile" />
      <ProfileView profileAddress={id} />
    </LayoutWrapper>
  )
}

export default ProfilePage
