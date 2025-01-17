import fs from 'fs'

export function extractGithubProperties() {
  const eventPath = process.env.GITHUB_EVENT_PATH

  if (!eventPath) {
    console.error(
      'GITHUB_EVENT_PATH is not set. This is required to determine context.'
    )
    return
  }

  let context
  try {
    const eventData = fs.readFileSync(eventPath, 'utf8')
    context = JSON.parse(eventData)
  } catch (error) {
    console.error('Failed to read or parse event data:', error)
    return
  }

  const {
    GITHUB_REPOSITORY: repoName,
    GITHUB_REF_NAME: branchName,
    GITHUB_RUN_NUMBER: runNumber,
    GITHUB_JOB: jobName,
    GITHUB_WORKFLOW_ID: workflowId,
    GITHUB_WORKFLOW: workflowName,
    GITHUB_TRIGGERING_ACTOR: actorName,
    GITHUB_EVENT_NAME: eventName, // push or pull_request
    GITHUB_RUN_ID: runId,
    GITHUB_API_URL: apiUrl,
    GITHUB_SERVER_URL: baseUrl,
  } = process.env

  const pullRequestNumber = context.pull_request?.number
  const buildUrl = `${baseUrl}/${repoName}/actions/runs/${runId}#summary`

  return {
    repoName,
    branchName,
    runNumber,
    jobName,
    workflowId,
    workflowName,
    actorName,
    eventName,
    runId,
    pullRequestNumber,
    apiUrl,
    baseUrl,
    buildUrl,
  }
}

export function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  ].join('|')

  return new RegExp(pattern, onlyFirst ? undefined : 'g')
}

export function stripAnsi(message: string) {
  if (typeof message !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof message}\``)
  }

  return message.replace(ansiRegex(), '')
}
