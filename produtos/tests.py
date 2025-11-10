from django.test import TestCase
from django.urls import reverse
from datetime import date, timedelta, datetime
from .models import ProdutoModel, MovimentacaoEstoque

class ProdutoModelTest(TestCase):
    def setUp(self):
        #Cria um produto
        self.validade = date.today() + timedelta(days=30)
        self.produto = ProdutoModel.objects.create(
            nome='Arroz',
            categoria='alimento',
            quantidade=5,
            preco=10.50,
            validade=self.validade,
            lote='L123'
        )
    
    def test_criacao_produto(self):
        #Testa se o produto foi criado
        self.assertTrue(isinstance(self.produto, ProdutoModel))
        self.assertEqual(self.produto.nome, 'Arroz')
        
    def test_str_representation(self):
        #Testa se a representação string do produto
        self.assertEqual(str(self.produto), 'Arroz')
        
    def test_produto_properties(self):
        #Testa as properties do modelo
        self.assertFalse(self.produto.esta_vencido)
        self.assertEqual(self.produto.dias_para_vencer, 30)
        self.assertEqual(self.produto.preco_formatado, '10,50')

class ProdutoViewTest(TestCase):
    def test_view_cadastro_get(self):
        #Testa se a página de cadastro carrega
        response = self.client.get(reverse('produtos:cadastrar'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home.html')
        
    def test_view_cadastro_post(self):
        #Testa se é possível criar um produto via POST
        validade = (date.today() + timedelta(days=90)).isoformat()
        data = {
            'nome': 'Feijão',
            'categoria': 'alimento',
            'quantidade': 12,
            'preco': '7.30',
            'validade': validade,
            'lote': 'L999'
        }
        response = self.client.post(reverse('produtos:cadastrar'), data)
        # Verifica se houve redirecionamento 200
        self.assertIn(response.status_code, [302, 303])
        # Verifica se o produto foi criado
        self.assertTrue(ProdutoModel.objects.filter(nome='Feijão').exists())
        
    def test_view_entrada_estoque(self):
        #Testa a funcionalidade de entrada no estoque
        produto = ProdutoModel.objects.create(
            nome='Café',
            categoria='alimento',
            quantidade=10,
            preco='15.90',
            validade=date.today() + timedelta(days=180),
            lote='L555'
        )
        
        response = self.client.post(reverse('produtos:entrada_estoque'), {
            'produto_id': produto.id,
            'quantidade_entrada': 5
        })
        
        # Atualiza o produto do banco
        produto.refresh_from_db()
        self.assertEqual(produto.quantidade, 15)  # 10 inicial + 5 da entrada
        
    def test_view_saida_estoque(self):
        #Testa a funcionalidade de saída do estoque
        produto = ProdutoModel.objects.create(
            nome='Café',
            categoria='alimento',
            quantidade=10,
            preco='15.90',
            validade=date.today() + timedelta(days=180),
            lote='L555'
        )
        
        response = self.client.post(reverse('produtos:saida_estoque'), {
            'produto_id': produto.id,
            'quantidade_saida': 3
        })
        
        # Atualiza o produto do banco
        produto.refresh_from_db()
        self.assertEqual(produto.quantidade, 7)

class MovimentacaoEstoqueTest(TestCase):
    def setUp(self):
        # Criar produto para os testes
        self.produto = ProdutoModel.objects.create(
            nome='Teste',
            categoria='alimento',
            quantidade=10,
            preco=5.00,
            validade=date.today() + timedelta(days=30),
            lote='L001'
        )
        
        # Criar algumas movimentações
        MovimentacaoEstoque.objects.create(
            produto=self.produto,
            tipo='entrada',
            quantidade=5,
            observacao='Entrada inicial'
        )
        MovimentacaoEstoque.objects.create(
            produto=self.produto,
            tipo='saida',
            quantidade=2,
            observacao='Saída teste'
        )
    
    def test_criacao_movimentacao(self):
        # Testa criação de movimentação
        mov = MovimentacaoEstoque.objects.create(
            produto=self.produto,
            tipo='entrada',
            quantidade=3,
            observacao='Teste'
        )
        self.assertTrue(isinstance(mov, MovimentacaoEstoque))
        self.assertEqual(mov.quantidade, 3)
        
    def test_str_representation(self):
        # Testa representação string da movimentação
        # Cria uma nova movimentação específica para o teste
        mov = MovimentacaoEstoque.objects.create(
            produto=self.produto,
            tipo='entrada',
            quantidade=5,
            observacao='Teste str'
        )
        expected = "Entrada de 5 unidades de Teste"
        self.assertEqual(str(mov), expected)
        
    def test_historico_view(self):
        # Testa a view de histórico
        response = self.client.get(reverse('produtos:historico'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'historico_movimentacoes.html')
        
        # Verifica se as movimentações estão no contexto
        self.assertTrue('movimentacoes' in response.context)
        self.assertEqual(response.context['movimentacoes'].count(), 2)
        
    def test_historico_filtros(self):
        # Testa filtros do histórico
        hoje = date.today().strftime('%Y-%m-%d')
        
        # Teste filtro por tipo
        response = self.client.get(f"{reverse('produtos:historico')}?tipo=entrada")
        self.assertEqual(response.context['movimentacoes'].count(), 1)
        
        # Teste filtro por produto
        response = self.client.get(f"{reverse('produtos:historico')}?produto_id={self.produto.id}")
        self.assertEqual(response.context['movimentacoes'].count(), 2)
        
        # Teste filtro por data
        response = self.client.get(f"{reverse('produtos:historico')}?data_inicio={hoje}&data_fim={hoje}")
        self.assertEqual(response.context['movimentacoes'].count(), 2)
