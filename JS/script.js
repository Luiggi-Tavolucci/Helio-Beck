/* ========================================== */
/* CONTROLADOR DE ROLAGEM (COM TRUQUE DO CACHE) */
/* ========================================== */
const nomeDaPagina = window.location.pathname;

if (nomeDaPagina.includes('blog.html') || nomeDaPagina.includes('artigo.html')) {
    
    // 1. O TRUQUE NINJA: Quando o usuário apertar F5, joga pro topo ANTES de recarregar
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    };

    // 2. Desliga a memória do navegador por precaução
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // 3. Garante o topo ao entrar
    window.scrollTo(0, 0);

} else {
    // Na Home (index.html), a memória continua ligada
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
    }
}



/* script.js */

// Seleciona o botão do menu e a lista de links
const mobileMenu = document.querySelector('.menu-toggle');
const navList = document.querySelector('.nav-links');

// Adiciona o evento de clique para abrir/fechar
if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        // Adiciona ou remove a classe 'active' na lista
        navList.classList.toggle('active');
        
        // (Opcional) Adiciona classe para animar o ícone de hamburger
        mobileMenu.classList.toggle('toggle');
    });
}

// (Opcional) Fecha o menu automaticamente ao clicar em um link
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        mobileMenu.classList.remove('toggle');
    });
});