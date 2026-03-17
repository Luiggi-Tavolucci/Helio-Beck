/* ========================================== */
/* INTEGRAÇÃO HEADLESS CMS - VITRINE (HOME)   */
/* ========================================== */

// Função assíncrona para buscar os posts no WordPress Local
async function carregarVitrine() {
    // A nossa div vazia lá do HTML
    const vitrineGrid = document.querySelector('.vitrine-grid');
    
    // Se não estivermos na página inicial (onde tem a vitrine), ele para o código aqui
    if (!vitrineGrid) return;

    // A URL da sua "Cozinha" (WordPress) + o pedido de 3 posts com as imagens embutidas
    const apiUrl = 'http://helio-beck-blog.local/wp-json/wp/v2/posts?_embed&per_page=3';

    try {
        // "Bate na porta" da API
        const resposta = await fetch(apiUrl);
        const posts = await resposta.json();

        // Limpa o aviso de "Carregando" (caso a gente coloque um)
        vitrineGrid.innerHTML = '';

        // Para cada post que a API devolveu, nós montamos um Card HTML
        posts.forEach(post => {
            // 1. Pegar a Imagem (se não tiver, usa uma foto genérica bonita)
            let imageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            if (post._embedded && post._embedded['wp:featuredmedia']) {
                imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
            }

            // 2. Pegar a Categoria (Pega a primeira categoria disponível)
            let categoriaNome = 'Artigo';
            if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0].length > 0) {
                categoriaNome = post._embedded['wp:term'][0][0].name;
            }

            // 3. Formatar a Data para o padrão Brasileiro
            const dataPost = new Date(post.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // 4. Limpar o Resumo (Tira as tags HTML que o WordPress manda junto)
            let resumoSujo = post.excerpt.rendered;
            let resumoLimpo = resumoSujo.replace(/(<([^>]+)>)/gi, "").substring(0, 160) + '...';

            // 5. O Link Inteligente (Passa a ID do post para a página artigo.html ler depois)
            const linkDoArtigo = `artigo.html?id=${post.id}`;

            // 6. Montar o "Molde" do Card
            const cardHTML = `
                <article class="vitrine-card">
                    <div class="vitrine-img">
                        <img src="${imageUrl}" alt="${post.title.rendered}">
                        <span class="vitrine-cat">${categoriaNome}</span>
                    </div>
                    <div class="vitrine-content">
                        <span class="vitrine-date">${dataPost}</span>
                        <h3>${post.title.rendered}</h3>
                        <p>${resumoLimpo}</p>
                        <a href="${linkDoArtigo}" target="_blank" class="vitrine-link">Ler artigo <span class="arrow">→</span></a>
                    </div>
                </article>
            `;

            // 7. Injeta o card montado dentro da nossa Div lá no HTML
            vitrineGrid.innerHTML += cardHTML;
        });

    } catch (erro) {
        console.error("Ops! Erro ao buscar os posts do WordPress:", erro);
        vitrineGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Não foi possível carregar os artigos no momento.</p>';
    }
}

// Manda a função rodar assim que a página carregar
carregarVitrine();


/* ========================================== */
/* INTEGRAÇÃO HEADLESS CMS - CATÁLOGO (BLOG)  */
/* ========================================== */

async function carregarBlogCompleto(paginaAtual = 1) {
    const blogGrid = document.getElementById('grid-do-blog'); 
    const paginacaoContainer = document.getElementById('paginacao-blog');
    
    if (!blogGrid) return;

    // Avisa que está carregando (útil quando clica na página 2)
    blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Carregando artigos...</p>';
    if(paginacaoContainer) paginacaoContainer.innerHTML = '';

    // URL agora inclui a página que queremos buscar (&page=...)
    const apiUrl = `http://helio-beck-blog.local/wp-json/wp/v2/posts?_embed&per_page=9&page=${paginaAtual}`;

    try {
        const resposta = await fetch(apiUrl);
        
        // Pega o "recibo" do WordPress informando o total de páginas
        const totalPaginas = resposta.headers.get('X-WP-TotalPages');
        const posts = await resposta.json();

        blogGrid.innerHTML = ''; // Limpa o "Carregando..."

        if (posts.length === 0) {
            blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Nenhum artigo publicado ainda.</p>';
            return;
        }

        // --- RENDERIZA OS CARDS (Mesmo código de antes) ---
        posts.forEach(post => {
            let imageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            if (post._embedded && post._embedded['wp:featuredmedia']) imageUrl = post._embedded['wp:featuredmedia'][0].source_url;

            let categoriaNome = 'Artigo';
            if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0].length > 0) categoriaNome = post._embedded['wp:term'][0][0].name;

            const dataPost = new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            let resumoLimpo = post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 160) + '...';
            const linkDoArtigo = `artigo.html?id=${post.id}`;

            const cardHTML = `
                <article class="vitrine-card fade-in">
                    <div class="vitrine-img">
                        <img src="${imageUrl}" alt="${post.title.rendered}">
                        <span class="vitrine-cat">${categoriaNome}</span>
                    </div>
                    <div class="vitrine-content">
                        <span class="vitrine-date">${dataPost}</span>
                        <h3>${post.title.rendered}</h3>
                        <p>${resumoLimpo}</p>
                        <a href="${linkDoArtigo}" target="_blank" class="vitrine-link">Ler artigo <span class="arrow">→</span></a>
                    </div>
                </article>
            `;
            blogGrid.innerHTML += cardHTML;
        });

        // --- RENDERIZA A PAGINAÇÃO AUTOMÁTICA ---
        if (paginacaoContainer && totalPaginas > 1) {
            let botoesHTML = '';
            for (let i = 1; i <= totalPaginas; i++) {
                // Se for a página atual, deixa o botão "ativo" (destacado)
                if (i === paginaAtual) {
                    botoesHTML += `<button class="btn-pagina ativo">${i}</button>`;
                } else {
                    botoesHTML += `<button class="btn-pagina" onclick="MudarPaginaBlog(${i})">${i}</button>`;
                }
            }
            paginacaoContainer.innerHTML = botoesHTML;
        }

    } catch (erro) {
        console.error("Ops! Erro:", erro);
        blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: red;">Não foi possível carregar os artigos.</p>';
    }
}

