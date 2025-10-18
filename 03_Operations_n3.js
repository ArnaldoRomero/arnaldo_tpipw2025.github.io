/* ==========================================================
   SPA base sin frameworks — Club Guaraní
   - Navegación por hash (#home, #historia, #ubicacion, #galeria, #beneficios, #socios)
   - Lightbox accesible para galería
   - Validación de formulario (nombre, email, plan)
   ========================================================== */

/* Helpers cortos */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* Elementos comunes */
const pages    = $$('.page');
const navLinks = $$('.nav-link');
const navList  = $('#navList');
const navTgl   = $('#navToggle');

/* ===== Navegación SPA por hash ===== */
function showSection(id){
  // Alterna visibilidad
  pages.forEach(sec => sec.classList.toggle('page-active', sec.id === id));

  // Marca activa en la navegación (aria-current)
  navLinks.forEach(a => a.setAttribute('aria-current', a.dataset.nav === id ? 'page' : 'false'));

  // Scroll al inicio de la sección
  const active = document.getElementById(id);
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Cierra menú móvil si estaba abierto
  navList.classList.remove('show');
  navTgl.setAttribute('aria-expanded', 'false');
}

function handleHashChange(){
  const hash = (location.hash || '#home').replace('#', '');
  const exists = pages.some(p => p.id === hash);
  showSection(exists ? hash : 'home');
}

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('DOMContentLoaded', () => {
  handleHashChange();
  $('#year').textContent = new Date().getFullYear();
  mountGallery(); // listeners para galería
});

/* Toggle del menú en móvil */
navTgl.addEventListener('click', () => {
  const expanded = navTgl.getAttribute('aria-expanded') === 'true';
  navTgl.setAttribute('aria-expanded', String(!expanded));
  navList.classList.toggle('show');
});

/* ===== Galería + Lightbox ===== */
// Las imágenes ya están en el HTML (15 <img>), aquí agregamos interacciones.
const lightbox      = $('#lightbox');
const lbImg         = $('#lightboxImg');
const lbCaption     = $('#lightboxCaption');
const lbClose       = $('#lightboxClose');
const lbPrev        = $('#lightboxPrev');
const lbNext        = $('#lightboxNext');
let   galleryItems  = [];
let   currentIndex  = 0;

function mountGallery(){
  galleryItems = $$('#galleryGrid img');
  galleryItems.forEach((img, idx) => {
    img.addEventListener('click', () => openLightbox(idx));
    img.tabIndex = 0; // accesible por teclado
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); openLightbox(idx);
      }
    });
  });
}

function openLightbox(idx){
  currentIndex = idx;
  const el = galleryItems[idx];
  const src = el.dataset.full || el.src;
  const alt = el.alt || 'Imagen de la galería';

  lbImg.src = src;
  lbImg.alt = alt;
  lbCaption.textContent = alt;

  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox(){
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function navLightbox(dir){
  currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
  openLightbox(currentIndex);
}

lbClose.addEventListener('click', closeLightbox);
lbPrev .addEventListener('click', () => navLightbox(-1));
lbNext .addEventListener('click', () => navLightbox(+1));

// Cerrar al hacer click fuera de la imagen
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

// Accesibilidad del modal con teclado
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('show')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft')  navLightbox(-1);
  if (e.key === 'ArrowRight') navLightbox(+1);
});

/* ===== Validación del formulario ===== */
const form = $('#signupForm');

function setError(name, msg){
  const el = $(`[data-error-for="${name}"]`);
  if (el) el.textContent = msg || '';
}

function validateForm(fd){
  let ok = true;

  // Nombre requerido (mínimo 2 caracteres visibles)
  const nombre = (fd.get('nombre') || '').trim();
  if (nombre.length < 2){
    setError('nombre', 'Ingresá tu nombre.');
    ok = false;
  } else setError('nombre', '');

  // Email con patrón básico
  const email = (fd.get('email') || '').trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk){
    setError('email', 'Correo inválido (ej: nombre@dominio.com).');
    ok = false;
  } else setError('email', '');

  // Plan (radio) requerido
  if (!fd.get('plan')){
    setError('plan', 'Seleccioná un tipo de membresía.');
    ok = false;
  } else setError('plan', '');

  // País/Provincia opcional en requisitos, pero si se requiere, descomentar:
  // if (!fd.get('pais')) { setError('pais', 'Seleccioná una opción.'); ok = false; } else setError('pais', '');

  return ok;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  if (!validateForm(fd)) return;

  // Aquí podrías enviar al backend con fetch()
  // fetch('/api/socios', { method: 'POST', body: fd });

  // Feedback de éxito
  $('#formSuccess').hidden = false;
  form.reset();
  $('#formSuccess').focus?.();
});

/* Mejora accesible: estilo de focus cuando el usuario navega con teclado */
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Tab') document.body.classList.add('user-tabbing');
});
