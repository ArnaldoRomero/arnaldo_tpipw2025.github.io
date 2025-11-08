/* ==========================================================
   SPA base sin frameworks — Club Guaraní
   - Navegación por hash (#home, #historia, #ubicacion, #galeria, #beneficios, #socios)
   - Lightbox accesible para galería
   - Validación de formulario (nombre, email, plan)
   ========================================================== */

/* ===========================
   EmailJS: Config
   =========================== */
const EMAILJS_PUBLIC_KEY   = 'AQUI VA EL CODIGO EMAILJS';      // Public Key
const EMAILJS_SERVICE_ID   = 'AQUI VA EL CODIGO EMAILJS';        // Service ID
//const EMAILJS_TPL_REGISTRO = 'AQUI VA EL CODIGO EMAILJS';       // Template 1
const EMAILJS_TPL_QUIZ     = 'AQUI VA EL CODIGO EMAILJS';       // Template 2

/* ===========================
   Estado global mínimo
   =========================== */
let currentUser = { nombre: '', apellido: '', email: '', membresia: '' };
let galleryItems = [];
let currentIndex = 0;
let quizIndex = 0;
let quizCorrect = 0;
let quizUnlocked = false;

/* Helpers cortos para seleccionar */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ===== QUIZ: preguntas ===== */
const QUIZ_QUESTIONS = [
  { q: "¿En qué ciudad está la sede del Club Guaraní?",
    options: ["Luque", "Asunción", "Encarnación", "San Lorenzo", "Villarrica"], correct: 1 },
  { q: "¿En qué año fue fundado el Club Guaraní?",
    options: ["1899", "1901", "1903", "1910", "1925"], correct: 2 },
  { q: "¿Cuál es uno de sus clásicos tradicionales?",
    options: ["Ante Nacional", "Ante Libertad", "Ante Cerro Porteño", "Ante Sol de América", "Ante Guaraní de Trinidad"], correct: 1 },
  { q: "¿Qué colores representan al Club Guaraní?",
    options: ["Azul y blanco", "Rojo y negro", "Verde y blanco", "Mostaza y negro", "Celeste y blanco"], correct: 3 },
  { q: "¿Qué premio lográs con 5 respuestas correctas?",
    options: ["Un llavero", "1 mes gratis", "Una camiseta", "1 año de membresía", "2 meses gratis"], correct: 3 }
];

/* ===========================
   Arranque seguro
   =========================== */
