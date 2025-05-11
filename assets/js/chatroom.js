/**
 * Secure Chatroom for 594 ANTI EXTORT
 * Features:
 * - Random user aliases
 * - Message encryption simulation
 * - File uploads
 * - Session timer
 * - Chat cleared on page refresh
 */

// Generate a random alias for this session
const aliases = [
  "PHANTOM", "SPECTER", "SHADOW", "WRAITH", "GHOST",
  "CIPHER", "ECHO", "HAZE", "VOID", "RAVEN",
  "JINX", "VIPER", "SIREN", "DREAD", "FROST",
  "ONYX", "HAVOC", "STORM", "VENOM", "GRIM",
  "ENIGMA", "MIRAGE", "GLYPH", "PARADOX", "OBLIVION"
];

const randomHex = () => {
  return Math.floor(Math.random() * 16).toString(16).toUpperCase();
};

const generateUserCode = () => {
  return Array.from({length: 8}, randomHex).join('');
};

// Generate random user alias
const userAlias = `${aliases[Math.floor(Math.random() * aliases.length)]}_${generateUserCode()}`;
document.getElementById('user-alias').textContent = userAlias;

// Generate random room name
const roomPrefix = ["VOID", "SHADOW", "CRYPT", "NEXUS", "ABYSS", "CIPHER", "ECHO"];
const roomName = `${roomPrefix[Math.floor(Math.random() * roomPrefix.length)]}-${generateUserCode()}`;
document.getElementById('chatroom-name').textContent = roomName;

// Session timer
let seconds = 0;
const timerElement = document.getElementById('session-timer');
const updateTimer = () => {
  seconds++;
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  timerElement.textContent = `${hours}:${minutes}:${secs}`;
};
setInterval(updateTimer, 1000);

// Message handling
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const clearButton = document.getElementById('clear-chat');

// Current time for messages
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

// Simulate message encryption (for visual effect only)
const encryptMessage = (text) => {
  // This is just for show - not actual encryption
  return text;
};

// Create and add message to the chat
const addMessage = (text, isOutgoing = false, file = null) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  if (isOutgoing) {
    messageElement.classList.add('outgoing');
  }
  
  const avatarElement = document.createElement('div');
  avatarElement.classList.add('avatar');
  avatarElement.textContent = isOutgoing ? userAlias.charAt(0) : 'X';
  
  const contentElement = document.createElement('div');
  contentElement.classList.add('message-content');
  
  const textElement = document.createElement('span');
  textElement.classList.add('message-text');
  textElement.textContent = text;
  
  const timeElement = document.createElement('span');
  timeElement.classList.add('timestamp');
  timeElement.textContent = getCurrentTime();
  
  contentElement.appendChild(textElement);
  
  // Add file attachment if present
  if (file) {
    const fileElement = document.createElement('div');
    fileElement.classList.add('file-message');
    
    const fileIconElement = document.createElement('svg');
    fileIconElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    fileIconElement.setAttribute('width', '18');
    fileIconElement.setAttribute('height', '18');
    fileIconElement.setAttribute('viewBox', '0 0 24 24');
    fileIconElement.setAttribute('fill', 'none');
    fileIconElement.setAttribute('stroke', 'currentColor');
    fileIconElement.setAttribute('stroke-width', '2');
    fileIconElement.setAttribute('stroke-linecap', 'round');
    fileIconElement.setAttribute('stroke-linejoin', 'round');
    fileIconElement.classList.add('file-icon');
    fileIconElement.innerHTML = '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>';
    
    const fileDetailsElement = document.createElement('div');
    fileDetailsElement.classList.add('file-details');
    
    const fileNameElement = document.createElement('div');
    fileNameElement.classList.add('file-name');
    fileNameElement.textContent = file.name;
    
    const fileSizeElement = document.createElement('div');
    fileSizeElement.classList.add('file-size');
    fileSizeElement.textContent = formatFileSize(file.size);
    
    const fileDownloadElement = document.createElement('svg');
    fileDownloadElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    fileDownloadElement.setAttribute('width', '18');
    fileDownloadElement.setAttribute('height', '18');
    fileDownloadElement.setAttribute('viewBox', '0 0 24 24');
    fileDownloadElement.setAttribute('fill', 'none');
    fileDownloadElement.setAttribute('stroke', 'currentColor');
    fileDownloadElement.setAttribute('stroke-width', '2');
    fileDownloadElement.setAttribute('stroke-linecap', 'round');
    fileDownloadElement.setAttribute('stroke-linejoin', 'round');
    fileDownloadElement.classList.add('file-download');
    fileDownloadElement.innerHTML = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>';
    
    fileDetailsElement.appendChild(fileNameElement);
    fileDetailsElement.appendChild(fileSizeElement);
    
    fileElement.appendChild(fileIconElement);
    fileElement.appendChild(fileDetailsElement);
    fileElement.appendChild(fileDownloadElement);
    
    contentElement.appendChild(fileElement);
  }
  
  contentElement.appendChild(timeElement);
  
  messageElement.appendChild(avatarElement);
  messageElement.appendChild(contentElement);
  
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
  
  // Add subtle typing animation effect
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(10px)';
  messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  setTimeout(() => {
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  }, 10);
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
};

