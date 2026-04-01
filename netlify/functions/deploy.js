// Função que será chamada quando o cliente clicar em "Publicar"
exports.handler = async (event) => {
  // 1. Verifica se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método não permitido. Use POST.' })
    };
  }

  try {
    // 2. Recebe os dados do dashboard
    const dados = JSON.parse(event.body);
    
    console.log('Recebido:', dados);

    // 3. Por enquanto, vamos apenas simular uma resposta de sucesso
    //    Depois vamos adicionar a criação real do site
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Site criado com sucesso (simulação)',
        siteUrl: `https://${dados.subdomain}.netlify.app`,
        dashboardUrl: `https://${dados.subdomain}.netlify.app/admin`
      })
    };

  } catch (erro) {
    console.error('Erro:', erro);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno: ' + erro.message })
    };
  }
};
