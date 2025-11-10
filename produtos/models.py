from django.db import models
from datetime import date

class MovimentacaoEstoque(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]
    
    produto = models.ForeignKey('ProdutoModel', on_delete=models.CASCADE, related_name='movimentacoes')
    tipo = models.CharField(max_length=7, choices=TIPO_CHOICES)
    quantidade = models.IntegerField()
    data_hora = models.DateTimeField(auto_now_add=True)
    observacao = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-data_hora']
        verbose_name = 'Movimentação de Estoque'
        verbose_name_plural = 'Movimentações de Estoque'
    
    def __str__(self):
        return f"{self.get_tipo_display()} de {self.quantidade} unidades de {self.produto.nome}"

class ProdutoModel(models.Model):
    #opcoes de categoria
    OPCOES_CATEGORIA = [
            ('alimento', 'Alimento'),
            ('bebida', 'Bebida'),
            ('higiene', 'Higiene'),
            ('limpeza', 'Limpeza'),
            ('outros', 'Outros'),
            ]
        
    nome = models.CharField(max_length=100)
    categoria = models.CharField(max_length=50, choices=OPCOES_CATEGORIA, default='outros')
    quantidade = models.IntegerField()
    lote = models.CharField(max_length=50, null=True, blank=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    validade = models.DateField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome
    
    @property
    def esta_vencido(self):
        # Compara a data de validade com a data de hoje
        return self.validade <= date.today()

    @property
    def dias_para_vencer(self):
        hoje = date.today()
        diferenca = self.validade - hoje 
        
        return diferenca.days

    @property
    def preco_formatado(self):
        if self.preco is None:
            return "0,00"
        valor = f"{self.preco:,.2f}"
        return valor.replace(",", "X").replace(".", ",").replace("X", ".")