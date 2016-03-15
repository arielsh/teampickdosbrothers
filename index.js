var express = require("express");
var app = express();
var port = 3700;

/*USO DA APLICACAO*/
var capitaes = 0;
var jogadores = 0;
var capitao1 = "";
var capitao2 = "";
var escolha1 = "";
var escolha2 = "";
var vencedor = "";
var turno = 0;

/*CONTROLE VOTACAO DE MAPAS*/
var de_cache = 0, de_cobble = 0, de_dust2 = 0, de_inferno = 0, de_mirage = 0, de_overpass = 0, de_train = 0;
 
var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {

	if (capitaes == 2) {
    	io.sockets.emit('limite_capitaes');
    }

    socket.on('login', function (data) {

    	jogadores++;

    	if ( (data.message).indexOf("(Capitão)") >= 0) {
    		capitaes++;

    		if(capitaes == 1){
    			capitao1 = data.senderid;
    		} else {
    			capitao2 = data.senderid;
    		}

    		if (capitaes < 3 ) {
    			io.sockets.emit('capitao'+capitaes+"_fez_login" , { message: data.message });
    			socket.emit('mostra_jkp');
    		}

    		if (capitaes == 2) {
		    	io.sockets.emit('limite_capitaes');
		    }

    	} else {

       		io.sockets.emit('jogador_fez_login', { message: data.message });

        }

        if (jogadores == 2) {
	    	io.sockets.emit('sala_completa');
    	}

    });

    socket.on('selecionei_jkp', function (data) {
    	if(data.senderid == capitao1) {
    		escolha1 = data.message;
    	} else if (data.senderid == capitao2) {
    		escolha2 = data.message;
    	}

    	if ( (escolha1 && escolha2) != "") {

    		if( (escolha1 == "PEDRA" && escolha2 == "TESOURA") ||
    			(escolha1 == "TESOURA" && escolha2 == "PAPEL") ||
    			(escolha1 == "PAPEL" && escolha2 == "PEDRA") ){

    			vencedor = "CAPITAO 1";

    			turno = 1;

    		} else if (escolha1 == escolha2 ) {

    			vencedor = "NINGUEM";

    		} else {
    			vencedor = "CAPITAO 2";
    			turno = 2;

    		}

    		io.sockets.emit('resultado_jkp', { var1: escolha1, var2: escolha2, var3: vencedor, idcap1: capitao1,idcap2: capitao2, turnoinicial: turno });
    		escolha1 = "";
    		escolha2 = "";
    		vencedor = "";

    	}

    });

    socket.on('jogador_escolhido', function (data) {

    	if(turno == 1) { turno++ } else { turno-- };

    	io.sockets.emit('jogador_escolhido', { jogador: data.jogador, capitao: data.capitao, idcap1: capitao1, idcap2: capitao2, turno: turno });

    });

    socket.on('mapa_votado', function (data) {

    	switch(data.mapa) {
    		case 'de_cache':
    			de_cache++;
    			break;
    		case 'de_cobble':
    			de_cobble++;
    			break;
    		case 'de_dust2':
    			de_dust2++;
    			break;
    		case 'de_inferno':
    			de_inferno++;
    			break;
    		case 'de_mirage':
    			de_mirage++;
    			break;
    		case 'de_overpass':
    			de_overpass++;
    			break;
    		case 'de_train':
    			de_train++;
    			break;
    	}

    	votacao = '<h3>Votação:</h3> <b>CRECHE:</b> '+ de_cache +'<br/> <b>INFERNO:</b> '+ de_inferno +'<br/> <b>QUEDA:</b> '+ de_cobble +'<br/> <b>POEIRA 2:</b> ' + de_dust2 + '<br/> <b>MIRRAJI:</b> '+ de_mirage +'<br/> <b>OVERPASSO:</b> ' + de_overpass + '<br/> <b>TREM:</b> '+ de_train;

    	total_votos = de_cache + de_cobble + de_dust2 + de_inferno + de_mirage + de_overpass + de_train;

    	io.sockets.emit('atualiza_votacao', {votacao: votacao, votos: total_votos});

    });

});


console.log("Listening on port " + port);

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("index");
});

app.use(express.static(__dirname + '/public'));