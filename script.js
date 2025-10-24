// لغة افتراضية
let currentLang = "ar";

/* ---------- شاشة البداية (شقين يفتحان) ---------- */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const left = splash.querySelector(".splash-left");
  const right = splash.querySelector(".splash-right");
  const splashLogo = splash.querySelector(".splash-logo");

  // بعد 3 ثواني: نعمل تلاشي للـ logo أولاً، ثم نفتح الشقين، ثم نختفي نهائياً
  setTimeout(() => {
    // تلاشي اللوغو
    if(splashLogo){
      splashLogo.style.opacity = "0";
    }
    // بعد نصف ثانية نبدأ حركة فتح الشقين
    setTimeout(() => {
      left.style.animation = "splashOpen 1s forwards";
      right.style.animation = "splashOpenRight 1s forwards";
      // بعد انتهاء الحركة أخفي العنصر نهائياً
      setTimeout(()=>{ splash.style.display = "none"; }, 1000);
    }, 500);
  }, 3000);

  // فعل أزرار اللغة
  const btnAr = document.getElementById("lang-ar");
  const btnEn = document.getElementById("lang-en");
  if(btnAr) btnAr.addEventListener("click", ()=> switchLang("ar"));
  if(btnEn) btnEn.addEventListener("click", ()=> switchLang("en"));

  // إظهار عنوان الهوم إذا مر 5 ثواني (كما كان سابقًا)
  setTimeout(() => {
    const homeSection = document.getElementById("home");
    const homeTitle = homeSection ? homeSection.querySelector("h1") : null;
    if(homeTitle && homeTitle.dataset) homeTitle.textContent = currentLang === "ar" ? homeTitle.dataset.ar : homeTitle.dataset.en;
    if(homeSection) homeSection.classList.add("show");
  }, 5000);

  // تهيئة النصوص بحسب اللغة الحالية عند التحميل
  updateAllTexts();
});

/* ---------- وظيفة تبديل اللغة (تحديث النصوص) ---------- */
function switchLang(lang){
  currentLang = lang;
  updateAllTexts();

  // لو المودال مفتوح حدث التسمية
  const modalCaption = document.querySelector(".modal-caption");
  if(modalCaption && modalCaption.dataset){
    modalCaption.textContent = currentLang === "ar" ? modalCaption.dataset.projectInfoAr || modalCaption.dataset.projectInfo || "" : modalCaption.dataset.projectInfoEn || modalCaption.dataset.projectInfo || "";
  }
}

function updateAllTexts(){
  // جلب كل العناصر التي تحتوي على data-ar & data-en
  document.querySelectorAll("[data-ar][data-en]").forEach(el => {
    el.textContent = currentLang === "ar" ? el.dataset.ar : el.dataset.en;
  });
}

/* ---------- Fade In عند النزول ---------- */
function handleScroll() {
  document.querySelectorAll(".fade").forEach(fade => {
    const triggerBottom = window.innerHeight * 0.9;
    if(fade.getBoundingClientRect().top < triggerBottom) fade.classList.add("show");
  });
}
window.addEventListener("scroll", handleScroll);
handleScroll();

/* ---------- وظائف الصور الفرعية الداخلية (fallback) + أسهم وTouch ---------- */
function showSubImage(container, index){
  const images = container.querySelectorAll('img');
  images.forEach((img,i)=> img.classList.remove('active'));
  if(images[index]) images[index].classList.add('active');
  container.dataset.currentIndex = index;
}
document.querySelectorAll('.sub-images').forEach(container=>{
  const prev = container.querySelector('.prev');
  const next = container.querySelector('.next');

  // ensure first image shown
  showSubImage(container, 0);

  if(prev){
    prev.addEventListener('click', e=>{
      e.stopPropagation();
      let images = container.querySelectorAll('img');
      if(images.length === 0) return;
      let current = parseInt(container.dataset.currentIndex) || 0;
      current = (current-1+images.length)%images.length;
      showSubImage(container, current);
    });
  }

  if(next){
    next.addEventListener('click', e=>{
      e.stopPropagation();
      let images = container.querySelectorAll('img');
      if(images.length === 0) return;
      let current = parseInt(container.dataset.currentIndex) || 0;
      current = (current+1)%images.length;
      showSubImage(container, current);
    });
  }

  // Touch support for swiping images inside the project (mobile)
  let startX = 0;
  let currentIndex = parseInt(container.dataset.currentIndex) || 0;
  const imgs = container.querySelectorAll('img');

  container.addEventListener("touchstart", (e) => {
    if(!imgs || imgs.length === 0) return;
    startX = e.touches[0].clientX;
  });

  container.addEventListener("touchend", (e) => {
    if(!imgs || imgs.length === 0) return;
    let endX = e.changedTouches[0].clientX;
    if(startX - endX > 40){ // swipe left
      currentIndex = (parseInt(container.dataset.currentIndex) || 0) + 1;
      currentIndex = currentIndex % imgs.length;
      showSubImage(container, currentIndex);
    }
    else if(endX - startX > 40){ // swipe right
      currentIndex = (parseInt(container.dataset.currentIndex) || 0) - 1;
      if(currentIndex < 0) currentIndex = imgs.length - 1;
      showSubImage(container, currentIndex);
    }
  });
});

