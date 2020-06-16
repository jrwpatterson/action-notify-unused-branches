"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oldBranchNotify = void 0;
const ONE_DAY = 1000 * 60 * 60 * 24;
function oldBranchNotify(actionContext) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoInfo = actionContext.context.repo;
            const numberOfDaysToLookIntoPast = parseInt(actionContext.getInput('daysOld'));
            const excludedAuthor = actionContext.getInput('excludedAuthor');
            const listBranchesResponse = yield actionContext.octokit.repos.listBranches(Object.assign(Object.assign({}, repoInfo), { protected: false, per_page: 100 }));
            actionContext.debug(`found ${listBranchesResponse.data.length} branches`);
            actionContext.debug(`starting to get the data`);
            const branchRequests = listBranchesResponse.data.map((branch) => __awaiter(this, void 0, void 0, function* () {
                return actionContext.octokit.repos.getBranch(Object.assign(Object.assign({}, repoInfo), { branch: branch.name }));
            }));
            actionContext.debug(`branchRequests ${branchRequests.length} branches`);
            const branchExtraInfo = yield Promise.all(branchRequests);
            actionContext.debug(`starting branch with author`);
            const branchWithAuthor = branchExtraInfo
                .filter(branch => {
                var _a;
                return branch.data.commit.author &&
                    ((_a = branch.data.commit.author) === null || _a === void 0 ? void 0 : _a.login) !== excludedAuthor;
            })
                .map(value => {
                var _a;
                actionContext.debug(JSON.stringify(value.data.commit.author));
                return {
                    author: value.data.commit.commit.author,
                    name: value.data.name,
                    login: (_a = value.data.commit.author) === null || _a === void 0 ? void 0 : _a.login
                };
            });
            const oldBranches = branchWithAuthor.filter(value => {
                return (Date.parse(value.author.date) <
                    Date.now() - ONE_DAY * numberOfDaysToLookIntoPast);
            });
            actionContext.debug(`found ${oldBranches.length} branches older than ${numberOfDaysToLookIntoPast} days old`);
            const formattedBranches = oldBranches.map(value => {
                if (value && value.login) {
                    return `${value.name}: last commit by @${value === null || value === void 0 ? void 0 : value.login}`;
                }
                return `${value.name}: last commit by unknown`;
            });
            if (oldBranches.length > 0) {
                yield actionContext.octokit.issues.create(Object.assign(Object.assign({}, repoInfo), { title: `Old branches ${new Date().toDateString().slice(0, 15)}`, body: `## Branches older than ${numberOfDaysToLookIntoPast} days\n${formattedBranches.join('\n')}`, assignees: Array.from(new Set(oldBranches
                        .filter(value => value && value.login)
                        .map(value => value.login))) }));
            }
        }
        catch (error) {
            actionContext.setFailed(error.message);
        }
    });
}
exports.oldBranchNotify = oldBranchNotify;
