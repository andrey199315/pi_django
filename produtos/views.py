from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import HttpRequest
from .forms import ProdutoForm
from .models import ProdutoModel, MovimentacaoEstoque
import json
import logging

logger = logging.getLogger(__name__)

#cadastra produtos 
def cadastrar_produto(request:HttpRequest):

    #para envio dos dados em formato JSON para o JS
    produtos = ProdutoModel.objects.all().order_by('validade')
        
    produtos_json_safe = []
        
    for produto in produtos:
        produtos_json_safe.append({
           
            #usados para a barra de pesquisa
            'nome': produto.nome,
            'categoria': produto.categoria,
            'quantidade': produto.quantidade,
            'preco': str(produto.preco),
            'preco_formatado': produto.preco_formatado,
           
           
            'id': produto.id,
            'name': produto.nome,
            'is_expired': produto.esta_vencido,
            'days_diff': produto.dias_para_vencer,
            'lot': produto.lote if produto.lote else 'N/A',
            'expiry': produto.validade.isoformat(), 
            'created': produto.criado_em.isoformat() if getattr(produto, 'criado_em', None) else None,
        })

    contexto = {
        'produtos': produtos,
        'produtos_data_json': produtos_json_safe, #Para o JS
    }
    
    #instancia o form com a requisicao GET e salva com a requisicao POST
    if request.method == 'GET':    
        contexto['form'] = ProdutoForm()
        return render(request, 'home.html', contexto)  
        
    elif request.method == 'POST':
        form = ProdutoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('produtos:cadastrar')
        else:
            # re-renderizar o template com contexto completo
            logger.error('Form inválido ao cadastrar: %s', form.errors.as_json())
            contexto['form'] = form
            return render(request, 'home.html', contexto)
        
#editar produto
def editar_produto(request, id):
    produto = get_object_or_404(ProdutoModel, id=id)
    
    produtos = ProdutoModel.objects.all().order_by('validade')
        
    produtos_json_safe = []
        
    for product in produtos:
        produtos_json_safe.append({
            'id': product.id,
            'name': product.nome,
            'is_expired': product.esta_vencido,
            'days_diff': product.dias_para_vencer,
            'lot': product.lote if product.lote else 'N/A',
            'expiry': product.validade.isoformat(), 
            'created': product.criado_em.isoformat() if getattr(product, 'criado_em', None) else None,
        })

    contexto = {
        'produtos': produtos,
        'produtos_data_json': produtos_json_safe, # Para o JS
        'produto': produto,
        'form': ProdutoForm(instance=produto),

    }
    
    if request.method == 'POST':
        form = ProdutoForm(request.POST, instance=produto)
        if form.is_valid():
            form.save()
            return redirect('produtos:cadastrar')
        else:
            # form inválido: logar erros e re-renderizar com contexto (para que o JS receba produtos_data_json)
            logger.error('Form inválido ao editar produto id=%s: %s', id, form.errors.as_json())
            contexto['form'] = form
            return render(request, 'editar.html', contexto)
    else:
        form = ProdutoForm(instance=produto)
        contexto['form'] = form

    return render(request, 'editar.html', contexto)
    
#excluir produto
def excluir_produto(request, id):
    produto = get_object_or_404(ProdutoModel, id=id)
    produto.delete()
    return redirect('produtos:cadastrar')

def limpar_estoque(request):
    if request.method == 'POST':
        estoque = ProdutoModel.objects.all().delete()
        return redirect('produtos:cadastrar')
    else:
        return redirect('produtos:cadastrar')

from django.contrib import messages

def saida_estoque(request):
    if request.method == 'POST':
        produto_id = request.POST.get('produto_id')
        quantidade_saida = int(request.POST.get('quantidade_saida', 0))
        observacao = request.POST.get('observacao', '')
        
        try:
            produto = ProdutoModel.objects.get(id=produto_id)
            if produto.quantidade >= quantidade_saida:
                produto.quantidade -= quantidade_saida
                produto.save()
                
                # Registra a movimentação
                MovimentacaoEstoque.objects.create(
                    produto=produto,
                    tipo='saida',
                    quantidade=quantidade_saida,
                    observacao=observacao
                )
                
                messages.success(request, f'Saída de {quantidade_saida} unidades de {produto.nome} registrada com sucesso!')
            else:
                messages.error(request, 'Quantidade insuficiente em estoque!')
        except ProdutoModel.DoesNotExist:
            messages.error(request, 'Produto não encontrado!')
        except Exception as e:
            messages.error(request, f'Erro ao registrar saída: {str(e)}')
            
    return redirect('produtos:cadastrar')

def entrada_estoque(request):
    if request.method == 'POST':
        produto_id = request.POST.get('produto_id')
        quantidade_entrada = int(request.POST.get('quantidade_entrada', 0))
        observacao = request.POST.get('observacao', '')
        
        try:
            produto = ProdutoModel.objects.get(id=produto_id)
            if quantidade_entrada > 0:
                produto.quantidade += quantidade_entrada
                produto.save()
                
                # Registra a movimentação
                MovimentacaoEstoque.objects.create(
                    produto=produto,
                    tipo='entrada',
                    quantidade=quantidade_entrada,
                    observacao=observacao
                )
                
                messages.success(request, f'Entrada de {quantidade_entrada} unidades de {produto.nome} registrada com sucesso!')
            else:
                messages.error(request, 'A quantidade deve ser maior que zero!')
        except ProdutoModel.DoesNotExist:
            messages.error(request, 'Produto não encontrado!')
        except Exception as e:
            messages.error(request, f'Erro ao registrar entrada: {str(e)}')
            
    return redirect('produtos:cadastrar')

def historico_movimentacoes(request):
    from datetime import datetime, timedelta
    from django.db.models import Q
    
    # Filtros
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')
    produto_id = request.GET.get('produto_id')
    tipo = request.GET.get('tipo')
    
    # Query base
    movimentacoes = MovimentacaoEstoque.objects.select_related('produto').all()
    
    # Aplicar filtros
    if data_inicio:
        try:
            data_inicio = datetime.strptime(data_inicio, '%Y-%m-%d')
            movimentacoes = movimentacoes.filter(data_hora__date__gte=data_inicio)
        except ValueError:
            messages.error(request, 'Data inicial inválida')
    
    if data_fim:
        try:
            data_fim = datetime.strptime(data_fim, '%Y-%m-%d')
            # Adiciona 1 dia menos 1 segundo para pegar o dia inteiro
            data_fim = data_fim + timedelta(days=1, seconds=-1)
            movimentacoes = movimentacoes.filter(data_hora__date__lte=data_fim)
        except ValueError:
            messages.error(request, 'Data final inválida')
    
    if produto_id:
        movimentacoes = movimentacoes.filter(produto_id=produto_id)
    
    if tipo:
        movimentacoes = movimentacoes.filter(tipo=tipo)
    
    # Lista de produtos para o filtro
    produtos = ProdutoModel.objects.all()
    
    contexto = {
        'movimentacoes': movimentacoes,
        'produtos': produtos,
        'filtros': {
            'data_inicio': data_inicio.strftime('%Y-%m-%d') if data_inicio else '',
            'data_fim': data_fim.strftime('%Y-%m-%d') if isinstance(data_fim, datetime) else '',
            'produto_id': produto_id,
            'tipo': tipo,
        }
    }
    
    return render(request, 'historico_movimentacoes.html', contexto)