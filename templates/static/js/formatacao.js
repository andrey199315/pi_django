//formata a data do CADASTRO
$(document).ready(function(){
    $('#id_validade').mask('00/00/0000'); 

    //coloca mascara no preco e o preço é inserido a partir dos centavos
    $('#id_preco').mask('#.##0,00', {
        reverse: true,
    });
    
    //formata a data do EDITAR
    $('.date-mask').mask('00/00/0000');

    // Configuração do botão fixo de comando de voz
    $('#botao-voz-fixed').on('click', function() {
        // Simula o clique no botão principal de comando de voz
        $('#btn-voz').click();
        
        // Faz scroll suave até a seção de comando de voz
        $('html, body').animate({
            scrollTop: $('.voice-control-section').offset().top - 100
        }, 500);
    });
});
