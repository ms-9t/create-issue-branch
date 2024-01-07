import {Context, Probot} from "probot";
import * as github from "../github";
import {loadConfig} from "../config";
import {getRepoName, getRepoOwnerLogin} from "../context";

export async function pullRequestClosed(_: Probot, ctx: Context<any>) {
    if (ctx.payload.pull_request.merged === true) {
        const config = await loadConfig(ctx);
        if (config && config.autoCloseIssue) {
            const branchName = ctx.payload.pull_request.head.ref
            const issueNumber = github.getIssueNumberFromBranchName(branchName);
            if (issueNumber) {
                const owner = getRepoOwnerLogin(ctx);
                const repo = getRepoName(ctx);
                const issueForBranch = await ctx.octokit.issues.get({
                    owner: owner,
                    repo: repo,
                    issue_number: issueNumber
                });
                if (issueForBranch) {
                    await ctx.octokit.issues.update({
                        owner: owner,
                        repo: repo,
                        issue_number: issueNumber,
                        state: 'closed'
                    })
                }
            }
        }
    }
}