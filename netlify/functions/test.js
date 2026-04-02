exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Função funcionando!',
      env: {
        githubToken: process.env.GITHUB_TOKEN ? 'ok' : 'missing',
        netlifyToken: process.env.NETLIFY_TOKEN ? 'ok' : 'missing',
        githubUser: process.env.GITHUB_USERNAME || 'missing',
        templateRepo: process.env.FLOWPAGES_BROW || 'missing'
      }
    })
  };
};
