/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
import React from "react"

import FieldDescription from "@/components/common/FieldDescription"
import { Card } from "@/components/ui/display"
import { Select } from "@/components/ui/inputs"

type AudienceCardProps = {
  disabled?: boolean
}

const AudienceCard: React.FC<AudienceCardProps> = ({ disabled }) => {
  return (
    <Card title="Audience">
      <Select
        value="16+"
        options={[
          {
            value: "3+",
            label: "3+",
            description: "Contains no objectionable material and can be watched by kids",
          },
          {
            value: "7+",
            label: "7+",
            description: "May contain content unsuitable for children under the age of 7",
          },
          {
            value: "12+",
            label: "12+",
            description: "May contain content unsuitable for children under the age of 12",
          },
          {
            value: "16+",
            label: "16+",
            description: "May contain content unsuitable for children under the age of 16",
          },
          {
            value: "18+",
            label: "18+",
            description: "May contain content unsuitable for children under the age of 18",
          },
        ]}
        disabled={disabled}
      />
      <FieldDescription>
        <span>
          Choose the reccomented age restriction for the video. The rating is based on the{" "}
        </span>
        <a
          href="https://en.wikipedia.org/wiki/International_Age_Rating_Coalition"
          target="_blank"
          rel="noreferrer"
        >
          <strong>International Age Rating Coalition</strong>
        </a>
        <span>.</span>
      </FieldDescription>
    </Card>
  )
}

export default AudienceCard
