import {debug, setFailed} from '@actions/core'
import {GitHub, context} from '@actions/github'
import {oldBranchNotify} from './old-branch-notify'

async function run(): Promise<void> {
  debug('start action')
  const token = process.env.GITHUB_TOKEN
  if (!token) throw ReferenceError('No Token found')
  debug('attempt to run action')
  await oldBranchNotify({
    debug,
    setFailed,
    octokit: new GitHub(token),
    context
  })
}

run()
