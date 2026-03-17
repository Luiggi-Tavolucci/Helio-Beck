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
            let resumoLimpo = resumoSujo.replace(/(<([^>]+)>)/gi, "").substring(0, 110) + '...';

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