import React from "react"

import CustomSelect from "@common/CustomSelect"
import Label from "@common/Label"
import FieldDesrcription from "@common/FieldDesrcription"

const VisibilitySelector: React.FC = () => {
  return (
    <>
      <Label>Visibility (TBD)</Label>
      <CustomSelect
        value="public"
        options={[{
          value: "public",
          label: "Public",
          description: "The video can be viewed by anyone regardless the current gateway selected"
        }, {
          value: "private",
          label: "Private",
          description: "The video can only be reproduced with a password"
        }]}
      />
      <FieldDesrcription>
        Choose the video visibility, whether the video can be viewed by anyone, or password restricted.
      </FieldDesrcription>
    </>
  )
}

export default VisibilitySelector
