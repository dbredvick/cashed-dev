import kv from "@vercel/kv";

export const runtime = 'edge'

function getPacificMidnightISOString() {
    const now = new Date();
    const pacificNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const dateString = pacificNow.toISOString().split('T')[0];
    const pacificMidnight = new Date(`${dateString}T07:00:00.000Z`);
    return pacificMidnight.toISOString();
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        // throw new Error(`An error occurred: ${response.statusText}`);
    }
    return await response.json();
}

async function fetchAllRepos(username, headers, page = 1, pacificMidnightISOString) {
    const response = await fetch(
        `https://api.github.com/user/repos?affiliation=owner&per_page=100&page=${page}`,
        { headers }
    );
    console.log('Rate limit:', response.headers.get('X-RateLimit-Limit'));
    console.log('Remaining requests:', response.headers.get('X-RateLimit-Remaining'));


    if (!response.ok) {
        console.log(response)
        throw new Error(`An error occurred: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 100) {
        const nextPageRepos = await fetchAllRepos(username, headers, page + 1);
        return [...data, ...nextPageRepos];
    }

    return data;
}


async function checkUserCommitToday(username, token) {
    const pacificMidnightISOString = getPacificMidnightISOString();

    const headers = {
        Authorization: `token ${token}`,
    };

    const repos = await fetchAllRepos(username, headers, 1, pacificMidnightISOString);
    console.log(repos.map(repo => repo.html_url))

    // // Check each repo for commits made today
    for (const repo of repos) {
        const commits = await fetchJson(
            `https://api.github.com/repos/${repo.full_name}/commits?since=${pacificMidnightISOString}&author=${username}`,
            {
                headers: {
                    Authorization: `token ${token}`,
                },
            }
        );

        // If there's at least one commit made today, return true
        if (commits.length > 0) {
            return true;
        }
    }

    // If no commits were found today, return false
    return repos.length > 0;
}

export default async function handler(req, res) {
    const today = getPacificMidnightISOString();

    // todayISO but just the date
    const todayDate = today.split('T')[0];



    const hideCommits = await kv.get("hide_commits") || {};
    const drewCommits = await kv.get("drew_commits") || {};
    const jacobCommits = await kv.get("jacob_commits") || {};

    const hasDrewCommittedYet = drewCommits[todayDate];

    if (!hasDrewCommittedYet) {
        const drewToken = process.env.DREW_TOKEN;
        const drewCommitted = await checkUserCommitToday("dbredvick", drewToken);
        drewCommits[todayDate] = drewCommitted;
    } else {
        console.log('drew already committed today, no need to check')
    }
    // check if hide committed
    const hasHideCommittedYet = hideCommits[todayDate];

    if (!hasHideCommittedYet) {
        const hideToken = process.env.HIDE_TOKEN;
        const hideCommitted = await checkUserCommitToday("catsarebetter98", hideToken);
        hideCommits[todayDate] = hideCommitted;
    } else {
        console.log('hide already committed today, no need to check')
    }


    // check if drew committed




    // check if jacob committed

    await kv.set("drew_commits", drewCommits);
    await kv.set("hide_commits", hideCommits);

    return new Response(JSON.stringify({ hideCommits, drewCommits, jacobCommits }));

}