window.addEventListener('DOMContentLoaded', () => {
  /* ---- 1) EmailJS: init seguro ---- */
  try {
    if (window.emailjs?.init) {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      console.log('EmailJS iniciado');
    } else {
      console.warn('EmailJS no disponible (ver <script src="...email.min.js"> en el HTML).');
    }
  } catch (e) {
    console.error('Error iniciando EmailJS:', e);
  }

  /* ---- 2) Referencias DOM ---- */
  const pages    = $$('.page');
  const navLinks = $$('.nav-link');
  const navList  = $('#navList');
  const navTgl   = $('#navToggle');

  const lightbox   = $('#lightbox');
  const lbImg      = $('#lightboxImg');
  const lbCaption  = $('#lightboxCaption');
  const lbClose    = $('#lightboxClose');
  const lbPrev     = $('#lightboxPrev');
  const lbNext     = $('#lightboxNext');

  const form          = $('#signupForm');
  const quizModule    = $('#quizModule');
  const quizProgress  = $('#quizProgress');
  const quizQuestion  = $('#quizQuestion');
  const quizOptions   = $('#quizOptions');
  const quizForm      = $('#quizForm');
  const quizAnswerBtn = $('#quizAnswerBtn');
  const quizFeedback  = $('#quizFeedback');
  const quizFooter    = $('#quizFooter');
  const quizResult    = $('#quizResult');

  /* ---- 3) Funciones relacionadas (usan las refs anteriores) ---- */

  // SPA: mostrar sección por id
  function showSection(id){
    pages.forEach(sec => sec.classList.toggle('page-active', sec.id === id));
    navLinks.forEach(a => a.setAttribute('aria-current', a.dataset.nav === id ? 'page' : 'false'));
    const active = document.getElementById(id);
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navList?.classList.remove('show');
    navTgl?.setAttribute('aria-expanded', 'false');
  }

  // SPA: reaccionar al hash
  function handleHashChange(){
    const hash = (location.hash || '#home').replace('#', '');
    const exists = pages.some(p => p.id === hash);
    showSection(exists ? hash : 'home');
  }

  // Montar galería (miniaturas → lightbox)
  function mountGallery(){
    galleryItems = $$('#galleryGrid img');
    galleryItems.forEach((img, idx) => {
      img.addEventListener('click', () => openLightbox(idx));
      img.tabIndex = 0;
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
    if (!el) return;
    const src = el.dataset.full || el.src;
    const alt = el.alt || 'Imagen de la galería';
    if (lbImg) { lbImg.src = src; lbImg.alt = alt; }
    if (lbCaption) lbCaption.textContent = alt;
    lightbox?.classList.add('show');
    lightbox?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose?.focus();
  }

  function closeLightbox(){
    lightbox?.classList.remove('show');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navLightbox(dir){
    if (!galleryItems.length) return;
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  // Validación formulario
  function setError(name, msg){
    const el = $(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || '';
  }

  function validateForm(fd){
    let ok = true;
    const nombre = (fd.get('nombre') || '').trim();
    if (nombre.length < 2){ setError('nombre', 'Ingresá tu nombre.'); ok = false; }
    else setError('nombre', '');

    const email = (fd.get('email') || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk){ setError('email', 'Correo inválido (ej: nombre@dominio.com).'); ok = false; }
    else setError('email', '');

    if (!fd.get('plan')){ setError('plan', 'Seleccioná un tipo de membresía.'); ok = false; }
    else setError('plan', '');

    return ok;
  }

  // QUIZ: enable / start / render / finish
  function enableQuiz(){
    if (!quizModule) return;
    quizUnlocked = true;
    quizModule.classList.add('unlocked');
    quizModule.classList.remove('disabled');
    quizModule.setAttribute('aria-disabled', 'false');
    startQuiz();
  }

  function startQuiz(){
    quizIndex = 0;
    quizCorrect = 0;
    if (quizFeedback) quizFeedback.textContent = '';
    renderQuestion();
  }

  function renderQuestion(){
    const total = QUIZ_QUESTIONS.length;
    if (quizProgress) quizProgress.textContent = `Pregunta ${quizIndex + 1} de ${total}`;
    const data = QUIZ_QUESTIONS[quizIndex];
    if (!data) return;

    if (quizQuestion) quizQuestion.textContent = data.q;

    if (quizOptions){
      quizOptions.innerHTML = '';
      data.options.forEach((text, i) => {
        const id = `q${quizIndex}_opt${i}`;
        const label = document.createElement('label');
        label.setAttribute('for', id);

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = String(i);
        input.id = id;
        input.required = true;

        const span = document.createElement('span');
        span.textContent = text;

        label.appendChild(input);
        label.appendChild(span);
        quizOptions.appendChild(label);
      });
    }

    if (quizAnswerBtn) quizAnswerBtn.disabled = true;
  }

  function finishQuiz(){
  // Calcular premio
    let premio = '';
    if (quizCorrect === QUIZ_QUESTIONS.length){
        premio = "1 año de membresía";
    } else if (quizCorrect >= 3){
        premio = "1 mes de membresía";
    } else {
        premio = "Sin premio";
    }

    // Limpiar UI del quiz y mostrar solo la leyenda final
    quizUnlocked = false;                 // bloquear nuevas respuestas
    quizForm?.reset();                    // limpia selección actual
    if (quizOptions)   quizOptions.innerHTML = '';     // limpia opciones
    if (quizFeedback)  quizFeedback.textContent = '';  // limpia feedback
    if (quizQuestion)  quizQuestion.textContent = '¡Gracias por participar!'; // título de cierre
    if (quizProgress)  quizProgress.textContent = '';  // sin contador
    if (quizAnswerBtn) quizAnswerBtn.disabled = true;

    // Mostrar resultado
    if (quizResult){
        if (premio === "1 año de membresía"){
        quizResult.textContent = `🎉 ¡Perfecto! 5/5 correctas — Ganaste ${premio} gratis — Verifica tu casilla de correo para finalizar el registro.`;
        } else if (premio === "1 mes de membresía") {
        quizResult.textContent = `👏 ¡Bien! ${quizCorrect}/5 correctas — Ganaste ${premio} gratis — Verifica tu casilla de correo para finalizar el registro.`;
        } else {
        quizResult.textContent = `¡Gracias por participar! ${quizCorrect}/5 correctas — Verifica tu casilla de correo para finalizar el registro.`;
        }
    }

    // Mostrar solo el footer con el resultado
    if (quizFooter) quizFooter.hidden = false;
    const quizModule = document.getElementById('quizModule');
    quizModule?.classList.add('completed');  // activa reglas CSS para ocultar el cuerpo

    // === Enviar Template 2 (quiz finalizado) ===
    (async () => {
        try {
        if (window.emailjs && currentUser.email) {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_QUIZ, {
            nombre:    currentUser.nombre,
            apellido:  currentUser.apellido,
            email:     currentUser.email,
            membresia: currentUser.membresia,
            beneficio: premio
            });
            console.log('EmailJS: Template 2 enviado (quiz final).');
        } else {
            console.warn('EmailJS no disponible o sin email (no se envía Template 2).');
        }
        } catch (err) {
        console.error('EmailJS (quiz) error:', err);
        }
    })();
 }

  // ---- 4) Listeners: SPA / UI / Form / Galería ---- 

  // SPA
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menú móvil
  navTgl?.addEventListener('click', () => {
    const expanded = navTgl.getAttribute('aria-expanded') === 'true';
    navTgl.setAttribute('aria-expanded', String(!expanded));
    navList?.classList.toggle('show');
  });

  // Galería y Lightbox
  mountGallery();
  lbClose?.addEventListener('click', closeLightbox);
  lbPrev ?.addEventListener('click', () => navLightbox(-1));
  lbNext ?.addEventListener('click', () => navLightbox(+1));
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('show')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(+1);
  });

  // Accesibilidad: modo tabbing
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Tab') document.body.classList.add('user-tabbing');
  });

  // Formulario Socios + EmailJS Template 1
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (!validateForm(fd)) return;

    currentUser = {
      nombre:    (fd.get('nombre')   || '').trim(),
      apellido:  (fd.get('apellido') || '').trim(),
      email:     (fd.get('email')    || '').trim(),
      membresia: (fd.get('plan')     || '').trim()
    };

    /*// Enviar Template 1 con guardas
    try {
      if (window.emailjs && currentUser.email){
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_REGISTRO, {
          nombre: currentUser.nombre,
          membresia: currentUser.membresia
        });
        console.log('EmailJS: Template 1 enviado (registro).');
      } else {
        console.warn('EmailJS no está disponible (no se envía Template 1).');
      }
    } catch (err) {
      console.error('EmailJS (registro) error:', err);
      // No interrumpimos la SPA
    }*/

    // Feedback & habilitar QUIZ
    const formSuccess = $('#formSuccess');
    if (formSuccess) formSuccess.hidden = false;
    form.reset();
    formSuccess?.focus?.();
    enableQuiz();
  });

  // Quiz: habilitar botón responder cuando hay selección
  quizOptions?.addEventListener('change', () => {
    if (quizAnswerBtn) {
      quizAnswerBtn.disabled = !quizForm?.querySelector('input[name="answer"]:checked');
    }
  });

  // Quiz: submit respuesta
  quizForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!quizUnlocked) return;

    const selected = quizForm.querySelector('input[name="answer"]:checked');
    if (!selected) return;

    const userIdx = Number(selected.value);
    const data = QUIZ_QUESTIONS[quizIndex];
    const isCorrect = userIdx === data.correct;

    if (isCorrect){
      quizCorrect++;
      if (quizFeedback) quizFeedback.textContent = '✅ ¡Correcto!';
    } else {
      const correctText = data.options[data.correct];
      if (quizFeedback) quizFeedback.textContent = `❌ Incorrecto. Respuesta correcta: ${correctText}`;
    }

    setTimeout(() => {
      if (quizFeedback) quizFeedback.textContent = '';
      quizIndex++;
      if (quizIndex < QUIZ_QUESTIONS.length) renderQuestion();
      else finishQuiz();
    }, 700);
  });
});

  // Helpers de envío (fuera para que existan antes)
   
/*async function sendEmailRegistro({ nombre, membresia }) {
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_REGISTRO, { nombre, membresia });
    console.log('EmailJS: Template 1 enviado (registro).');
  } catch (err) {
    console.error('EmailJS (registro) error:', err);
  }
}*/

async function sendEmailQuizFinal({ nombre, apellido, email, membresia, beneficio }) {
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_QUIZ, { nombre, apellido, email, membresia, beneficio });
    console.log('EmailJS: Template 2 enviado (quiz final).');
  } catch (err) {
    console.error('EmailJS (quiz) error:', err);
  }
}
