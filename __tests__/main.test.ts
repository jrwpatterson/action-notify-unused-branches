import {oldBranchNotify} from '../src/old-branch-notify'
import * as GitHub from '@actions/github'
import {Context} from '@actions/github/lib/context'
import {
  ReposListBranchesResponseData,
  OctokitResponse,
  ReposGetBranchResponseData,
  IssuesCreateResponseData
} from '@octokit/types'

let context: Context
let listBranchesData: ReposListBranchesResponseData
let listBranchesResponse: OctokitResponse<ReposListBranchesResponseData>
let getBranchResponse: OctokitResponse<ReposGetBranchResponseData>
let getBranchData: ReposGetBranchResponseData
let issuesCreateResponse: OctokitResponse<IssuesCreateResponseData>

beforeEach(() => {
  context = {
    repo: {
      repo: 'some-repo',
      owner: 'some-owner'
    }
  } as Context

  listBranchesData = [
    {
      name: 'master'
    }
  ] as ReposListBranchesResponseData

  listBranchesResponse = {
    data: listBranchesData
  } as OctokitResponse<ReposListBranchesResponseData>

  getBranchData = {
    name: 'master',
    protected: false,
    commit: {
      author: {
        login: 'peterjgrainger'
      },
      commit: {
        author: {
          name: 'Peter Grainger',
          date: '2012-03-06T15:06:50-08:00'
        }
      }
    }
  } as ReposGetBranchResponseData

  getBranchResponse = {
    data: getBranchData
  } as OctokitResponse<ReposGetBranchResponseData>

  issuesCreateResponse = {} as OctokitResponse<IssuesCreateResponseData>
})

let listBranchesSpy: jest.SpyInstance
let getBranchesSpy: jest.SpyInstance
let createIssueSpy: jest.SpyInstance

beforeEach(async () => {
  const octokit = GitHub.getOctokit('fakeToken')
  listBranchesSpy = jest
    .spyOn(octokit.repos, 'listBranches')
    .mockResolvedValue(listBranchesResponse)
  getBranchesSpy = jest
    .spyOn(octokit.repos, 'getBranch')
    .mockResolvedValue(getBranchResponse)
  createIssueSpy = jest
    .spyOn(octokit.issues, 'create')
    .mockResolvedValue(issuesCreateResponse)

  await oldBranchNotify({
    octokit,
    context,
    getInput: jest.fn().mockReturnValue(30),
    debug: jest.fn(),
    setFailed: jest.fn()
  })
})

test('expect get branch to to be called', () => {
  expect(getBranchesSpy).toHaveBeenCalledWith({
    owner: 'some-owner',
    repo: 'some-repo',
    branch: 'master'
  })
})

// shows how the runner will run a javascript action with env / stdout protocol
test('expect list branches to be called', () => {
  expect(listBranchesSpy).toHaveBeenCalledWith({
    protected: false,
    owner: 'some-owner',
    repo: 'some-repo',
    per_page: 100
  })
})

test('expect an issue to be created', () => {
  expect(createIssueSpy).toHaveBeenCalledWith({
    repo: 'some-repo',
    owner: 'some-owner',
    title: 'Old branches ' + new Date().toString().slice(0, 15),
    assignees: ['peterjgrainger'],
    body:
      '## Branches older than 30 days\nmaster: last commit by @peterjgrainger'
  })
})
