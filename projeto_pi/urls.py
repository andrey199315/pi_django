from django.contrib import admin
from django.urls import path, include
from produtos.views import cadastrar_produto  # Importa a view diretamente

urlpatterns = [
    path('', include('produtos.urls')),  # Inclui as URLs do app na raiz
    path('admin/', admin.site.urls)
]
