/* ========================================== */
/* CONFIGURAÇÃO GLOBAL E SEGURANÇA            */
/* ========================================== */

const URL_DO_WORDPRESS = 'https://painel.heliobeck.com.br'; 
const LINK_WHATSAPP = 'https://wa.me/message/3OIFAKX5ZLDVM1';

function sanitizarHTML(htmlSujo) {
    if (!htmlSujo) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlSujo, 'text/html');
    return doc.body.textContent || "";
}

/* ========================================== */
/* O TRATOR: ESTILOS INLINE E BOTÕES DINÂMICOS*/
/* ========================================== */
function processarConteudoWP(htmlBruto, linkDeVendas) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlBruto, 'text/html');

    doc.querySelectorAll('script').forEach(script => script.remove());
    doc.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('width');
        el.removeAttribute('height');
        el.classList.remove('wp-block-video', 'elementor-video', 'wp-video', 'elementor-widget-video');
    });

    doc.querySelectorAll('img').forEach(imgAntiga => {
        const src = imgAntiga.getAttribute('src') || imgAntiga.getAttribute('data-src');
        if (src) {
            const imgNova = doc.createElement('img');
            imgNova.src = src;
            imgNova.alt = imgAntiga.getAttribute('alt') || '';
            imgNova.style.cssText = "display: block !important; margin: 30px auto !important; max-width: 100% !important; height: auto !important; max-height: 450px !important; object-fit: contain !important; border-radius: 12px !important;";
            imgAntiga.parentNode.replaceChild(imgNova, imgAntiga);
        }
    });

    doc.querySelectorAll('video').forEach(videoAntigo => {
        const source = videoAntigo.querySelector('source');
        let src = videoAntigo.getAttribute('src') || (source ? source.getAttribute('src') : '');
        if (!src) src = videoAntigo.getAttribute('data-src');
        
        if (src) {
            const wrapper = doc.createElement('div');
            wrapper.style.cssText = "display: flex !important; justify-content: center !important; width: 100% !important; margin: 30px auto !important; background: transparent !important;";

            const videoNovo = doc.createElement('video');
            videoNovo.src = src;
            videoNovo.controls = true; 
            videoNovo.style.cssText = "width: auto !important; max-width: 100% !important; height: auto !important; max-height: 450px !important; object-fit: contain !important; border-radius: 12px !important; background-color: #000 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;";
            
            wrapper.appendChild(videoNovo);
            videoAntigo.parentNode.replaceChild(wrapper, videoAntigo);
        }
    });

    doc.querySelectorAll('iframe, embed').forEach(iframeAntigo => {
        const src = iframeAntigo.getAttribute('src') || iframeAntigo.getAttribute('data-src');
        if (src) {
            const wrapper = doc.createElement('div');
            wrapper.style.cssText = "position: relative !important; width: 100% !important; max-width: 800px !important; aspect-ratio: 16 / 9 !important; margin: 40px auto !important; border-radius: 12px !important; overflow: hidden !important; background-color: #000 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;";

            const iframeNovo = doc.createElement('iframe');
            iframeNovo.src = src;
            iframeNovo.setAttribute('allowfullscreen', 'true');
            iframeNovo.style.cssText = "position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border: none !important;";

            wrapper.appendChild(iframeNovo);
            iframeAntigo.parentNode.replaceChild(wrapper, iframeAntigo);
        }
    });

    if (linkDeVendas) {
        const todosParagrafos = doc.querySelectorAll('p');
        const paragrafosValidos = Array.from(todosParagrafos).filter(p => p.textContent.trim().length > 40);
        const intervalo = 4; 
        
        paragrafosValidos.forEach((p, index) => {
            if ((index + 1) % intervalo === 0 && index !== paragrafosValidos.length - 1) {
                const divBotao = doc.createElement('div');
                divBotao.className = 'cta-produto-container';
                divBotao.style.cssText = "text-align: center; margin: 50px auto; padding: 15px 0;";
                
                divBotao.innerHTML = `
                    <a href="${linkDeVendas}" target="_blank" class="btn" style="padding: 16px 35px; font-size: 1.1rem; width: 100%; max-width: 380px;">
                        Compre agora!
                    </a>
                `;
                p.parentNode.insertBefore(divBotao, p.nextSibling);
            }
        });
    }

    return doc.body.innerHTML;
}

