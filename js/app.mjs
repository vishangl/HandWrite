import {
  addFontFromFile,
  formatText,
  addPaperFromFile
} from './utils/helpers.mjs';
import {
  generateImages,
  downloadAsPDF,
  deleteAll
} from './generate-images.mjs';
import { setInkColor, toggleDrawCanvas } from './utils/draw.mjs';

// Import PDF.js library
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.mjs';

const pageEl = document.querySelector('.page-a');

const setTextareaStyle = (attrib, v) => (pageEl.style[attrib] = v);

const EVENT_MAP = {
  '#generate-image-form': {
    on: 'submit',
    action: (e) => {
      e.preventDefault();
      generateImages();
    }
  },
  '#handwriting-font': {
    on: 'change',
    action: (e) =>
      document.body.style.setProperty('--handwriting-font', e.target.value)
  },
  '#font-size': {
    on: 'change',
    action: (e) => {
      if (e.target.value > 30) {
        alert('Font-size is too big try upto 30');
      } else {
        setTextareaStyle('fontSize', e.target.value + 'pt');
        e.preventDefault();
      }
    }
  },
  '#letter-spacing': {
    on: 'change',
    action: (e) => {
      if (e.target.value > 40) {
        alert('Letter Spacing is too big try a number upto 40');
      } else {
        setTextareaStyle('letterSpacing', e.target.value + 'px');
        e.preventDefault();
      }
    }
  },
  '#word-spacing': {
    on: 'change',
    action: (e) => {
      if (e.target.value > 100) {
        alert('Word Spacing is too big try a number upto hundred');
      } else {
        setTextareaStyle('wordSpacing', e.target.value + 'px');
        e.preventDefault();
      }
    }
  },
  '#top-padding': {
    on: 'change',
    action: (e) => {
      document.querySelector('.page-a .paper-content').style.paddingTop =
        e.target.value + 'px';
    }
  },
  '#font-file': {
    on: 'change',
    action: (e) => addFontFromFile(e.target.files[0])
  },
  '#ink-color': {
    on: 'change',
    action: (e) => {
      document.body.style.setProperty('--ink-color', e.target.value);
      setInkColor(e.target.value);
    }
  },
  '#paper-margin-toggle': {
    on: 'change',
    action: () => {
      if (pageEl.classList.contains('margined')) {
        pageEl.classList.remove('margined');
      } else {
        pageEl.classList.add('margined');
      }
    }
  },
  '#paper-line-toggle': {
    on: 'change',
    action: () => {
      if (pageEl.classList.contains('lines')) {
        pageEl.classList.remove('lines');
      } else {
        pageEl.classList.add('lines');
      }
    }
  },
  '#draw-diagram-button': {
    on: 'click',
    action: () => {
      toggleDrawCanvas();
    }
  },
  '.draw-container .close-button': {
    on: 'click',
    action: () => {
      toggleDrawCanvas();
    }
  },
  '#download-as-pdf-button': {
    on: 'click',
    action: () => {
      downloadAsPDF();
    }
  },
  '#delete-all-button': {
    on: 'click',
    action: () => {
      deleteAll();
    }
  },
  '.page-a .paper-content': {
    on: 'paste',
    action: formatText
  },
  '#paper-file': {
    on: 'change',
    action: (e) => addPaperFromFile(e.target.files[0])
  },
  '#pdf-file': {
    on: 'change',
    action: async (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        try {
          // Load the PDF
          const arrayBuffer = await file.arrayBuffer();
          currentPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          // Show total pages
          totalPagesSpan.textContent = currentPdf.numPages;
          
          // Show preview of first page
          const page = await currentPdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Clear previous preview
          pdfPreview.innerHTML = '';
          pdfPreview.appendChild(canvas);
          
          // Show convert button
          convertPdfButton.style.display = 'inline-block';
        } catch (error) {
          console.error('Error loading PDF:', error);
          alert('Error loading PDF. Please try again.');
        }
      }
    }
  },
  '#convert-pdf-button': {
    on: 'click',
    action: async () => {
      if (!currentPdf) return;
      
      try {
        pdfStatus.style.display = 'block';
        const totalPages = currentPdf.numPages;
        let extractedText = '';
        
        for (let i = 1; i <= totalPages; i++) {
          currentPageSpan.textContent = i;
          progressBar.style.width = `${(i / totalPages) * 100}%`;
          
          const page = await currentPdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          extractedText += pageText + '\n\n';
        }
        
        // Set the extracted text in the handwriting input
        const noteInput = document.getElementById('note');
        noteInput.innerHTML = extractedText;
        
        // Hide status and reset
        pdfStatus.style.display = 'none';
        progressBar.style.width = '0%';
        currentPageSpan.textContent = '0';
        
        // Scroll to the handwriting preview
        noteInput.scrollIntoView({ behavior: 'smooth' });
        
      } catch (error) {
        console.error('Error converting PDF:', error);
        alert('Error converting PDF. Please try again.');
        pdfStatus.style.display = 'none';
      }
    }
  }
};

for (const eventSelector in EVENT_MAP) {
  document
    .querySelector(eventSelector)
    .addEventListener(
      EVENT_MAP[eventSelector].on,
      EVENT_MAP[eventSelector].action
    );
}

/**
 * This makes toggles, accessible.
 */
document.querySelectorAll('.switch-toggle input').forEach((toggleInput) => {
  toggleInput.addEventListener('change', (e) => {
    if (toggleInput.checked) {
      document.querySelector(
        `label[for="${toggleInput.id}"] .status`
      ).textContent = 'on';
      toggleInput.setAttribute('aria-checked', true);
    } else {
      toggleInput.setAttribute('aria-checked', false);
      document.querySelector(
        `label[for="${toggleInput.id}"] .status`
      ).textContent = 'off';
    }
  });
});

/**
 * Set GitHub Contributors
 */

fetch(
  'https://api.github.com/repos/saurabhdaware/text-to-handwriting/contributors'
)
  .then((res) => res.json())
  .then((res) => {
    document.querySelector('#project-contributors').innerHTML = res
      .map(
        (contributor) => /* html */ `
        <div class="contributor-profile shadow">
          <a href="${contributor.html_url}">
            <img 
              alt="GitHub avatar of contributor ${contributor.login}" 
              class="contributor-avatar" 
              loading="lazy" 
              src="${contributor.avatar_url}" 
            />
            <div class="contributor-username">${contributor.login}</div>
          </a>
        </div>
      `
      )
      .join('');
  });

// FAQ Accordion functionality
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const faqItem = question.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Toggle the clicked item
    if (!isActive) {
      faqItem.classList.add('active');
    }
  });
});

// PDF handling functionality
const pdfFile = document.getElementById('pdf-file');
const pdfPreview = document.getElementById('pdf-preview');
const convertPdfButton = document.getElementById('convert-pdf-button');
const pdfStatus = document.querySelector('.pdf-status');
const progressBar = document.querySelector('.progress');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');

let currentPdf = null;
