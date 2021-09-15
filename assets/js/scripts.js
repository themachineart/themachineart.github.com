document.addEventListener("DOMContentLoaded", function () {

    // ==============================================================
    // ===== Lazy loading intersection observer and fallback methods
    // ==============================================================

    let lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
    let active = false;
    
    function initLazyLoading() {
      
      // Is the intersection observer available?
      if ("IntersectionObserver" in window) {
        
        // Use the simpler, newer method
        useObserver();
        
      } else {
        
        // Tap into the scroll event and use the fallback
        document.addEventListener("scroll", useFallback);
      }
    }
  
    function useObserver() {
      
      // Initialize the observer
      let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
        
        // Loop the images
        entries.forEach(function (entry) {
          
          // Is the current image in the view?
          if (entry.isIntersecting) {
            
            // It is, get the image
            let lazyImage = entry.target;
            
            // Update the src, and srcset 
            loadImage(lazyImage);
            
            // Image is loaded, stop observing
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });
  
      // Observe all images with the 'lazy' class
      lazyImages.forEach(function (lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    }
  
    function useFallback() {
      
      // Avoid hitting this method continuously on scroll
      if (active === false) {
        
        // Set the flag to prevent entry
        active = true;
  
        // Entering the method is limited to every 200ms
        setTimeout(function () {
          
          // Loop our lazy images
          for (let i = 0; i < lazyImages.length; i++) {
            
            // Get a reference to the current image
            let lazyImage = lazyImages[i];
  
            // Is the image in the viewport?
            if (isInView(lazyImage)) {
              
              // Update the src, and srcset 
              loadImage(lazyImage);
  
              // Unsubscribe from the event if all images loaded
              if (lazyImages.length === 0) {
                document.removeEventListener("scroll", lazyLoad);
              }
            }
          }
          
          // Image loaded, reset flag for next item
          active = false;
        }, 200);
      }
    }
    
    function isInView(element) {
      var rec = element.getBoundingClientRect();
      
      return (
        rec.bottom >= 0 &&
        rec.right >= 0 &&
        rec.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rec.left <= (window.innerWidth || document.documentElement.clientWidth) && 
        getComputedStyle(element).display != 'none'
      );
    }
    
    // Lazy load any images with the 'lazy' class
    initLazyLoading();

    // =================================================
    // ===== Lazy loading of images with blur technique
    // =================================================

    function loadImage(image) {
      // The parent could be a figure, or an a element
      var parent = image.parentNode;
  
      // Create an image object
      var imageLarge = new Image();
  
      // Get the src for the large image
      imageLarge.src = image.dataset.src;
      
      if (image.dataset.srcset != null)
      {  
      // Get the srcset for the large image
        imageLarge.srcset = image.dataset.srcset;
      }
      
      if (image.dataset.alt != null)
      {
        // Get the alt description for the large image
        imageLarge.alt = image.dataset.alt;
      }
      
      // Add class to make it's default opacity 0
      imageLarge.classList.add("lazy");
  
      // When loaded, make it visible
      imageLarge.onload = function () {
        
        // Add the loaded class to transition to an opacity of 1
        imageLarge.classList.add("lazy--loaded");
        
        // Get rid of the placeholder
        parent.removeChild(image);
      };
  
      // Add it to the document
      parent.append(imageLarge);
    }

  
  // ===================================
  // ===== Height and width of viewport
  // ===================================

  let vw = Math.min(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
  
  let vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );

  // ========================================
  // ===== Gallery fields and event handlers
  // ========================================
  
  let galleryImages = document.querySelectorAll(".gallery-image");
  let galleryLinks = document.querySelectorAll(".open-gallery");
  let galleryIndex = document.querySelector(".gallery-index");
  let gallery = document.querySelector(".gallery-images");
  let modal = document.querySelector(".modal");
  
  // ===== Gallery nav controls

  let btnClose = document.querySelector(".modal-close");
  let btnPrev = document.querySelector("#btn-prev");
  let btnNext = document.querySelector("#btn-next");
  
  function setGalleryEventHandlers() {
    if (gallery == null)
      return;

    for (let i = 0; i < galleryLinks.length; i++) {
      galleryLinks[i].onclick = openModal;
    }

    if (btnClose !== null) {
      btnClose.onclick = closeModal;
    }

    if (btnPrev !== null) {
      btnPrev.onclick = prevImage;
    }

    if (btnNext !== null) {
      btnNext.onclick = nextImage;
    }
    
    gallery.onscroll = galleryScroll;
    document.onkeydown = checkKey;
  }
  
  setGalleryEventHandlers();

  // ====================
  // ===== Modal methods
  // ====================

  function openModal() {
    modal.classList.add("is-active");
  }

  function closeModal() {
    modal.classList.remove("is-active");
  }
    
  let timer = null;
  function galleryScroll(e) {
    if(timer !== null) {
      clearTimeout(timer);        
    }
    timer = setTimeout(function() {
      let index = Math.max(1, Math.ceil(gallery.scrollLeft / vw));
      let count = galleryImages.length;
      galleryIndex.innerText = `${index} / ${count}`;
    }, 150);
  }

  function nextImage() {
    incrementGallery(1);
  }

  function prevImage() {
    incrementGallery(-1);
  }
  
  function incrementGallery(direction) {
    // Get the current position of the scroll
    let left = gallery.scrollLeft;
    
    // Determine the distance to scroll by
    let width = vw * direction;
    
    // Get the new scroll position
    let scroll = left + width;
    
    // Check we're not at the end of the gallery
    if (scroll > (galleryImages.length - 1) * vw) {
      // Going beyond last image, go back to first
      scroll = 0;
    }
    
    else if (scroll < 0) {
      // Going beyond first image, go to last
      scroll = (galleryImages.length - 1) * vw;
    }
    
    // Move to the images position
    gallery.scrollLeft = scroll;
    
  }
  
  function checkKey(e) {
    if (!modal.classList.contains('is-active'))
      return;
    
    e = e || window.event;
    
    if (e.keyCode == '37') {
      prevImage(); // Left arrow
      e.preventDefault();
    }
    
    if (e.keyCode == '39') {
      nextImage(); // Right arrow
      e.preventDefault();
    }
    
    if (e.keyCode == '32') {
      nextImage(); // Space bar
      e.preventDefault();
    }
    
    if (e.keyCode == '27') {
      closeModal(); // Escape button
    }
  }

});
  