import {ActionContext} from './action-context'

export async function oldBranchNotify(
  actionContext: ActionContext
): Promise<void> {
  try {
    actionContext.debug('Get a list of all the branches')
    const repoInfo = actionContext.context.repo

    const response = await actionContext.octokit.repos.listBranches({
      ...repoInfo,
      protected: false,
      per_page: 100
    })

    const branches = response.data

    actionContext.debug(`found ${branches.length} branches`)

    const branchRequests = branches.map(async branch =>
      actionContext.octokit.repos.getBranch({
        ...repoInfo,
        branch: branch.name
      })
    )

    const branchExtraInfo = await Promise.all(branchRequests)

    const branchWithAuthor = branchExtraInfo.map(value => {
      return {
        author: value.data.commit.commit.author,
        name: value.data.name,
        login: value.data.commit.author.login
      }
    })

    const numberOfDaysToLookIntoPast = parseInt(
      actionContext.getInput('daysOld')
    )

    const oldBranches = branchWithAuthor.filter(value => {
      return (
        Date.parse(value.author.date) <
        Date.now() - 1000 * 60 * 60 * 24 * numberOfDaysToLookIntoPast
      )
    })

    actionContext.debug(
      `found ${oldBranches.length} branches older than 90 days old`
    )

    const formattedBranches = oldBranches.map(value => {
      return `${value.name}: last commit by @${value.author.name}`
    })

    if (oldBranches.length > 0) {
      await actionContext.octokit.issues.create({
        ...repoInfo,
        title: `Old branches ${new Date().toDateString().slice(0, 15)}`,
        body: `## Branches older than 90 days\n${formattedBranches.join('\n')}`,
        assignees: Array.from(new Set(oldBranches.map(value => value.login)))
      })
    }
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
