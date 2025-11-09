from django.db import models
from datetime import date

# Create your models here.
class ProdutoModel(models.Model):
    #fornecendo as opcoes de categoria
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

    def __str__(self):
        return self.nome
    
    @property
    def esta_vencido(self):
        # Comparamos a data de validade (self.validade) com a data de hoje (date.today())
        return self.validade <= date.today()

    @property
    def dias_para_vencer(self):
        hoje = date.today()
        diferenca = self.validade - hoje 
        
        # Retornamos o número de dias
        return diferenca.days

    @property
    def preco_formatado(self):
        """Retorna o preço formatado no estilo brasileiro: 1.234,56"""
        if self.preco is None:
            return "0,00"
        # Converter para string com 2 casas decimais
        valor = f"{self.preco:,.2f}"
        # Trocar ponto por vírgula e vírgula por ponto
        return valor.replace(",", "X").replace(".", ",").replace("X", ".")