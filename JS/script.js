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