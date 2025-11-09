from django.contrib import admin
from django.urls import path, include
from produtos.views import cadastrar_produto 

urlpatterns = [
    path('', include('produtos.urls')),
    path('admin/', admin.site.urls)
]
