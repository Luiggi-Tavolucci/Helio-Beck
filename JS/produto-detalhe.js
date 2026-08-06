/* ========================================== */
/* CONFIGURAÇÃO GLOBAL E SEGURANÇA            */
/* ========================================== */

const URL_DO_WORDPRESS = 'https://painel.heliobeck.com.br'; 
const LINK_WHATSAPP = 'https://wa.me/message/3OIFAKX5ZLDVM1';

function sanitizarHTML(htmlSujo) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlSujo, 'text/html');
    return doc.body.textContent || "";
}

/* ========================================== */
/* O TRATOR DEFINITIVO: ESTILOS INLINE (NUKE) */
/* ========================================== */
function processarConteudoWP(htmlBruto) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlBruto, 'text/html');

    // 1. Limpeza de Segurança
    doc.querySelectorAll('script').forEach(script => script.remove());
    
    // 2. Destruir as amarras e remover classes perigosas do Elementor/WP
    doc.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('width');
        el.removeAttribute('height');
        // Remove as classes que o WP usa para forçar tamanhos distorcidos
        el.classList.remove('wp-block-video', 'elementor-video', 'wp-video', 'elementor-widget-video');
    });

    // 3. IMAGENS - Injeção direta de estilo inquebrável
    doc.querySelectorAll('img').forEach(imgAntiga => {
        const src = imgAntiga.getAttribute('src') || imgAntiga.getAttribute('data-src');
        if (src) {
            const imgNova = doc.createElement('img');
            imgNova.src = src;
            imgNova.alt = imgAntiga.getAttribute('alt') || '';
            
            // A REGRA ABSOLUTA INJETADA NO HTML:
            imgNova.style.cssText = "display: block !important; margin: 30px auto !important; max-width: 100% !important; height: auto !important; max-height: 450px !important; object-fit: contain !important; border-radius: 12px !important;";
            
            imgAntiga.parentNode.replaceChild(imgNova, imgAntiga);
        }
    });

    // 4. VÍDEOS NATIVOS (.mp4) - Controle de proporção forçado
    doc.querySelectorAll('video').forEach(videoAntigo => {
        const source = videoAntigo.querySelector('source');
        let src = videoAntigo.getAttribute('src') || (source ? source.getAttribute('src') : '');
        if (!src) src = videoAntigo.getAttribute('data-src');
        
        if (src) {
            // Container invisível só para centralizar perfeitamente
            const wrapper = doc.createElement('div');
            wrapper.style.cssText = "display: flex !important; justify-content: center !important; width: 100% !important; margin: 30px auto !important; background: transparent !important;";

            const videoNovo = doc.createElement('video');
            videoNovo.src = src;
            videoNovo.controls = true; 
            
            // A REGRA ABSOLUTA PARA DOMAR O VÍDEO VERTICAL:
            // "Sua altura NUNCA passará de 450px e sua largura se calculará sozinha"
            videoNovo.style.cssText = "width: auto !important; max-width: 100% !important; height: auto !important; max-height: 450px !important; object-fit: contain !important; border-radius: 12px !important; background-color: #000 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;";
            
            wrapper.appendChild(videoNovo);
            videoAntigo.parentNode.replaceChild(wrapper, videoAntigo);
        }
    });

    // 5. YOUTUBE / VIMEO - Proporção exata de cinema 16:9
    doc.querySelectorAll('iframe, embed').forEach(iframeAntigo => {
        const src = iframeAntigo.getAttribute('src') || iframeAntigo.getAttribute('data-src');
        if (src) {
            const wrapper = doc.createElement('div');
            // Container forçando a proporção e fundo preto
            wrapper.style.cssText = "position: relative !important; width: 100% !important; max-width: 800px !important; aspect-ratio: 16 / 9 !important; margin: 40px auto !important; border-radius: 12px !important; overflow: hidden !important; background-color: #000 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;";

            const iframeNovo = doc.createElement('iframe');
            iframeNovo.src = src;
            iframeNovo.setAttribute('allowfullscreen', 'true');
            // Iframe preenchendo 100% do container
            iframeNovo.style.cssText = "position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border: none !important;";

            wrapper.appendChild(iframeNovo);
            iframeAntigo.parentNode.replaceChild(wrapper, iframeAntigo);
        }
    });

    return doc.body.innerHTML;
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

        document.title = `${sanitizarHTML(produto.title.rendered)} | Helio Beck Nutrição`;

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

        // Executa a nossa injeção de CSS
        const conteudoProcessado = processarConteudoWP(produto.content.rendered);

        const conteudoHTML = `
            <div class="post-header container-sm">
                <span class="post-tag">${sanitizarHTML(categoriaNome)}</span>
                <h1 class="post-title">${sanitizarHTML(produto.title.rendered)}</h1>
            </div>
            
            ${imageUrl ? `<div class="post-cover container"><img src="${imageUrl}" alt="${sanitizarHTML(produto.title.rendered)}"></div>` : ''}
            
            <article class="post-content container-sm wp-responsivo">
                ${conteudoProcessado}
                
                <div class="cta-produto-container" style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px dashed #eee;">
                    <a href="${linkVendas}" target="_blank" class="btn" style="padding: 16px 35px; font-size: 1.1rem; width: 100%; max-width: 380px;">
                        Quero Garantir Meu Acesso
                    </a>
                </div>
            </article>
        `;

        produtoContainer.innerHTML = conteudoHTML;

    } catch (erro) {
        console.error("Erro ao carregar os detalhes do produto:", erro);
        produtoContainer.innerHTML = '<p style="text-align:center; color: red; margin-top: 100px; padding: 20px;">Não foi possível carregar as informações deste produto.</p>';
    }
}

carregarProdutoUnico();