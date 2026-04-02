exports.handler = async (event) => {
  console.log('Teste iniciado');
  
  const githubToken = process.env.GITHUB_TOKEN;
  const netlifyToken = process.env.NETLIFY_TOKEN;
  const githubUser = process.env.GITHUB_USERNAME;
  const templateRepo = process.env.FLOWPAGES_BROW;

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Função funcionando!',
      githubUser,
      templateRepo,
      hasGithubToken: !!githubToken,
      hasNetlifyToken: !!netlifyToken
    })
  };
};
