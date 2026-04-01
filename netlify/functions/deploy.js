const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método não permitido' };
  }

  try {
    const data = JSON.parse(event.body);
    const { subdomain, template, content, images } = data;

    if (!subdomain || !content?.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Faltam dados obrigatórios' })
      };
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const netlifyToken = process.env.NETLIFY_TOKEN;
    const githubUser = process.env.GITHUB_USERNAME;
    
    const templateRepo = template === 'beleza' 
      ? process.env.FLOWPAGES_BROW 
      : process.env.TEMPLATE_FOTOGRAFO;

    if (!githubToken || !netlifyToken || !templateRepo) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Tokens ou template não configurados' })
      };
    }

    const repoName = `site-${subdomain}`;

    // 1. Criar repositório a partir do template
    const criarRepo = await fetch(
      `https://api.github.com/repos/${githubUser}/${templateRepo}/generate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          owner: githubUser,
          private: false,
        }),
      }
    );

    if (!criarRepo.ok) {
      const erro = await criarRepo.text();
      throw new Error(`Erro ao criar repositório: ${erro}`);
    }

    // 2. Fazer deploy na Netlify
    const deploy = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: {
          provider: 'github',
          repo: `${githubUser}/${repoName}`,
          branch: 'main',
        },
        name: subdomain,
        custom_domain: `${subdomain}.suaplataforma.com`,
      }),
    });

    if (!deploy.ok) {
      const erro = await deploy.text();
      throw new Error(`Erro ao fazer deploy: ${erro}`);
    }

    const deployData = await deploy.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Site criado com sucesso!',
        siteUrl: deployData.ssl_url || `https://${subdomain}.netlify.app`,
        dashboardUrl: `https://${subdomain}.netlify.app/admin`,
      }),
    };

  } catch (erro) {
    console.error('Erro:', erro);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: erro.message }),
    };
  }
};
