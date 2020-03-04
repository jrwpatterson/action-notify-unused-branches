import {debug, setFailed} from '@actions/core'
import {GitHub, context} from '@actions/github'
import {oldBranchNotify} from './old-branch-notify'

async function run(): Promise<void> {
  const token = process.env.GITHUB_TOKEN

  if (!token) throw ReferenceError('No Token found')

  await oldBranchNotify({
    debug,
    setFailed,
    octokit: new GitHub(token),
    context
  })
}

run()
