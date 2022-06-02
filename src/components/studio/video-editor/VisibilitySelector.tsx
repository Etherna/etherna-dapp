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

import CustomSelect from "@/components/common/CustomSelect"
import Label from "@/components/common/Label"
import FieldDesrcription from "@/components/common/FieldDesrcription"

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