/* ========================================== */
/* FUNÇÃO DO CRONÔMETRO (URGÊNCIA DIÁRIA)     */
/* ========================================== */
function iniciarCronometro() {
    const agora = new Date();
    const meiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 0);

    const intervalo = setInterval(() => {
        const tempoAtual = new Date().getTime();
        const diferenca = meiaNoite.getTime() - tempoAtual;

        if (diferenca < 0) {
            clearInterval(intervalo);
            return; 
        }

        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        const elHoras = document.getElementById('cron-horas');
        const elMinutos = document.getElementById('cron-minutos');
        const elSegundos = document.getElementById('cron-segundos');

        if(elHoras) elHoras.innerText = horas < 10 ? '0' + horas : horas;
        if(elMinutos) elMinutos.innerText = minutos < 10 ? '0' + minutos : minutos;
        if(elSegundos) elSegundos.innerText = segundos < 10 ? '0' + segundos : segundos;
        
    }, 1000);
}

/* ========================================== */
/* CARREGAR PRODUTO DETALHE DINÂMICO          */
/* ========================================== */
async function carregarProdutoUnico() {
    const produtoContainer = document.getElementById('produto-dinamico');
    if (!produtoContainer) return;

    const parametrosUrl = new URLSearchParams(window.location.search);
    const produtoId = parametrosUrl.get('id');

    if (!produtoId) {
        produtoContainer.innerHTML = '<p style="text-align:center; margin-top: 100px; padding: 20px;">Produto não especificado.</p>';
        return;
    }

    const apiUrl = `${URL_DO_WORDPRESS}/wp-json/wp/v2/produtos/${produtoId}?_embed`;

    try {
        const resposta = await fetch(apiUrl);
        if (!resposta.ok) throw new Error("Produto não encontrado.");
        
        const produto = await resposta.json();

        const tituloProduto = sanitizarHTML(produto.title.rendered);
        document.title = `${tituloProduto} | Helio Beck Nutrição`;

        let imageUrl = '';
        if (produto._embedded && produto._embedded['wp:featuredmedia']) {
            imageUrl = produto._embedded['wp:featuredmedia'][0].source_url;
        }

        let categoriaNome = 'Programa';
        if (produto._embedded && produto._embedded['wp:term'] && produto._embedded['wp:term'][0].length > 0) {
            categoriaNome = produto._embedded['wp:term'][0][0].name;
        }

        let linkVendas = LINK_WHATSAPP;
        if (produto.acf && produto.acf.link_de_vendas) {
            linkVendas = produto.acf.link_de_vendas;
        }

        let ofertaTitulo = "Pronto para começar sua transformação?";
        let ofertaDesc = `Adquira o <b>${tituloProduto}</b> e sinta a diferença no seu corpo. Mude seus hábitos e alcance seus resultados.`;
        let ofertaDestaque = "Aproveite esta oportunidade! ✨";
        let precoAntigo = "De R$ 67";
        let precoNovo = "Por apenas R$ 37";
        let textoUrgencia = "VAMOS APROVEITAR ANTES DA PROMOÇÃO ACABAR!";
        let textoBotao = "Sim, quero garantir meu acesso!";

        if (produto.acf) {
            if (produto.acf.oferta_titulo) ofertaTitulo = produto.acf.oferta_titulo;
            if (produto.acf.oferta_descricao) ofertaDesc = produto.acf.oferta_descricao;
            if (produto.acf.oferta_destaque) ofertaDestaque = produto.acf.oferta_destaque;
            if (produto.acf.preco_antigo) precoAntigo = produto.acf.preco_antigo;
            if (produto.acf.preco_novo) precoNovo = produto.acf.preco_novo;
            if (produto.acf.texto_urgencia) textoUrgencia = produto.acf.texto_urgencia;
            if (produto.acf.texto_botao) textoBotao = produto.acf.texto_botao;
        }

        const conteudoProcessado = processarConteudoWP(produto.content.rendered, linkVendas);

        const conteudoHTML = `
            <!-- ESTILOS DO CARTÃO BLINDADOS -->
            <style>
                .oferta-card-blindada { background-color: #172d22 !important; color: #ffffff !important; border-radius: 24px !important; padding: 40px 30px !important; text-align: center !important; max-width: 500px !important; margin: 60px auto !important; box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important; font-family: inherit !important; }
                /* ALINHAMENTO DO TÍTULO CORRIGIDO ABAIXO: text-align: center adicionado */
                .oferta-card-blindada h2 { text-align: center !important; font-size: 2.2rem !important; font-weight: 700 !important; margin-bottom: 20px !important; line-height: 1.2 !important; color: #ffffff !important; }
                .oferta-card-blindada .oferta-desc { font-size: 1rem !important; line-height: 1.6 !important; color: #d1d5db !important; margin-bottom: 20px !important; }
                .oferta-card-blindada .oferta-energia { font-size: 1.1rem !important; margin-bottom: 20px !important; color: #ffffff !important; }
                .oferta-card-blindada .preco-antigo { display: block !important; font-size: 1rem !important; color: #6b7280 !important; text-decoration: line-through !important; margin-bottom: 5px !important; }
                .oferta-card-blindada .preco-novo { display: block !important; font-size: 2.5rem !important; font-weight: 700 !important; color: #1ed786 !important; margin-bottom: 30px !important; }
                .oferta-card-blindada .oferta-urgencia { color: #1ed786 !important; font-size: 0.95rem !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 1px !important; margin-bottom: 20px !important; }
                .oferta-card-blindada .cronometro { display: flex !important; justify-content: center !important; gap: 12px !important; margin-bottom: 30px !important; }
                .oferta-card-blindada .tempo-box { display: flex !important; flex-direction: column !important; align-items: center !important; }
                .oferta-card-blindada .tempo-box span { background-color: #1ed786 !important; color: #172d22 !important; font-size: 1.8rem !important; font-weight: 800 !important; padding: 12px 14px !important; border-radius: 8px !important; min-width: 65px !important; box-sizing: border-box !important; }
                .oferta-card-blindada .tempo-box small { margin-top: 8px !important; font-size: 0.75rem !important; font-weight: 700 !important; letter-spacing: 1px !important; color: #ffffff !important; }
                .oferta-card-blindada .btn-oferta { display: inline-block !important; background-color: #1ed786 !important; color: #172d22 !important; font-weight: 800 !important; font-size: 1.15rem !important; padding: 20px 20px !important; border-radius: 50px !important; text-decoration: none !important; width: 100% !important; max-width: 400px !important; box-sizing: border-box !important; transition: transform 0.2s, box-shadow 0.2s !important; }
                .oferta-card-blindada .btn-oferta:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 25px rgba(30, 215, 134, 0.4) !important; color: #172d22 !important; }
                @media (max-width: 480px) { .oferta-card-blindada { padding: 30px 20px !important; } .oferta-card-blindada h2 { font-size: 1.8rem !important; } .oferta-card-blindada .tempo-box span { font-size: 1.5rem !important; padding: 10px !important; min-width: 55px !important; } .oferta-card-blindada .cronometro { gap: 8px !important; } }
            </style>

            <div class="post-header container-sm">
                <span class="post-tag">${sanitizarHTML(categoriaNome)}</span>
                <h1 class="post-title">${tituloProduto}</h1>
            </div>
            
            ${imageUrl ? `<div class="post-cover container"><img src="${imageUrl}" alt="${tituloProduto}"></div>` : ''}
            
            <article class="post-content container-sm wp-responsivo">
                ${conteudoProcessado}
                
                <!-- CARTÃO DE OFERTA COM CRONÔMETRO -->
                <div class="oferta-card-blindada">
                    <h2>${ofertaTitulo}</h2>
                    
                    <p class="oferta-desc">
                        ${ofertaDesc}
                    </p>
                    
                    <p class="oferta-energia">${ofertaDestaque}</p>
                    
                    <div>
                        <span class="preco-antigo">${precoAntigo}</span>
                        <span class="preco-novo">${precoNovo}</span>
                    </div>
                    
                    <p class="oferta-urgencia">${textoUrgencia}</p>
                    
                    <div class="cronometro">
                        <div class="tempo-box">
                            <span>00</span>
                            <small>DIAS</small>
                        </div>
                        <div class="tempo-box">
                            <span id="cron-horas">23</span>
                            <small>HORAS</small>
                        </div>
                        <div class="tempo-box">
                            <span id="cron-minutos">59</span>
                            <small>MINUTOS</small>
                        </div>
                        <div class="tempo-box">
                            <span id="cron-segundos">59</span>
                            <small>SEGUNDOS</small>
                        </div>
                    </div>
                    
                    <a href="${linkVendas}" target="_blank" class="btn-oferta">${textoBotao}</a>
                </div>

            </article>
        `;

        produtoContainer.innerHTML = conteudoHTML;
        
        iniciarCronometro();

    } catch (erro) {
        console.error("Erro ao carregar os detalhes do produto:", erro);
        produtoContainer.innerHTML = '<p style="text-align:center; color: red; margin-top: 100px; padding: 20px;">Não foi possível carregar as informações deste produto.</p>';
    }
}

carregarProdutoUnico();