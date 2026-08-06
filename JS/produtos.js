/* ========================================== */
/* CONFIGURAÇÃO GLOBAL E SEGURANÇA            */
/* ========================================== */

const URL_DO_WORDPRESS = 'https://painel.heliobeck.com.br'; 
const LINK_WHATSAPP = 'https://wa.me/message/3OIFAKX5ZLDVM1';

function sanitizarHTML(htmlSujo) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlSujo, 'text/html');
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    const todosElementos = doc.querySelectorAll('*');
    todosElementos.forEach(el => {
        for (let i = el.attributes.length - 1; i >= 0; i--) {
            const attr = el.attributes[i];
            if (attr.name.toLowerCase().startsWith('on')) el.removeAttribute(attr.name);
        }
    });
    return doc.body.innerHTML;
}

/* ========================================== */
/* INTEGRAÇÃO HEADLESS CMS - CATÁLOGO COMPLETO*/
/* ========================================== */

async function carregarCatalogoProdutos() {
    const produtosGrid = document.getElementById('grid-dos-produtos'); 
    
    if (!produtosGrid) return;

    // RESERVA ESPAÇO PARA O FOOTER NÃO PULAR
    produtosGrid.style.minHeight = "600px";
    produtosGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; padding-top: 50px;">Carregando catálogo de produtos...</p>';

    // Puxando do Custom Post Type 'produtos' do painel online
    const apiUrl = `${URL_DO_WORDPRESS}/wp-json/wp/v2/produtos?_embed&per_page=9`;

    try {
        const resposta = await fetch(apiUrl);
        const produtos = await resposta.json();

        console.log("Raio-X dos produtos online recebidos:", produtos);

        produtosGrid.innerHTML = ''; 

        if (produtos.length === 0) {
            produtosGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Nenhum produto disponível no momento.</p>';
            return;
        }

        produtos.forEach(produto => {
            // Imagem padrão caso o produto não tenha foto de capa no WP
            let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';
            if (produto._embedded && produto._embedded['wp:featuredmedia'] && produto._embedded['wp:featuredmedia'][0].source_url) {
                imageUrl = produto._embedded['wp:featuredmedia'][0].source_url;
            }

            let resumoLimpo = '';
            if (produto.excerpt && produto.excerpt.rendered) {
                resumoLimpo = produto.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 120) + '...';
            }
            
            let tituloSanitizado = sanitizarHTML(produto.title.rendered);
            const linkDoProduto = `produto-detalhe.html?id=${produto.id}`;

            const cardHTML = `
                <article class="vitrine-card fade-in">
                    <div class="vitrine-img">
                        <img src="${imageUrl}" alt="${tituloSanitizado}">
                        <span class="vitrine-cat">Programa</span>
                    </div>
                    <div class="vitrine-content">
                        <h3>${tituloSanitizado}</h3>
                        <p>${resumoLimpo}</p>
                        <a href="${linkDoProduto}" class="btn-outline-teal">
                            Saber Mais
                        </a>
                    </div>
                </article>
            `;
            
            produtosGrid.innerHTML += cardHTML;
        });

    } catch (erro) {
        console.error("Erro nos Produtos:", erro);
        produtosGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: red;">Erro ao carregar catálogo de produtos.</p>';
    }
}

carregarCatalogoProdutos();