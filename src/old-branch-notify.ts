import {ActionContext} from './action-context'

const ONE_DAY = 1000 * 60 * 60 * 24

export async function oldBranchNotify(
  actionContext: ActionContext
): Promise<void> {
  try {
    const repoInfo = actionContext.context.repo
    const numberOfDaysToLookIntoPast = parseInt(
      actionContext.getInput('daysOld')
    )

    const excludedAuthor = actionContext.getInput('excludedAuthor')

    const listBranchesResponse = await actionContext.octokit.repos.listBranches(
      {
        ...repoInfo,
        protected: false,
        per_page: 10000
      }
    )

    const branches = (
      await actionContext.octokit.git.listMatchingRefs({
        ...repoInfo,
        ref: 'pilot'
      })
    ).data
    actionContext.debug(JSON.stringify(branches))
    // actionContext.octokit.git.listMatchingRefs
    actionContext.debug(`found ${listBranchesResponse.data.length} branches`)

    const branchRequests = listBranchesResponse.data.map(async branch =>
      actionContext.octokit.repos.getBranch({
        ...repoInfo,
        branch: branch.name
      })
    )

    const branchExtraInfo = await Promise.all(branchRequests)
    actionContext.debug(`starting branch with author`)
    const branchWithAuthor = branchExtraInfo
      .filter(
        branch =>
          branch.data.commit.author &&
          branch.data.commit.author?.login !== excludedAuthor
      )
      .map(value => {
        actionContext.debug(JSON.stringify(value))
        return {
          author: value.data.commit.commit.author,
          name: value.data.name,
          login: value.data.commit.author?.login
        }
      })

    const oldBranches = branchWithAuthor.filter(value => {
      return (
        Date.parse(value.author.date) <
        Date.now() - ONE_DAY * numberOfDaysToLookIntoPast
      )
    })

    actionContext.debug(
      `found ${oldBranches.length} branches older than ${numberOfDaysToLookIntoPast} days old`
    )

    const formattedBranches = oldBranches.map(value => {
      if (value && value.login) {
        return `${value.name}: last commit by @${value?.login}`
      }
      return `${value.name}: last commit by unknown`
    })

    if (oldBranches.length > 0) {
      await actionContext.octokit.issues.create({
        ...repoInfo,
        title: `Old branches ${new Date().toDateString().slice(0, 15)}`,
        body: `## Branches older than ${numberOfDaysToLookIntoPast} days\n${formattedBranches.join(
          '\n'
        )}`,
        assignees: Array.from(
          new Set(
            oldBranches
              .filter(value => value && value.login)
              .map(value => value.login)
          )
        )
      })
    }
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
