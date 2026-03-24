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
/* INTEGRAÇÃO HEADLESS CMS - VITRINE (HOME)   */
/* ========================================== */

async function carregarVitrine() {
    const vitrineGrid = document.querySelector('.vitrine-grid');
    if (!vitrineGrid) return;

    // RESERVA ESPAÇO PARA O FOOTER NÃO PULAR
    vitrineGrid.style.minHeight = "500px";

    const apiUrl = `${URL_DO_WORDPRESS}/wp-json/wp/v2/posts?_embed&per_page=3`;

    try {
        const resposta = await fetch(apiUrl);
        const posts = await resposta.json();

        vitrineGrid.innerHTML = '';

        posts.forEach(post => {
            let imageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            if (post._embedded && post._embedded['wp:featuredmedia']) {
                imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
            }

            let categoriaNome = 'Artigo';
            if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0].length > 0) {
                categoriaNome = post._embedded['wp:term'][0][0].name;
            }

            const dataPost = new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            let resumoLimpo = post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 160) + '...';
            
            let tituloSanitizado = sanitizarHTML(post.title.rendered);
            const linkDoArtigo = `artigo.html?id=${post.id}`;

            const cardHTML = `
                <article class="vitrine-card">
                    <div class="vitrine-img">
                        <img src="${imageUrl}" alt="${tituloSanitizado}">
                        <span class="vitrine-cat">${categoriaNome}</span>
                    </div>
                    <div class="vitrine-content">
                        <span class="vitrine-date">${dataPost}</span>
                        <h3>${tituloSanitizado}</h3>
                        <p>${resumoLimpo}</p>
                        <a href="${linkDoArtigo}" target="_blank" class="vitrine-link">Ler artigo <span class="arrow">→</span></a>
                    </div>
                </article>
            `;

            vitrineGrid.innerHTML += cardHTML;
        });

    } catch (erro) {
        console.error("Erro na Vitrine:", erro);
        vitrineGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Não foi possível carregar os artigos.</p>';
    }
}

carregarVitrine();

/* ========================================== */
/* INTEGRAÇÃO HEADLESS CMS - CATÁLOGO (BLOG)  */
/* ========================================== */

async function carregarBlogCompleto(paginaAtual = 1) {
    const blogGrid = document.getElementById('grid-do-blog'); 
    const paginacaoContainer = document.getElementById('paginacao-blog');
    
    if (!blogGrid) return;

    // RESERVA ESPAÇO PARA O FOOTER NÃO PULAR
    blogGrid.style.minHeight = "600px";
    blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; padding-top: 50px;">Carregando biblioteca...</p>';

    const apiUrl = `${URL_DO_WORDPRESS}/wp-json/wp/v2/posts?_embed&per_page=9&page=${paginaAtual}`;

    try {
        const resposta = await fetch(apiUrl);
        const totalPaginas = resposta.headers.get('X-WP-TotalPages');
        const posts = await resposta.json();

        blogGrid.innerHTML = ''; 

        posts.forEach(post => {
            let imageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            if (post._embedded && post._embedded['wp:featuredmedia']) imageUrl = post._embedded['wp:featuredmedia'][0].source_url;

            let categoriaNome = 'Artigo';
            if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0].length > 0) categoriaNome = post._embedded['wp:term'][0][0].name;

            const dataPost = new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            let resumoLimpo = post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 160) + '...';
            
            let tituloSanitizado = sanitizarHTML(post.title.rendered);
            const linkDoArtigo = `artigo.html?id=${post.id}`;

            const cardHTML = `
                <article class="vitrine-card fade-in">
                    <div class="vitrine-img">
                        <img src="${imageUrl}" alt="${tituloSanitizado}">
                        <span class="vitrine-cat">${categoriaNome}</span>
                    </div>
                    <div class="vitrine-content">
                        <span class="vitrine-date">${dataPost}</span>
                        <h3>${tituloSanitizado}</h3>
                        <p>${resumoLimpo}</p>
                        <a href="${linkDoArtigo}" target="_blank" class="vitrine-link">Ler artigo <span class="arrow">→</span></a>
                    </div>
                </article>
            `;
            blogGrid.innerHTML += cardHTML;
        });

        if (paginacaoContainer && totalPaginas > 1) {
            let botoesHTML = '';
            for (let i = 1; i <= totalPaginas; i++) {
                botoesHTML += `<button class="btn-pagina ${i === paginaAtual ? 'ativo' : ''}" onclick="${i === paginaAtual ? '' : `MudarPaginaBlog(${i})`}">${i}</button>`;
            }
            paginacaoContainer.innerHTML = botoesHTML;
        }

    } catch (erro) {
        console.error("Erro no Blog:", erro);
        blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: red;">Erro ao carregar artigos.</p>';
    }
}

