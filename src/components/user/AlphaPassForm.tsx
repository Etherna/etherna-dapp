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
import React, { useState } from "react"
import { useMatomo } from "@datapunt/matomo-tracker-react"
import axios from "axios"
import classNames from "classnames"

import { Button } from "@/components/ui/actions"
import { Alert, FormGroup } from "@/components/ui/display"
import { TextInput } from "@/components/ui/inputs"

const whatChoices = [
  {
    id: "contentCreator",
    value: "Content creator",
  },
  {
    id: "contentViewer",
    value: "Content viewer",
  },
  {
    id: "both",
    value: "Both",
  },
]

const AlphaPassForm: React.FC = () => {
  const { trackEvent } = useMatomo()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [why, setWhy] = useState("")
  const [what, setWhat] = useState("")
  const [social1, setSocial1] = useState("")
  const [social2, setSocial2] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>()
  const [errorFields, setErrorFields] = useState<Record<string, string>>()

  const sendFormRequest = async () => {
    setIsSubmitting(true)

    try {
      const errorFields: Record<string, string> = {}

      // fields validation
      if (name.length < 2) {
        setIsSubmitting(false)
        errorFields["name"] = "Please provide a valid name (you can just tell us your nickname)"
      }
      if (email.length === 0 || !/\S+@\S+\.\S+/.test(email)) {
        setIsSubmitting(false)
        errorFields["email"] = "Please provide a valid email address"
      }
      if (why.length < 5) {
        setIsSubmitting(false)
        errorFields["why"] = "Please tell us why you want to be part of the Alpha release"
      }
      if (what.length === 0) {
        setIsSubmitting(false)
        errorFields["what"] = "Please tell us what type of user you'd be"
      }

      if (Object.keys(errorFields).length) {
        setErrorFields(errorFields)
        return
      } else {
        setErrorFields(undefined)
      }

      const apiEndpoint = `${import.meta.env.VITE_APP_CMS_URL}/etherna/custom/alphapass`
      await axios.post(apiEndpoint, {
        email,
        name,
        why,
        what,
        social1,
        social2,
      })

      setSuccess(true)

      trackEvent({
        category: "subscription",
        action: "request-alpha-pass",
      })
    } catch (error) {
      console.error(error)
      setError("There was a problem sending your request. Try again later or contact the support.")
      setIsSubmitting(false)
    }
  }

  return success ? (
    <div
      className={classNames(
        "max-w-screen-md text-lg",
        "prose text-gray-900 dark:text-gray-100 prose-a:text-primary-500"
      )}
    >
      <p className="text-xl font-semibold">Thank you for your request 🙏</p>
      <p>
        To complete the registration you have to click on the confirmation link that we sent you to
        your email.
      </p>
      <ul className="mt-6">
        <li>Check the SPAM folder</li>
        <li>
          Make sure you provided the correct email ({email}). If this is not the case repeat the
          registration process in homepage.
        </li>
        <li>
          If after these checks you still haven&apos;t received the email contact us at{" "}
          <a href="mailto:info@etherna.io">info@etherna.io</a>
        </li>
      </ul>
    </div>
  ) : (
    <form className="max-w-screen-sm">
      <FormGroup label="Name">
        <TextInput
          type="text"
          autoComplete="name"
          error={errorFields?.["name"]}
          value={name}
          onChange={setName}
        />
      </FormGroup>

      <FormGroup label="Email">
        <TextInput
          type="email"
          autoComplete="email"
          error={errorFields?.["email"]}
          value={email}
          onChange={setEmail}
        />
      </FormGroup>

      <FormGroup label="Why would you like an Alpha Pass?">
        <TextInput
          type="text"
          error={errorFields?.["why"]}
          value={why}
          onChange={setWhy}
          multiline
        />
      </FormGroup>

      <FormGroup label="What kind of user are you?" error={errorFields?.["what"]}>
        <div className="flex flex-col items-start mt-2">
          {whatChoices.map(choice => (
            <label
              className="flex items-center cursor-pointer text-base mb-2"
              htmlFor={choice.id}
              key={choice.id}
            >
              <input
                type="radio"
                id={choice.id}
                value={choice.value}
                checked={what === choice.value}
                onChange={e => setWhat(e.target.value)}
              />
              <span className="ml-2 text-base">{choice.value}</span>
            </label>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Social account #1">
        <TextInput type="text" value={social1} onChange={setSocial1} />
      </FormGroup>

      <FormGroup label="Social account #2">
        <TextInput type="text" value={social2} onChange={setSocial2} />
      </FormGroup>

      {error && (
        <FormGroup>
          <Alert color="error" title="Oops!" onClose={() => setError(undefined)}>
            {error}
          </Alert>
        </FormGroup>
      )}

      <FormGroup>
        <Button
          type="button"
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={sendFormRequest}
        >
          Send Request
        </Button>
      </FormGroup>
    </form>
  )
}

export default AlphaPassForm
