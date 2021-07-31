import React from "react"

import CustomSelect from "@common/CustomSelect"
import Label from "@common/Label"
import FieldDesrcription from "@common/FieldDesrcription"

const AudienceSelector: React.FC = () => {
  return (
    <>
      <Label>Audience (TBD)</Label>
      <CustomSelect
        value="16+"
        options={[{
          value: "3+",
          label: "3+",
          description: "Contains no objectionable material and can be watched by kids"
        }, {
          value: "7+",
          label: "7+",
          description: "May contain content unsuitable for children under the age of 7"
        }, {
          value: "12+",
          label: "12+",
          description: "May contain content unsuitable for children under the age of 12"
        }, {
          value: "16+",
          label: "16+",
          description: "May contain content unsuitable for children under the age of 16"
        }, {
          value: "18+",
          label: "18+",
          description: "May contain content unsuitable for children under the age of 18"
        }]}
      />
      <FieldDesrcription>
        <span>Choose the reccomented age restriction for the video. The rating is based on the </span>
        <a
          href="https://en.wikipedia.org/wiki/International_Age_Rating_Coalition"
          target="_blank"
          rel="noreferrer"
        >
          <strong>International Age Rating Coalition</strong>
        </a>
        <span>.</span>
      </FieldDesrcription>
    </>
  )
}

export default AudienceSelector
