/* ========================================== */
/* HELIO BECK - SCRIPT GLOBAL PRINCIPAL       */
/* ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ========================================== */
    /* 1. MENU MOBILE (HAMBÚRGUER PREMIUM)        */
    /* ========================================== */
    const mobileBtn = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li a');

    // Função central para abrir/fechar e trocar o ícone
    function toggleMenu() {
        if (!navList) return;
        const isActive = navList.classList.toggle('active');

        // Troca o texto de ☰ para ✕
        if (mobileBtn) {
            if (isActive) {
                mobileBtn.textContent = '✕'; 
            } else {
                mobileBtn.textContent = '☰'; 
            }
        }
    }

    // Clique no botão Hambúrguer
    if (mobileBtn) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Fecha o menu automaticamente ao clicar em qualquer link
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (navList.classList.contains('active')) toggleMenu();
        });
    });

    // Fecha o menu se o usuário clicar no espaço vazio da tela
    document.addEventListener('click', (e) => {
        if (navList && navList.classList.contains('active') && 
            !navList.contains(e.target) && 
            !mobileBtn.contains(e.target)) {
            toggleMenu();
        }
    });

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