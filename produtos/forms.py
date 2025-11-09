from django import forms
from .models import ProdutoModel
from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError

class ProdutoForm(forms.ModelForm):
    preco = forms.CharField(
        required=True,
        widget=forms.TextInput(
            attrs={
                'class': 'preco-mask',
                'placeholder': '0,00',
                'type': 'text',
                'inputmode': 'numeric',
                'pattern': '[0-9,.]*'
            }
        )
    )

    class Meta:
        model = ProdutoModel
        fields = '__all__'
        
        widgets = {
            'validade': forms.DateInput(
                format='%d/%m/%Y', 
                attrs={
                    'type': 'text', 
                    'class': 'date-mask', 
                }
            ),
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['validade'].input_formats = ['%d/%m/%Y', '%Y-%m-%d']
        
        # Form instanciado(Edicao do produto), formatar o preço
        if self.instance and self.instance.pk and self.instance.preco:
            valor = f"{self.instance.preco:,.2f}"
            self.initial['preco'] = valor.replace(",", "X").replace(".", ",").replace("X", ".")

    def clean_preco(self):
        """Converte valores formatados '1.234,56' para Decimal('1234.56')"""
        value = self.cleaned_data.get('preco')
        if value in (None, ''):
            return value

        if isinstance(value, str):
            try:
                #se ja tiver ponto retorna direto
                if '.' in value and ',' not in value:
                    return Decimal(value)
                
                #converte se o formato for Br
                if ',' in value:
                    partes = value.split(',')
                    if len(partes) == 2:
                        inteiros = partes[0].replace('.', '')
                        decimais = partes[1][:2] 
                        value = f"{inteiros}.{decimais}"
                        return Decimal(value)
                
                # Tentar converter direto
                return Decimal(value.replace(',', '.'))
            except (InvalidOperation, ValueError):
                raise ValidationError('Formato de preço inválido. Use 0,00.')

        return value