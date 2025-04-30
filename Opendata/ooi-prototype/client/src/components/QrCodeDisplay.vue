<template>
    <div class="qr-code-display">
      <h3>Your Invitation Method</h3>
      <p class="qr-instructions">
        Share this QR code or link to invite others. Scanning the code or clicking
        the link allows others to join the observation lineage through you.
      </p>
      <div class="qr-content">
        <div class="qr-code-wrapper" ref="qrCodeElement">
          <qrcode-vue
            v-if="qrCodeInviteUrl"
            :value="qrCodeInviteUrl"
            :size="qrSize"
            level="H"
            render-as="svg"
            :margin="2"
            :foreground="qrColors.foreground"
            :background="qrColors.background"
            class="qr-code-img"
          />
          <div v-else class="loading-message">Generating QR...</div>
        </div>
        <div class="qr-actions">
          <input type="text" :value="cleanFrontendInviteUrl" readonly ref="inviteUrlInput" class="invite-url-input"/>
          <button @click="copyUrl" title="Copy Link" class="action-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            Copy
          </button>
          <button @click="saveQrCode" title="Save QR Code" class="action-button">
             <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
            Save
          </button>
        </div>
        <p v-if="actionStatus" :class="actionStatus.type">{{ actionStatus.message }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, nextTick } from 'vue';
  import QrcodeVue from 'qrcode.vue';
  
  const props = defineProps({
    invitationToken: {
      type: String,
      required: true,
      default: '',
    },
    odaiId: { // Needed for filename suggestion
        type: String,
        default: 'invite'
    }
  });
  
  const qrSize = ref(180); // Adjust size as needed
  const qrColors = ref({ foreground: '#00FF00', background: '#000000' }); // Green on black
  const inviteUrlInput = ref(null);
  const qrCodeElement = ref(null); // Ref for the QR code wrapper div
  const actionStatus = ref(null); // { type: 'success'/'error', message: '...' }
  
  // Construct the FULL frontend invite URL
  const cleanFrontendInviteUrl = computed(() => {
    if (!props.invitationToken) return '';
    // Use window.location.origin to get the base URL of the frontend app
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/invite/${props.invitationToken}`; // Points to frontend route
  });
  
  // URL specifically for the QR CODE (includes source parameter)
  const qrCodeInviteUrl = computed(() => {
    if (!cleanFrontendInviteUrl.value) return '';
    return `${cleanFrontendInviteUrl.value}?source=qr`; // Append source=qr
  });

  function showStatus(message, type = 'success', duration = 2500) {
      actionStatus.value = { type, message };
      setTimeout(() => {
          actionStatus.value = null;
      }, duration);
  }
  
  const copyUrl = () => {
    if (inviteUrlInput.value && cleanFrontendInviteUrl.value) {
      inviteUrlInput.value.select();
      try {
        navigator.clipboard.writeText(fullInviteUrl.value).then(() => {
           showStatus('Link copied to clipboard!', 'success');
        }, (err) => {
           // Fallback for older browsers maybe needed? execCommand is deprecated
           console.error('Async clipboard write failed: ', err);
           // Try execCommand as fallback (less reliable)
           document.execCommand('copy'); // This might fail silently or throw
           showStatus('Link copied (fallback)!', 'success');
        });
      } catch (err) {
        console.error('Failed to copy URL: ', err);
        showStatus('Failed to copy link.', 'error');
      }
    }
  };
  
  const saveQrCode = async () => {
      if (!qrCodeElement.value || !qrCodeInviteUrl.value) return;
  
      try {
          await nextTick(); // Ensure SVG is rendered
          const svgElement = qrCodeElement.value.querySelector('svg.qr-code-img');
          if (!svgElement) {
               throw new Error("QR Code SVG element not found.");
          }
  
          // 1. Serialize SVG to XML string
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svgElement);
  
          // 2. Create a Canvas
          const canvas = document.createElement('canvas');
          // Add padding for the border/margin visually
          const padding = 20;
          canvas.width = qrSize.value + padding * 2;
          canvas.height = qrSize.value + padding * 2;
          const ctx = canvas.getContext('2d');
  
          // 3. Fill canvas background (optional, if QR background isn't opaque)
          ctx.fillStyle = qrColors.value.background; // Use QR background color
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          // 4. Create an Image element and load the SVG string as a Blob URL
          const img = new Image();
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
  
          img.onload = () => {
              // 5. Draw the loaded SVG onto the canvas with padding
              ctx.drawImage(img, padding, padding, qrSize.value, qrSize.value);
              URL.revokeObjectURL(url); // Clean up Blob URL
  
              // 6. Create download link
              const dataUrl = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              // Suggest filename including ODAI ID if available
              const filename = `OOI_${props.odaiId.replace('#', '')}_invite.png`;
              link.download = filename;
              link.href = dataUrl;
              document.body.appendChild(link); // Required for Firefox
              link.click();
              document.body.removeChild(link);
              showStatus('QR Code saved!', 'success');
          };
          img.onerror = (err) => {
              console.error("Error loading SVG image for saving:", err);
              URL.revokeObjectURL(url); // Clean up Blob URL on error
              showStatus('Error preparing QR Code image.', 'error');
          }
          img.src = url;
  
      } catch (error) {
          console.error('Error saving QR code:', error);
          showStatus('Failed to save QR code.', 'error');
      }
  };
  
  // Reset status when token changes
  watch(() => props.invitationToken, () => {
      actionStatus.value = null;
  });
  
  </script>
  
  <style scoped>
  .qr-code-display {
    border: 1px solid #0f0;
    padding: 20px;
    margin-top: 30px;
    background-color: rgba(0, 30, 0, 0.2);
    border-radius: 8px;
    text-align: center;
  }
  h3 {
      color: #eee;
      margin-bottom: 15px;
  }
  .qr-instructions {
      font-size: 0.9em;
      color: #ccc;
      max-width: 400px;
      margin: 0 auto 20px auto;
  }
  .qr-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px; /* Space between QR and actions */
  }
  .qr-code-wrapper {
      border: 5px solid #0f0; /* Match border color */
      padding: 5px; /* Space between border and QR */
      background-color: #000; /* Ensure black bg behind QR */
      display: inline-block; /* Fit content */
      line-height: 0; /* Prevent extra space below svg/canvas */
  }
  .qr-code-img {
      display: block; /* Prevent extra space */
  }
  .qr-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px; /* Space between input and buttons */
      width: 100%;
      max-width: 400px; /* Limit width */
      flex-wrap: wrap;
  }
  .invite-url-input {
      flex-grow: 1;
      min-width: 150px;
  }
  .action-button {
      padding: 8px 10px; /* Smaller padding */
      display: inline-flex; /* Align icon and text */
      align-items: center;
      gap: 5px; /* Space between icon and text */
      font-size: 0.9em;
  }
  .action-button svg {
      vertical-align: middle;
  }
  
  /* Status message styles */
  .success { color: #0f0; }
  .error { color: #f00; }
  </style>