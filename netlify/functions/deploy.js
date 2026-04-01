exports.handler = async (event) => {
  console.log('🚀 Função iniciada');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método não permitido' };
  }

  try {
    const data = JSON.parse(event.body);
    console.log('📦 Dados recebidos:', JSON.stringify(data, null, 2));
    
    const { subdomain, template, content, images } = data;

    if (!subdomain || !content?.name) {
      console.log('❌ Faltam dados');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Faltam dados obrigatórios' })
      };
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const netlifyToken = process.env.NETLIFY_TOKEN;
    const githubUser = process.env.GITHUB_USERNAME;
    const templateRepo = process.env.FLOWPAGES_BROW;

    console.log('🔑 GitHub User:', githubUser);
    console.log('📁 Template Repo:', templateRepo);
    console.log('🔐 GitHub Token existe?', githubToken ? 'Sim' : 'Não');
    console.log('🔐 Netlify Token existe?', netlifyToken ? 'Sim' : 'Não');

    if (!githubToken || !netlifyToken || !templateRepo) {
      console.log('❌ Tokens faltando');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Tokens ou template não configurados' })
      };
    }

    const repoName = `site-${subdomain}`;
    console.log('📝 Nome do repositório:', repoName);

    // Criar repositório
    console.log('🔄 Criando repositório no GitHub...');
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

    console.log('📡 GitHub response status:', criarRepo.status);

    if (!criarRepo.ok) {
      const erro = await criarRepo.text();
      console.log('❌ Erro GitHub:', erro);
      throw new Error(`Erro ao criar repositório: ${erro}`);
    }

    console.log('✅ Repositório criado com sucesso');

    // Deploy na Netlify
    console.log('🚀 Fazendo deploy na Netlify...');
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

    console.log('📡 Netlify response status:', deploy.status);

    if (!deploy.ok) {
      const erro = await deploy.text();
      console.log('❌ Erro Netlify:', erro);
      throw new Error(`Erro ao fazer deploy: ${erro}`);
    }

    const deployData = await deploy.json();
    console.log('✅ Deploy concluído!');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Site criado com sucesso!',
        siteUrl: deployData.ssl_url || `https://${subdomain}.netlify.app`,
        dashboardUrl: `https://${subdomain}.netlify.app/admin`,
      }),
    };

  } catch (erro) {
    console.error('❌ ERRO GERAL:', erro);
    console.error('Stack:', erro.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: erro.message }),
    };
  }
};