function MudarPaginaBlog(novaPagina) {
    const areaDoBlog = document.getElementById('grid-do-blog');
    const posicao = areaDoBlog.getBoundingClientRect().top + window.scrollY - 150; 
    window.scrollTo({ top: posicao, behavior: 'smooth' });
    carregarBlogCompleto(novaPagina);
}

carregarBlogCompleto();

/* ========================================== */
/* INTEGRAÇÃO HEADLESS CMS - ARTIGO COMPLETO  */
/* ========================================== */

async function carregarArtigoUnico() {
    const artigoContainer = document.getElementById('artigo-dinamico');
    if (!artigoContainer) return;

    const parametrosUrl = new URLSearchParams(window.location.search);
    const postId = parametrosUrl.get('id');

    if (!postId) {
        artigoContainer.innerHTML = '<p style="text-align:center; margin-top: 100px;">Artigo não encontrado.</p>';
        return;
    }

    const apiUrl = `${URL_DO_WORDPRESS}/wp-json/wp/v2/posts/${postId}?_embed`;

    try {
        const resposta = await fetch(apiUrl);
        const post = await resposta.json();

        document.title = `${sanitizarHTML(post.title.rendered)} | Helio Beck`;

        let imageUrl = '';
        if (post._embedded && post._embedded['wp:featuredmedia']) imageUrl = post._embedded['wp:featuredmedia'][0].source_url;

        let categoriaNome = 'Artigo';
        if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0].length > 0) categoriaNome = post._embedded['wp:term'][0][0].name;

        const dataPost = new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

        const textoOriginalSeguro = sanitizarHTML(post.content.rendered);
        const paragrafosBrutos = textoOriginalSeguro.split('</p>');
        const paragrafos = paragrafosBrutos.filter(p => p.trim() !== '');
        
        const botaoHTML = `
            <div class="cta-artigo">
                <p>Gostaria de uma avaliação personalizada com o Helio?</p>
                <a href="${LINK_WHATSAPP}?text=Olá! Estava lendo o artigo no blog e gostaria de agendar uma consulta." target="_blank" class="btn-agendar-artigo">
                    Agendar Minha Consulta pelo WhatsApp
                </a>
            </div>
        `;

        let textoComBotoes = "";
        let terco1 = Math.floor(paragrafos.length / 3);
        let terco2 = Math.floor((paragrafos.length * 2) / 3);

        for (let i = 0; i < paragrafos.length; i++) {
            textoComBotoes += paragrafos[i] + '</p>';
            if (paragrafos.length >= 4) {
                if (i === terco1 || i === terco2) textoComBotoes += botaoHTML;
            } else if (paragrafos.length > 1) {
                if (i === Math.floor(paragrafos.length / 2)) textoComBotoes += botaoHTML;
            }
        }

        const conteudoHTML = `
            <div class="post-header container-sm">
                <span class="post-tag">${categoriaNome}</span>
                <h1 class="post-title">${sanitizarHTML(post.title.rendered)}</h1>
                <div class="post-meta">
                    <div class="author-info">
                        <img src="IMG/WhatsApp Image 2026-03-05 at 21.30.49.jpeg" alt="Helio Beck" class="author-avatar">
                        <div><strong>Helio Beck</strong><span>${dataPost}</span></div>
                    </div>
                </div>
            </div>
            ${imageUrl ? `<div class="post-cover container"><img src="${imageUrl}" alt="Capa"></div>` : ''}
            <article class="post-content container-sm">${textoComBotoes}</article>
            <div class="post-cta container-sm">
                <h3>Invista na sua saúde</h3>
                <p>Agende agora mesmo sua consulta com Helio Beck.</p>
                <a href="${LINK_WHATSAPP}" target="_blank" class="btn">Agendar Minha Consulta</a>
            </div>
        `;

        artigoContainer.innerHTML = conteudoHTML;

    } catch (erro) {
        console.error("Erro no Artigo:", erro);
        artigoContainer.innerHTML = '<p style="text-align:center; color: red;">Erro ao carregar conteúdo.</p>';
    }
}

carregarArtigoUnico();