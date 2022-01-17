# serviços e persistência de dados

Essa aplicação é composta por uma API REST em NodeJs e ExpressJs.
A aplicação foi desenvolvida sobre a versão 12.16.3 do NodeJs e as dependências são listadas no arquivo package.json.

### Instalação para Desenvolvimento

>npm install

### Instalação para Produção

>npm run install --production

### Execução

>npm start

## Variáveis de ambiente
A aplicação suporta a adição de variáveis de ambiente através de arquivo de configuração.
crie um arquivo `.env` no diretório raiz.
Opções suportadas:

PORT - porta de rede para instânciara a aplicação\
CUSTOMCONNSTR_MONGODB - string de conexão para o banco de dados\
BITLY_TOKEN - token de API bitly para gerar links encurtados\
EMAIL_USER - endereço de e-mail (configuração inicial realizada com conta Gmail)\
EMAIL_PASSWORD - senha (ou token) do usuário de e-mail\
NODE_ENV - identifica o ambiente que deseja iniciar a aplicação ["development","production","test"]\
PUBLIC_VAPID_KEY - chave pública da API de push notification\
PRIVATE_VAPID_KEY - chave privada da API de push notification\
GCM_API_KEY - chave da API google cloud\
SERVER - lista de servidores da aplicação para permitir autenticação\
SERPRO_CPF_TOKEN - token da API de validação de CPF\


## Serviços externos
A integração com banco serviços externos depende da configuração das respectivas variáveis de ambiente.
A ausência de uma variável de ambiente poderá impedir o funcionamento correto de um recurso do sistema ou mesmo impedir que a aplicação inicie.

Relação de serviços:
- Nodemailer: https://nodemailer.com/about/
- Web-push: https://github.com/web-push-libs/web-push#readme
- SERPRO: https://www.loja.serpro.gov.br/consultacpf

## Dependências
Detalhes sobre as dependências podem ser conferidas no arquivo package.json.
Para execução da aplicação é necessário uma instância do banco de dados MongoDB (aplicação construída com base na versão 4.2.7 do banco de dados).
Caso a variável de ambiente `CUSTOMCONNSTR_MONGODB` não seja informada será considerado um servidor no endereço `mongodb://localhost:27017/user-management`.
O instalador do Banco de dados pode ser baixado em https://www.mongodb.com/try/download/community.