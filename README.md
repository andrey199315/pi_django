<center><h1> 📦 EmpilhaCerto</h1> </center>

---

##  Índice
* [Descrição](#descrição)
* [Funcionalidades do projeto](#funcionalidades)
* [Técnologias utilizadas](#tecnologias-utilizadas)
* [Como utilizar](#como-utilizar)
* [Link de acesso](#link-de-acesso)

---
---

> **<center>⚠️ Requisitos de Navegador e Aviso Importante⚠️ </center>**

Para o comando de voz é utilizada a API **WebKitSpeechRecognition**, a qual não tem compatibilidade com todos os navegadores. 

**Navegadores recomendados:**

* **Google Chrome** v25+
* **Microsoft Edge**
* **Firefox**
* **Safari**

---
---

## Descrição
    EmpilhaCerto é o resultado de um Projeto Integrador 2(PI2) da faculdade UNIVESP, onde seu objetivo é controle automatizado de estoque.
    Além das funcionalidades basicas, o projeto conta com recurso de acessibilidades o qual era um requisito para a elaboraçao do PI2, bem como o uso de banco de dados.

## Funcionalidades
* **Estátisticas e Alertas**: Mostra a quantidade de produtos em estoque e avisos de produtos vencidos ou proximo do vencimento;
* **Comando de voz**: Possibilida a adiçao, exclusão, entrada e saída de produtos, através de comandos pré-determinados;
* **Adicionar Produto**: Fomulário para adicionar novos produtos;
* **Entrada e Saída**: Realizada a entrada/saída de produtos ja cadastrados (não realizada inserção de novos produtos ou exclusão de produtos);
* **Estoque Atual**: Mostra todos os produtos em estoque, filtrado sempre do que esta mais próximo do vencimento, conta com um campo de busca de produto (nome ou categoria) e tambem realiza a edição e exclusão de produtos;
* **Movimentações**: Registra toda entrada e saída de produtos, conta com filtro de busca por dia, nome do produto e tipo de movimentação;

## Tecnologias Utilizadas
As tecnologias usadas no projeto foram:
* ***Framework Django***: Usado para facilitar o desenvolvimento rápido de aplicações web complexas e orientadas a banco de dados;
* ***Framework Pytest***: Usado para a realização de pequenos testes.
* ***Auxiliares de teste***: Foram utilizados algumas bibliotecas e puglins que auxiliam nos testes como por exemple: factory-boy, Faker, pytest-cov, coverage.
* ***Python***: Usado para a realização da parte lógica do projeto;
* ***JavaScript***: Usado principalmente para melhorar a experiência do usuário, realizando validações de formulários, busca dinâmica, formatação de conteúdo, alertas visuais e acessibilidade por comando de voz. 
* ***HTML***: Utilizado para estruturar as páginas web;
* ***CSS***: Usado para a estilização das páginas web;


## Como utilizar
(Estarei assumindo a utilização do VS Code como IDE)

Após clonar ou realizar o download do projeto.
<ol><li>- Abra o diretorio do projeto na sua IDE;</li>
<li> inicie um novo Terminal;</li>
<li>Insira o seguinte comando para criaçao de um ambiente virtual:</li>
        
        python -m venv nome_do_ambiente_virtual

<li>Após a criação do ambiente virtual, será necessario fazer a ativação:</li>
No Windows(powershell e bash):

        ./nome_do_ambiente_virtual/Scripts/Activate.ps1 
        
        ou 
        
        ./nome_do_ambiente_virtual/Scripts/activate
No Linux ou macOS: 
    
         source nome_do_ambiente_virtual/bin/activate 

<li>Instale as dependências para o correto funcionamento da aplicação.</li>
Execute o comando:

        pip install -r requirements.txt. 

<li>Para roda o projeto localmente será necessário criar as tabelas do banco de dados, para isso vamos utilizar dois comandos: </li>

        python manage.py makemigrations

Inicia um arquivo descrevendo  as operações para sincronizar o  esquema do banco de dados.

        python manage.py migrate
Le as migrações realizada anteriormente,  e executa o código SQL para criar as tabelas e colunas necessarias.

<li>Por fim, vamos inciar a nossa aplicação, inserindo o seguinte comando:</li>
        
        python manage.py runserver 

Após a inserção dessa linha, no terminal ira retornar algumas informaçoes, copie ou de um ctrl+clique onde está escrito "Starting developmente server at http://......"

---
---
<br>
<br>

>Link disponível por tempo indeterminado!!

## [Link de acesso](https://andrey199315.pythonanywhere.com )
