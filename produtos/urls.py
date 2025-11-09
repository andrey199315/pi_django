from django.urls import path
from . import views

app_name = 'produtos'

urlpatterns = [
    path('', views.cadastrar_produto, name='cadastrar'),  # Página inicial
    path('excluir/<int:id>', views.excluir_produto, name='excluir'),
    path('editar/<int:id>', views.editar_produto, name='editar'),
    path('saida-estoque/', views.saida_estoque, name='saida_estoque'),
    path('entrada-estoque/', views.entrada_estoque, name='entrada_estoque'),
    path('limpar/', views.limpar_estoque, name='limpar')
]
