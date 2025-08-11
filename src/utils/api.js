const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Debug token (remove in production)
console.log('🔑 GitHub Token Status:', {
  exists: !!GITHUB_TOKEN,
  length: GITHUB_TOKEN?.length || 0,
  preview: GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 10)}...` : 'No token found'
});

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'Gitify/1.1.1'
};

if (GITHUB_TOKEN) {
  headers.Authorization = `token ${GITHUB_TOKEN}`;
} else {
  console.warn('⚠️ No GitHub token found. You may hit rate limits quickly.');
}

// GraphQL headers
const graphqlHeaders = {
  'Content-Type': 'application/json',
  'User-Agent': 'Gitify/1.1.1'
};

if (GITHUB_TOKEN) {
  graphqlHeaders.Authorization = `Bearer ${GITHUB_TOKEN}`;
}

export const fetchGitHubUser = async (username) => {
  console.log(`📡 Fetching user: ${username}`);
  
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, { headers });
  
  // Log rate limit info
  console.log('Rate limit remaining:', response.headers.get('x-ratelimit-remaining'));
  console.log('Rate limit reset:', new Date(response.headers.get('x-ratelimit-reset') * 1000));
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    } else if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      if (rateLimitRemaining === '0') {
        throw new Error('Rate limit exceeded. Please wait or add a valid GitHub token.');
      }
      throw new Error('Access forbidden. Please check your GitHub token permissions.');
    } else if (response.status === 401) {
      throw new Error('Invalid GitHub token. Please check your token.');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return response.json();
};

export const fetchUserRepos = async (username, count = 12) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=${count}`,
    { headers }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch repositories: ${response.status}`);
  }
  
  return response.json();
};

export const fetchUserEvents = async (username, count = 30) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/events/public?per_page=${count}`,
    { headers }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }
  
  return response.json();
};

export const fetchUserOrganizations = async (username) => {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}/orgs`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch organizations: ${response.status}`);
  }
  
  return response.json();
};

export const fetchUserGists = async (username, count = 10) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/gists?per_page=${count}`,
    { headers }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch gists: ${response.status}`);
  }
  
  return response.json();
};

export const fetchUserStarred = async (username, count = 10) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/starred?per_page=${count}`,
    { headers }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch starred repositories: ${response.status}`);
  }
  
  return response.json();
};

export const fetchRepositoryLanguages = async (owner, repo) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`, { headers });
    if (!response.ok) return {};
    return response.json();
  } catch {
    return {};
  }
};

// Improved contributions function with GraphQL
export const fetchContributions = async (username) => {
  // Try GraphQL first if token is available
  if (GITHUB_TOKEN) {
    try {
      return await fetchContributionsGraphQL(username);
    } catch (error) {
      console.warn('GraphQL failed, falling back to alternative API:', error.message);
    }
  }
  
  // Fallback to external API
  try {
    const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch contributions: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match expected format
    const transformedContributions = data.contributions?.map(contrib => ({
      date: contrib.date,
      contributionCount: contrib.count || 0
    })) || [];

    return {
      contributions: transformedContributions,
      total: data.total || {}
    };
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return { contributions: [], total: {} };
  }
};

// GraphQL contributions function
const fetchContributionsGraphQL = async (username) => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: graphqlHeaders,
    body: JSON.stringify({
      query,
      variables: { username }
    })
  });

  if (!response.ok) {
    throw new Error(`GraphQL API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  const contributionCalendar = data.data.user.contributionsCollection.contributionCalendar;
  const contributions = contributionCalendar.weeks.flatMap(week => week.contributionDays);

  return {
    contributions,
    total: {
      [new Date().getFullYear()]: contributionCalendar.totalContributions
    }
  };
};

export const getStatsCardUrl = (username, theme = 'default') => {
  const darkMode = document.documentElement.classList.contains('dark');
  const cardTheme = darkMode ? 'dark' : theme;
  return `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=${cardTheme}&hide_border=true&bg_color=0D1117&title_color=E6EDF3&text_color=7D8590&icon_color=58A6FF&count_private=true`;
};

export const getLanguageStatsUrl = (username) => {
  const darkMode = document.documentElement.classList.contains('dark');
  const theme = darkMode ? 'dark' : 'default';
  return `https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&theme=${theme}&hide_border=true&bg_color=0D1117&title_color=E6EDF3&text_color=7D8590&layout=compact`;
};

export const getStreakStatsUrl = (username) => {
  const darkMode = document.documentElement.classList.contains('dark');
  const theme = darkMode ? 'dark' : 'default';
  return `https://streak-stats.demolab.com/?user=${username}&theme=${theme}&hide_border=true&background=0D1117`;
};

export const getActivityGraphUrl = (username) => {
  const darkMode = document.documentElement.classList.contains('dark');
  const theme = darkMode ? 'github-dark' : 'github';
  return `https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=${theme}&hide_border=true&bg_color=0D1117&color=7D8590&line=58A6FF&point=E6EDF3`;
};

// Check rate limit
export const checkRateLimit = async () => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, { headers });
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Rate Limit Status:', data.rate);
      return data;
    }
  } catch (error) {
    console.error('Failed to check rate limit:', error);
  }
  return null;
};

export const fetchAllUserData = async (username) => {
  try {
    // Check rate limit first
    await checkRateLimit();
    
    console.log(`🚀 Fetching all data for: ${username}`);
    
    const [user, repos, events, orgs, gists, starred, contributions] = await Promise.all([      
      fetchGitHubUser(username),
      fetchUserRepos(username, 12),
      fetchUserEvents(username, 30),
      fetchUserOrganizations(username),
      fetchUserGists(username, 10),
      fetchUserStarred(username, 10),
      fetchContributions(username)
    ]);

    // Fetch languages for top repositories
    const repoLanguages = await Promise.all(
      repos.slice(0, 8).map(async (repo) => {
        const languages = await fetchRepositoryLanguages(username, repo.name);
        return { repo: repo.name, languages };
      })
    );

    console.log('✅ Successfully fetched all data');

    return {
      user,
      repos,
      events,
      orgs,
      gists,
      starred,
      contributions,
      repoLanguages,
      error: null
    };
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    
    return {
      user: null,
      repos: [],
      events: [],
      orgs: [],
      gists: [],
      starred: [],
      contributions: { contributions: [], total: {} },
      repoLanguages: [],
      error: error.message
    };
  }
};