// Função para quando o usuário clicar em um número de página
function MudarPaginaBlog(novaPagina) {
    // 1. Rola a tela suavemente até um pouco acima do catálogo, 
    // evitando que o menu fixo do topo esconda o título
    const areaDoBlog = document.getElementById('grid-do-blog');
    const posicao = areaDoBlog.getBoundingClientRect().top + window.scrollY - 150; 
    
    window.scrollTo({
        top: posicao,
        behavior: 'smooth'
    });

    // 2. Carrega a nova página
    carregarBlogCompleto(novaPagina);
}



/* ========================================== */
/* INTEGRAÇÃO HEADLESS CMS - ARTIGO COMPLETO  */
/* ========================================== */

async function carregarArtigoUnico() {
    const artigoContainer = document.getElementById('artigo-dinamico');
    
    // Se não estivermos na página artigo.html, ignora
    if (!artigoContainer) return;

    // 1. O "Detetive": Lê a URL e pega o número do ID (ex: ?id=15)
    const parametrosUrl = new URLSearchParams(window.location.search);
    const postId = parametrosUrl.get('id');

    // Se alguém tentar abrir a página sem nenhum ID na URL
    if (!postId) {
        artigoContainer.innerHTML = '<p style="text-align:center; margin-top: 100px;">Artigo não encontrado. <a href="blog.html" style="color: var(--primary-color);">Voltar para o blog</a>.</p>';
        return;
    }

    // 2. A URL para buscar apenas ESTE post específico
    const apiUrl = `http://helio-beck-blog.local/wp-json/wp/v2/posts/${postId}?_embed`;

    try {
        const resposta = await fetch(apiUrl);
        if (!resposta.ok) throw new Error('Post não encontrado no banco de dados');
        
        const post = await resposta.json();

        // 3. Pegar a Imagem (Se existir)
        let imageUrl = '';
        if (post._embedded && post._embedded['wp:featuredmedia']) {
            imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
        }

        // 4. Pegar a Categoria
        let categoriaNome = 'Artigo';
        if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0].length > 0) {
            categoriaNome = post._embedded['wp:term'][0][0].name;
        }

        // 5. Data Formatada
        const dataPost = new Date(post.date).toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // 6. Montar a página usando a estrutura que desenhamos antes
        const conteudoHTML = `
            <div class="post-header container-sm">
                <span class="post-tag">${categoriaNome}</span>
                <h1 class="post-title">${post.title.rendered}</h1>
                
                <div class="post-meta">
                    <div class="author-info">
                        <img src="IMG/WhatsApp Image 2026-03-05 at 21.30.49.jpeg" alt="Helio Beck" class="author-avatar">
                        <div>
                            <strong>Helio Beck</strong>
                            <span>${dataPost}</span>
                        </div>
                    </div>
                </div>
            </div>

            ${imageUrl ? `
            <div class="post-cover container">
                <img src="${imageUrl}" alt="Capa do artigo">
            </div>` : ''}

            <article class="post-content container-sm">
                ${post.content.rendered}
            </article>

            <div class="post-cta container-sm">
                <h3>Invista na sua saúde</h3>
                <p>Agende agora mesmo sua consulta com Helio Beck e descubra como a Medicina do Estilo de Vida pode transformar sua vida.</p>
                <a href="index.html#contato" class="btn">Agendar Minha Consulta</a>
            </div>
        `;

        // 7. Injeta tudo na tela
        artigoContainer.innerHTML = conteudoHTML;

    } catch (erro) {
        console.error("Erro ao carregar o artigo:", erro);
        artigoContainer.innerHTML = '<p style="text-align:center; margin-top: 100px; color: red;">Não foi possível carregar o artigo. Verifique a conexão com o banco de dados.</p>';
    }
}

// Inicia a função do artigo
carregarArtigoUnico();