// Send message function
const sendMessage = () => {
  const text = messageInput.value.trim();
  if (text === '' && !currentFile) return;
  
  // Add outgoing message
  if (text !== '') {
    const encryptedText = encryptMessage(text);
    addMessage(encryptedText, true, currentFile);
  } else if (currentFile) {
    addMessage(`File: ${currentFile.name}`, true, currentFile);
  }
  
  // Reset input and file
  messageInput.value = '';
  currentFile = null;
  fileInfo.textContent = '';
  fileInfo.classList.remove('active');
  
  // Simulate incoming message after random delay (for demo purposes)
  if (Math.random() > 0.7) {
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const responses = [
        "Received. Moving forward with the operation.",
        "Intel verified. Standby for further instructions.",
        "Copy that. Maintaining secure comms.",
        "Message acknowledged. Stay vigilant.",
        "Understood. Keep channels clear.",
        "Data received. Will analyze and respond.",
        "Connection secure. Proceeding as discussed."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, false);
    }, delay);
  }
};

// Handle send button click
sendButton.addEventListener('click', sendMessage);

// Handle enter key to send message
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// File upload handling
let currentFile = null;

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    currentFile = e.target.files[0];
    fileInfo.textContent = currentFile.name;
    fileInfo.classList.add('active');
  }
});

// Clear chat button
clearButton.addEventListener('click', () => {
  // Add system message about clearing
  const systemMessage = document.createElement('div');
  systemMessage.classList.add('system-message');
  
  const contentElement = document.createElement('div');
  contentElement.classList.add('message-content');
  
  const textElement = document.createElement('span');
  textElement.classList.add('message-text');
  textElement.textContent = 'Chat history has been cleared for security.';
  
  const timeElement = document.createElement('span');
  timeElement.classList.add('timestamp');
  timeElement.textContent = getCurrentTime();
  
  contentElement.appendChild(textElement);
  contentElement.appendChild(timeElement);
  
  systemMessage.appendChild(contentElement);
  
  // Clear all messages and add the system message
  messageContainer.innerHTML = '';
  messageContainer.appendChild(systemMessage);
  
  // Add back the initial system messages
  setTimeout(() => {
    const initialMessage = document.createElement('div');
    initialMessage.classList.add('system-message');
    
    const initialContent = document.createElement('div');
    initialContent.classList.add('message-content');
    
    const initialText = document.createElement('span');
    initialText.classList.add('message-text');
    initialText.textContent = 'Secure channel re-established. This conversation will be permanently deleted when you leave.';
    
    const initialTime = document.createElement('span');
    initialTime.classList.add('timestamp');
    initialTime.textContent = getCurrentTime();
    
    initialContent.appendChild(initialText);
    initialContent.appendChild(initialTime);
    
    initialMessage.appendChild(initialContent);
    
    messageContainer.appendChild(initialMessage);
  }, 300);
});

// Add a welcome message after a short delay
setTimeout(() => {
  addMessage("Channel secure. You may begin communication.", false);
}, 1000);

// Warn user before leaving or refreshing
window.addEventListener('beforeunload', (e) => {
  const message = 'Leaving this page will permanently delete all messages. Are you sure?';
  e.returnValue = message;
  return message;
});