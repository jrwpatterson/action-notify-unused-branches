import {debug, setFailed, getInput} from '@actions/core'
import * as GitHub from '@actions/github'
import {context} from '@actions/github'
import {oldBranchNotify} from './old-branch-notify'

async function run(): Promise<void> {
  debug('start action')
  const token = process.env.GITHUB_TOKEN
  if (!token) throw ReferenceError('No Token found')
  debug('attempt to run action')
  await oldBranchNotify({
    debug,
    setFailed,
    getInput,
    octokit: GitHub.getOctokit(token),
    context
  })
}

run()
