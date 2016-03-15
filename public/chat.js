window.onload = function() {
 
    var users = [];
    var socket = io.connect('0.0.0.0');
    var nickname = document.getElementById("nickname");
    var btnLogin = document.getElementById("login");
    var areaLogin = document.getElementById("area-login");
    var lobby = document.getElementById("lobby");
    var listaJogadores = document.getElementById("lista-jogadores");
    var checkboxCapitao = document.getElementById("ser-capitao");

    var time1 = document.getElementById("time1");
    var time2 = document.getElementById("time2");
    var jogadorEscolhido = "";

    var nick = "";
    var turno = 0;
 
    socket.on('capitao1_fez_login', function (data) {
        users.push(data.message);
        $('#time1 h3').html("Time 1: "+data.message);
    });

    socket.on('capitao2_fez_login', function (data) {
        users.push(data.message);
        $('#time2 h3').html("Time 2: "+data.message);
    });

    socket.on('limite_capitaes', function (data) {
        $('#ser-capitao').prop("disabled", true);
    });

    socket.on('mostra_jkp', function (data) {
        $('#jkp').css('display','block');
    });

    socket.on('jogador_fez_login', function (data) {
        users.push(data.message);
        var option = document.createElement("option");
        option.text = data.message;
        listaJogadores.add(option);
    });

    socket.on('sala_completa', function(data) {
        $('.container-fluid h2').html("JO-KEN-PO!");
        $('#lobby').css('display','block');
    });

    socket.on('resultado_jkp', function(data) {
        $('.container-fluid h2').html("O CAPITAO 1 ESCOLHEU: <span style='color: red'>" + data.var1 + "</span><br/> O CAPITAO 2 ESCOLHEU: <span style='color: red'>" + data.var2 + "</span><br/> VENCEDOR: <span style='color: blue'>" + data.var3 + "</span>");

        if(data.turnoinicial != 0) {

            $('#pedra , #papel , #tesoura').css('display','none');

            if(socket.id == data.idcap1) {

                if(data.turnoinicial == 1) {
                    $('#lista-jogadores, #seleciona-jogador').removeAttr('disabled');
                }

            } else if (socket.id == data.idcap2) {

                if(data.turnoinicial == 2) {
                    $('#lista-jogadores, #seleciona-jogador').removeAttr('disabled');               
                }

            }
        }

    });

    socket.on('jogador_escolhido', function(data) {

        switch (data.capitao) {

            case data.idcap1:
                time1.innerHTML = time1.innerHTML + ("<p>"+ data.jogador + "</p>");
                $('.container-fluid h2').html("O CAPITAO 1 ESCOLHEU <span style='color:red'>" + data.jogador + "</span> PARA SEU TIME!");
                break;

            case data.idcap2:
                 time2.innerHTML = time2.innerHTML + ("<p>"+ data.jogador + "</p>");
                 $('.container-fluid h2').html("O CAPITAO 2 ESCOLHEU <span style='color:red'>" + data.jogador + "</span> PARA SEU TIME!");
                break;

        }

        switch (data.turno) {

            case 1:
                if(socket.id == data.idcap1){ 
                    $('#lista-jogadores, #seleciona-jogador').removeAttr('disabled');
                } else if (socket.id == data.idcap2) {
                    $('#lista-jogadores, #seleciona-jogador').prop("disabled", true);
                }
            case 2:
                if(socket.id == data.idcap1){ 
                    $('#lista-jogadores, #seleciona-jogador').prop("disabled", true);
                } else if (socket.id == data.idcap2) {
                    $('#lista-jogadores, #seleciona-jogador').removeAttr('disabled');
                }

        }

        $("#lista-jogadores option:selected").remove();

        if( !$('#lista-jogadores').val() ) { 
            $('#lista').css('display', 'none');
            $('.container-fluid h2').html("SELEÇÃO DE MAPAS!");
            $('#lista-mapas').css('display', 'block');
        }

    });

    socket.on('atualiza_votacao', function(data) {
        $('div#votacao').html(data.votacao);

        if(data.votos == 10) {
            $('.container-fluid h2').html("VÃO TROCAR TIRO AGORA SEUS VIADO! TARATATAU!");
        }

    });
 
    /*FUNCÕES PARA BOTOES*/
    btnLogin.onclick = function() {

        var nick = nickname.value;
        $('#area-login').css('display','none');
        $('.container-fluid h2').html("Aguardando 10 jogadores se conectarem.");

        if ( checkboxCapitao.checked ) {
            socket.emit('login', { message: nick + ' (Capitão)', senderid: socket.id });
        } else {
            socket.emit('login', { message: nick });
        }
    };

    $('#jkp input').click(function() {

        switch( $(this).val() ) {
            case 'PEDRA':
                socket.emit('selecionei_jkp', {message: 'PEDRA', senderid: socket.id });
                break;
            case 'PAPEL':
                socket.emit('selecionei_jkp', {message: 'PAPEL', senderid: socket.id });
                break;
            case 'TESOURA':
                socket.emit('selecionei_jkp', {message: 'TESOURA', senderid: socket.id });
                break;
        }

    });

    $('#seleciona-jogador').click(function() {

        jogadorEscolhido = $('#lista-jogadores').val();
        socket.emit('jogador_escolhido', {jogador: jogadorEscolhido, capitao: socket.id });

    });

    $('#seleciona-mapa').click(function() {

        mapaVotado = $('#lista-mapa').val();
        socket.emit('mapa_votado', {mapa: mapaVotado });
        $('#lista-mapa, #seleciona-mapa').prop("disabled", true);

    });
 
}