/* ---------- Modal عرض الصور الفرعية في المنتصف مع أسهم وكيبورد وTouch ---------- */
const galleryModal = document.getElementById("gallery-modal");
const modalImage = galleryModal ? galleryModal.querySelector(".modal-image") : null;
const modalVideo = galleryModal ? galleryModal.querySelector(".modal-video") : null;
const modalCaption = galleryModal ? galleryModal.querySelector(".modal-caption") : null;
const modalPrev = galleryModal ? galleryModal.querySelector(".modal-prev") : null;
const modalNext = galleryModal ? galleryModal.querySelector(".modal-next") : null;
const modalClose = galleryModal ? galleryModal.querySelector(".modal-close") : null;

let modalItems = []; // each item: {type: "image"|"video", src, alt}
let modalIndex = 0;

function openModal(items, startIndex, projectInfoTextAr = "", projectInfoTextEn = ""){
  if(!galleryModal) return;
  modalItems = items.slice();
  modalIndex = startIndex || 0;
  // save captions for language switching (used for all images in this project)
  if(modalCaption){
    modalCaption.dataset.projectInfoAr = projectInfoTextAr || "";
    modalCaption.dataset.projectInfoEn = projectInfoTextEn || "";
  }
  updateModalItem();
  galleryModal.classList.add("show");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  if(!galleryModal) return;
  galleryModal.classList.remove("show");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // stop video if playing
  if(modalVideo){
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
  }
}

function updateModalItem(){
  if(!galleryModal) return;
  if(!modalItems || modalItems.length === 0){
    if(modalImage) { modalImage.style.display = "none"; modalImage.src = ""; }
    if(modalVideo) { modalVideo.style.display = "none"; modalVideo.src = ""; }
    if(modalCaption) modalCaption.textContent = "";
    return;
  }
  const item = modalItems[modalIndex];
  if(item.type === "video"){
    if(modalImage) { modalImage.style.display = "none"; modalImage.src = ""; }
    if(modalVideo) { modalVideo.style.display = "block"; modalVideo.src = item.src; modalVideo.play(); }
  } else {
    if(modalVideo) { modalVideo.style.display = "none"; modalVideo.pause(); modalVideo.removeAttribute("src"); modalVideo.load(); }
    if(modalImage) { modalImage.style.display = "block"; modalImage.src = item.src; modalImage.alt = item.alt || ""; }
  }
  // تفضيل وصف المشروع (الذي نوفره باللغتين) كتعليق على كل الصور داخل نفس المشروع
  if(modalCaption){
    const projText = currentLang === "ar" ? modalCaption.dataset.projectInfoAr || modalCaption.dataset.projectInfo : (modalCaption.dataset.projectInfoEn || modalCaption.dataset.projectInfo);
    modalCaption.textContent = projText || item.alt || "";
  }
}

/* أحداث أزرار المودال */
if(modalPrev){
  modalPrev.addEventListener("click", (e)=>{
    e.stopPropagation();
    if(modalItems.length === 0) return;
    modalIndex = (modalIndex-1+modalItems.length) % modalItems.length;
    updateModalItem();
  });
}
if(modalNext){
  modalNext.addEventListener("click", (e)=>{
    e.stopPropagation();
    if(modalItems.length === 0) return;
    modalIndex = (modalIndex+1) % modalItems.length;
    updateModalItem();
  });
}
if(modalClose){
  modalClose.addEventListener("click", (e)=>{ e.stopPropagation(); closeModal(); });
}
// اغلاق عند النقر خارج الصورة
if(galleryModal){
  galleryModal.addEventListener("click", (e)=>{
    if(e.target === galleryModal) closeModal();
  });
}
// كيبورد
document.addEventListener("keydown", (e)=>{
  if(!galleryModal || !galleryModal.classList.contains("show")) return;
  if(e.key === "ArrowLeft") {
    if(modalItems.length === 0) return;
    modalIndex = (modalIndex-1+modalItems.length) % modalItems.length;
    updateModalItem();
  } else if(e.key === "ArrowRight") {
    if(modalItems.length === 0) return;
    modalIndex = (modalIndex+1) % modalItems.length;
    updateModalItem();
  } else if(e.key === "Escape") {
    closeModal();
  }
});

