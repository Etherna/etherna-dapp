import React, { useMemo } from "react"
import classNames from "classnames"

import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/actions"
import { Alert, Card, Text } from "@/components/ui/display"
import useVideoEditor from "@/hooks/useVideoEditor"
import routes from "@/routes"
import type { PublishStatus } from "@/stores/video-editor"
import useVideoEditorStore from "@/stores/video-editor"

type SavingResultCardProps = {}

const SavingResultCard: React.FC<SavingResultCardProps> = ({}) => {
  const publishingResults = useVideoEditorStore(state => state.publishingResults)
  const newReference = useVideoEditorStore(state => state.video.reference)

  const successfulAddResults = useMemo(() => {
    return (publishingResults ?? []).filter(result => result.ok && result.type === "add")
  }, [publishingResults])

  const erroredResults = useMemo(() => {
    return (publishingResults ?? []).filter(result => !result.ok)
  }, [publishingResults])

  const [isPrivate, privateLink] = useMemo(() => {
    const isPrivate = (publishingResults ?? []).every(result => result.type === "remove")
    const privateLink = location.origin + routes.watch(newReference)
    return [isPrivate, privateLink]
  }, [newReference, publishingResults])

  return (
    <Card title="Publishing results">
      <div className="space-y-6">
        {isPrivate && (
          <Alert title="Private video" color="success">
            Your private video is ready to be shared! <br />
            Make sure to save the following link bacause you won&apos;t be able to retrieve it
            later.
            <br />
            <br />
            <strong>
              <a
                className="overflow-hidden break-words break-all"
                href={privateLink}
                target="_blank"
                rel="noreferrer"
              >
                {privateLink}
              </a>
            </strong>
          </Alert>
        )}

        <div className="flex flex-col divide-y divide-gray-400/20">
          {successfulAddResults.map(result => (
            <ResultStatus result={result} key={result.source.identifier + result.source.source} />
          ))}
          {erroredResults.map(result => (
            <ResultStatus result={result} key={result.source.identifier + result.source.source} />
          ))}
        </div>
      </div>
    </Card>
  )
}

const ResultStatus: React.FC<{ result: PublishStatus }> = ({ result }) => {
  const { isSaving, reSaveTo } = useVideoEditor()

  return (
    <div className="flex flex-wrap items-center justify-between py-2">
      <span className="text-gray-700 dark:text-gray-300">
        {result.source.name}

        {result.source.source === "index" && (
          <span className="ml-2 text-sm text-sky-500">under validation...</span>
        )}
      </span>

      <div className="flex items-center space-x-3">
        {!result.ok && (
          <Button color="inverted" small loading={isSaving} onClick={() => reSaveTo(result.source)}>
            Retry
          </Button>
        )}
        {!isSaving && (
          <Text
            className={classNames("ml-auto", {
              "text-green-600 dark:text-green-500": result.ok,
              "text-yellow-600 dark:text-yellow-500": !result.ok,
            })}
            size="sm"
          >
            {result.ok ? (
              <CheckIcon className="mr-2 inline-block" strokeWidth={2} width={18} />
            ) : (
              <ExclamationTriangleIcon className="mr-2 inline-block" strokeWidth={2} width={18} />
            )}
            <span>{result.ok ? "Success" : "Error"}</span>
          </Text>
        )}
      </div>
    </div>
  )
}

export default SavingResultCard
