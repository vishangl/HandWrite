// Language change handler
function changeLanguage(lang) {
  const noteInput = document.getElementById('note');
  
  // Set appropriate font family based on language
  switch(lang) {
    case 'ja':
      noteInput.style.fontFamily = "'Noto Sans JP', sans-serif";
      break;
    case 'ko':
      noteInput.style.fontFamily = "'Noto Sans KR', sans-serif";
      break;
    case 'zh':
      noteInput.style.fontFamily = "'Noto Sans SC', sans-serif";
      break;
    case 'hi':
      noteInput.style.fontFamily = "Hindi_Font";
      break;
    default:
      // Restore the selected handwriting font
      const handwritingFont = document.getElementById('handwriting-font').value;
      noteInput.style.fontFamily = handwritingFont;
  }

  // Set text direction
  noteInput.style.direction = ['ar', 'he'].includes(lang) ? 'rtl' : 'ltr';
  
  // Update placeholder text based on language
  const placeholders = {
    en: "Start typing here...",
    hi: "यहां टाइप करना शुरू करें...",
    ja: "ここに入力してください...",
    ko: "여기에 입력하세요...",
    zh: "在这里开始输入...",
  };
  
  noteInput.setAttribute('placeholder', placeholders[lang] || placeholders.en);
}

// Update font handling
document.getElementById('handwriting-font').addEventListener('change', function(e) {
  const noteInput = document.getElementById('note');
  const lang = document.getElementById('language-select').value;
  
  // Only update font if not using a special language font
  if (!['ja', 'ko', 'zh', 'hi'].includes(lang)) {
    noteInput.style.fontFamily = e.target.value;
  }
}); 