// Touch swipe for modal
let modalTouchStartX = 0;
if(galleryModal){
  galleryModal.addEventListener("touchstart", (e)=> {
    modalTouchStartX = e.touches[0].clientX;
  });
  galleryModal.addEventListener("touchend", (e)=> {
    const endX = e.changedTouches[0].clientX;
    if(modalTouchStartX - endX > 50){ // left
      modalIndex = (modalIndex+1) % modalItems.length;
      updateModalItem();
    } else if(endX - modalTouchStartX > 50){ // right
      modalIndex = (modalIndex-1+modalItems.length) % modalItems.length;
      updateModalItem();
    }
  });
}

/* ---------- عند الضغط على الصورة الرئيسية داخل مشروع: افتح المودال بالصور الفرعية لهذا المشروع (أو الفيديو) ---------- */
document.querySelectorAll('.project').forEach(project => {
  const mainImg = project.querySelector('.main-image');
  const mainVideo = project.querySelector('.main-video');
  const toggleElement = mainImg || mainVideo;
  if(!toggleElement) return;

  toggleElement.addEventListener('click', (e)=>{
    e.stopPropagation();
    // إذا المشروع يحتوي صور فرعية -> اجمعهم كـ image items
    const subImgs = Array.from(project.querySelectorAll('.sub-images img'));
    if(subImgs.length > 0){
      const items = subImgs.map(img => ({ type: "image", src: img.src, alt: img.alt || "" }));
      const projInfoEl = project.querySelector('.project-info');
      const projInfoAr = projInfoEl && projInfoEl.dataset && projInfoEl.dataset.ar ? projInfoEl.dataset.ar : "";
      const projInfoEn = projInfoEl && projInfoEl.dataset && projInfoEl.dataset.en ? projInfoEl.dataset.en : "";
      openModal(items, 0, projInfoAr, projInfoEn);
      return;
    }

    // لو المشروع يحتوي فيديو أساسي -> افتحه كمودال فيديو
    if(mainVideo){
      const sourceEl = mainVideo.querySelector("source");
      const videoSrc = sourceEl ? sourceEl.src : mainVideo.currentSrc || mainVideo.src;
      if(videoSrc){
        const items = [{ type: "video", src: videoSrc, alt: "" }];
        const projInfoEl = project.querySelector('.project-info');
        const projInfoAr = projInfoEl && projInfoEl.dataset && projInfoEl.dataset.ar ? projInfoEl.dataset.ar : "";
        const projInfoEn = projInfoEl && projInfoEl.dataset && projInfoEl.dataset.en ? projInfoEl.dataset.en : "";
        openModal(items, 0, projInfoAr, projInfoEn);
        return;
      }
    }

    // Fallback: عرض الحاوية الفرعية أو الوصف (كما كان)
    const subContainer = project.querySelector('.sub-images');
    const info = project.querySelector('.project-info');
    if(subContainer){
      subContainer.style.display = subContainer.style.display === 'grid' || subContainer.style.display === 'block' ? 'none' : 'block';
      if(subContainer.style.display === 'block') showSubImage(subContainer, 0);
    }
    if(info) info.style.display = info.style.display === 'block' ? 'none' : 'block';
    if(subContainer || info) project.scrollIntoView({ behavior:'smooth', block:'start' });
  });


  /* ---------- About fade-in عند النزول ---------- */
function handleAboutScroll() {
  document.querySelectorAll(".about-section p").forEach(p => {
    const triggerBottom = window.innerHeight * 0.9;
    if(p.getBoundingClientRect().top < triggerBottom) p.classList.add("show");
  });
}
window.addEventListener("scroll", handleAboutScroll);
handleAboutScroll();



/* ---------- تعديل الفيديو والصور لتظهر دائمًا على الجوال والتابلت ---------- */
function fixVideosOnMobile() {
  const landscape = document.querySelector(".video-bg-landscape");
  const portrait = document.querySelector(".video-bg-portrait");

  const width = window.innerWidth;

  if(width <= 768) { // موبيل / تابليت
    if(landscape) landscape.style.display = "none";
    if(portrait) portrait.style.display = "block";
  } else { // كمبيوتر
    if(landscape) landscape.style.display = "block";
    if(portrait) portrait.style.display = "none";
  }
}

window.addEventListener("resize", fixVideosOnMobile);
fixVideosOnMobile();
});