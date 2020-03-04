import {oldBranchNotify} from '../src/old-branch-notify'
import {GitHub} from '@actions/github'
import {Context} from '@actions/github/lib/context'
import {Octokit} from '@octokit/rest'

let context: Context
let listBranchesData: Array<any>
let listBranchesResponse: Octokit.AnyResponse
let getBranchResponse: Octokit.AnyResponse
let getBranchData: Object

beforeEach(() => {
  context = {
    repo: {
      repo: 'some-repo',
      owner: 'some-owner'
    },
    payload: {},
    eventName: '',
    sha: '',
    ref: '',
    workflow: '',
    action: '',
    actor: '',
    issue: {
      owner: '',
      repo: '',
      number: 1
    }
  }

  listBranchesData = [
    {
      name: 'master',
      commit: {
        sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
        url:
          'https://api.github.com/repos/octocat/Hello-World/commits/c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc'
      },
      protected: true,
      protection: {
        enabled: true,
        required_status_checks: {
          enforcement_level: 'non_admins',
          contexts: ['ci-test', 'linter']
        }
      },
      protection_url:
        'https://api.github.com/repos/octocat/hello-world/branches/master/protection'
    }
  ]

  const headers = {
    date: '',
    'x-ratelimit-limit': '',
    'x-ratelimit-remaining': '',
    'x-ratelimit-reset': '',
    'x-Octokit-request-id': '',
    'x-Octokit-media-type': '',
    link: '',
    'last-modified': '',
    etag: '',
    status: ''
  }

  listBranchesResponse = {
    data: listBranchesData,
    status: 200,
    headers: headers,
    [Symbol.iterator]: () => 'test'[Symbol.iterator]()
  }

  getBranchData = {
    name: 'master',
    commit: {
      sha: '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
      node_id:
        'MDY6Q29tbWl0N2ZkMWE2MGIwMWY5MWIzMTRmNTk5NTVhNGU0ZDRlODBkOGVkZjExZA==',
      commit: {
        author: {
          name: 'The Octocat',
          date: '2012-03-06T15:06:50-08:00',
          email: 'octocat@nowhere.com'
        },
        url:
          'https://api.github.com/repos/octocat/Hello-World/git/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
        message:
          'Merge pull request #6 from Spaceghost/patch-1\n\nNew line at end of file.',
        tree: {
          sha: 'b4eecafa9be2f2006ce1b709d6857b07069b4608',
          url:
            'https://api.github.com/repos/octocat/Hello-World/git/trees/b4eecafa9be2f2006ce1b709d6857b07069b4608'
        },
        committer: {
          name: 'The Octocat',
          date: '2012-03-06T15:06:50-08:00',
          email: 'octocat@nowhere.com'
        },
        verification: {
          verified: false,
          reason: 'unsigned',
          signature: null,
          payload: null
        }
      },
      author: {
        gravatar_id: '',
        avatar_url:
          'https://secure.gravatar.com/avatar/7ad39074b0584bc555d0417ae3e7d974?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png',
        url: 'https://api.github.com/users/octocat',
        id: 583231,
        login: 'octocat'
      },
      parents: [
        {
          sha: '553c2077f0edc3d5dc5d17262f6aa498e69d6f8e',
          url:
            'https://api.github.com/repos/octocat/Hello-World/commits/553c2077f0edc3d5dc5d17262f6aa498e69d6f8e'
        },
        {
          sha: '762941318ee16e59dabbacb1b4049eec22f0d303',
          url:
            'https://api.github.com/repos/octocat/Hello-World/commits/762941318ee16e59dabbacb1b4049eec22f0d303'
        }
      ],
      url:
        'https://api.github.com/repos/octocat/Hello-World/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
      committer: {
        gravatar_id: '',
        avatar_url:
          'https://secure.gravatar.com/avatar/7ad39074b0584bc555d0417ae3e7d974?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png',
        url: 'https://api.github.com/users/octocat',
        id: 583231,
        login: 'octocat'
      }
    },
    _links: {
      html: 'https://github.com/octocat/Hello-World/tree/master',
      self: 'https://api.github.com/repos/octocat/Hello-World/branches/master'
    },
    protected: true,
    protection: {
      enabled: true,
      required_status_checks: {
        enforcement_level: 'non_admins',
        contexts: ['ci-test', 'linter']
      }
    },
    protection_url:
      'https://api.github.com/repos/octocat/hello-world/branches/master/protection'
  }

  getBranchResponse = {
    data: getBranchData,
    status: 200,
    headers: headers,
    [Symbol.iterator]: () => 'test'[Symbol.iterator]()
  }
})

let listBranchesSpy: jest.SpyInstance
let getBranchesSpy: jest.SpyInstance
let createIssueSpy: jest.SpyInstance

beforeEach(async () => {
  const octokit = new GitHub('fakeToken')
  listBranchesSpy = jest
    .spyOn(octokit.repos, 'listBranches')
    .mockResolvedValue(listBranchesResponse)
  getBranchesSpy = jest
    .spyOn(octokit.repos, 'getBranch')
    .mockResolvedValue(getBranchResponse)
  createIssueSpy = jest
    .spyOn(octokit.issues, 'create')
    .mockResolvedValue(getBranchResponse)

  await oldBranchNotify({
    octokit,
    context,
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
    repo: 'some-repo'
  })
})

test('expect an issue to be created', () => {
  expect(createIssueSpy).toHaveBeenCalledWith({
    repo: 'some-repo',
    owner: 'some-owner',
    title: 'Old branches ' + new Date().toDateString().slice(0, 15),
    assignees: ['The Octocat'],
    body: '## Branches older than 90 days\nmaster: last commit by @The Octocat'
  })
})
