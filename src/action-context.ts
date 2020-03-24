import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github'

export interface ActionContext {
  debug: (message: string) => void
  setFailed: (message: string) => void
  getInput: (parameter: string) => string
  octokit: GitHub
  context: Context
}
