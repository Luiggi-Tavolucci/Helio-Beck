/* ========================================== */
/* HELIO BECK - SCRIPT GLOBAL PRINCIPAL       */
/* ========================================== */

// Só executa a mágica depois que o HTML estiver 100% carregado na tela
document.addEventListener('DOMContentLoaded', () => {
    
    /* ========================================== */
    /* 1. MENU MOBILE (HAMBÚRGUER)                */
    /* ========================================== */
    const mobileMenu = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-links');

    if (mobileMenu && navList) {
        // Abre/Fecha o menu ao clicar no ícone
        mobileMenu.addEventListener('click', () => {
            navList.classList.toggle('active');
            mobileMenu.classList.toggle('toggle'); // Prepara para animação do "X" se você criar no CSS
        });

        // Fecha o menu automaticamente ao clicar em qualquer link (Melhor UX)
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                mobileMenu.classList.remove('toggle');
            });
        });
    }

    /* ========================================== */
    /* 2. CONTROLADOR DE ROLAGEM (TRUQUE NINJA)   */
    /* ========================================== */
    const nomeDaPagina = window.location.pathname;

    // Se estivermos nas páginas dinâmicas (Blog ou Artigo)
    if (nomeDaPagina.includes('blog.html') || nomeDaPagina.includes('artigo.html')) {
        
        // Desliga a memória do navegador por precaução
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Garante o topo ao entrar na página
        window.scrollTo(0, 0);

        // Quando o usuário apertar F5, joga pro topo ANTES de recarregar
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        };

    } else {
        // Na Home (index.html), a memória de rolagem continua no automático
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'auto';
        }
    }

});