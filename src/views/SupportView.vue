<template>
  <div class="support-page">
    <div class="scanline-overlay"></div>
    <h2 class="glitch" data-text="SUPPORT CENTER">SUPPORT CENTER</h2>
    <div class="support-container">
      <!-- Ticket Submission Form -->
      <div class="ticket-form cyber-panel">
        <h3 class="section-title">CREATE NEW TICKET</h3>
        <div class="cyber-divider"></div>
        <div class="form-group">
          <label class="cyber-label">SUBJECT</label>
          <input
            v-model="newTicket.subject"
            class="cyber-input"
            placeholder="Brief issue description"
            maxlength="60"
          />
        </div>
        <div class="form-group">
          <label class="cyber-label">CATEGORY</label>
          <select v-model="newTicket.category" class="cyber-select">
            <option value="technical">TECHNICAL ISSUE</option>
            <option value="account">ACCOUNT PROBLEM</option>
            <option value="payment">PAYMENT ISSUE</option>
            <option value="other">OTHER</option>
          </select>
        </div>
        <div class="form-group">
          <label class="cyber-label">MESSAGE</label>
          <textarea
            v-model="newTicket.message"
            class="cyber-textarea"
            placeholder="Describe your issue in detail..."
            rows="5"
          ></textarea>
        </div>
        <div class="form-group">
          <label class="cyber-label">PRIORITY</label>
          <div class="priority-selector">
            <button
              v-for="level in priorityLevels"
              :key="level.value"
              @click="newTicket.priority = level.value"
              :class="{ active: newTicket.priority === level.value }"
              class="priority-btn"
              type="button"
            >
              <i :class="level.icon"></i> {{ level.label }}
            </button>
          </div>
        </div>
        <button @click="submitTicket" :disabled="!canSubmit" class="submit-btn cyber-button">
          <i class="fas fa-paper-plane"></i> SUBMIT TICKET
        </button>
      </div>

      <!-- Existing Tickets -->
      <div class="tickets-list cyber-panel">
        <h3 class="section-title">YOUR TICKETS</h3>
        <div class="cyber-divider"></div>
        <div v-if="loadingTickets" class="loading-indicator">
          <div class="pulse-dot"></div>
          <div class="pulse-dot"></div>
          <div class="pulse-dot"></div>
        </div>
        <div v-else-if="tickets.length === 0" class="empty-state">
          <i class="fas fa-ticket-alt"></i>
          <p>NO ACTIVE TICKETS FOUND</p>
        </div>
        <div v-else class="ticket-items">
          <div
            v-for="ticket in tickets"
            :key="ticket._id"
            @click="selectTicket(ticket)"
            :class="['ticket-item', `priority-${ticket.priority}`, { unread: !ticket.viewed }]"
          >
            <div class="ticket-header">
              <span class="ticket-id">#{{ ticket._id.slice(0, 8) }}</span>
              <span class="ticket-category">{{ formatCategory(ticket.category) }}</span>
              <span class="ticket-date">{{ formatDate(ticket.createdAt) }}</span>
            </div>
            <h4 class="ticket-subject">{{ ticket.subject }}</h4>
            <div class="ticket-status">
              <span :class="`status-${ticket.status}`">{{ ticket.status }}</span>
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <div v-if="selectedTicket" class="ticket-modal" @click.self="closeModal">
      <div class="modal-content cyber-panel">
        <div class="modal-header">
          <h3>TICKET #{{ selectedTicket._id.slice(0, 8) }}</h3>
          <button @click="closeModal" class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="ticket-meta">
            <div class="meta-item">
              <label>STATUS:</label>
              <span :class="`status-${selectedTicket.status}`">{{ selectedTicket.status }}</span>
            </div>
            <div class="meta-item">
              <label>PRIORITY:</label>
              <span :class="`priority-${selectedTicket.priority}`">{{
                selectedTicket.priority
              }}</span>
            </div>
            <div class="meta-item">
              <label>CREATED:</label>
              <span>{{ formatDate(selectedTicket.createdAt, true) }}</span>
            </div>
          </div>
          <div class="ticket-conversation">
            <div class="message user-message">
              <div class="message-header">
                <span class="sender">YOU</span>
                <span class="timestamp">{{ formatDate(selectedTicket.createdAt, true) }}</span>
              </div>
              <div class="message-content">
                <h4>{{ selectedTicket.subject }}</h4>
                <p>{{ selectedTicket.message }}</p>
              </div>
            </div>
            <div
              v-for="(reply, idx) in selectedTicket.replies"
              :key="reply._id || idx"
              class="message admin-message"
            >
              <div class="message-header">
                <span class="sender">SUPPORT</span>
                <span class="timestamp">{{ formatDate(reply.createdAt, true) }}</span>
              </div>
              <div class="message-content">
                <p>{{ reply.message }}</p>
              </div>
            </div>
          </div>
          <div v-if="selectedTicket.status !== 'closed'" class="ticket-reply">
            <textarea
              v-model="replyMessage"
              class="cyber-textarea"
              placeholder="Type your reply..."
              rows="3"
            ></textarea>
            <button @click="sendReply" class="reply-btn cyber-button">
              <i class="fas fa-reply"></i> SEND REPLY
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import api from '@/axios';

  // State
  const tickets = ref([]);
  const selectedTicket = ref(null);
  const loadingTickets = ref(true);
  const replyMessage = ref('');

  // Form data
  const newTicket = ref({
    subject: '',
    category: 'technical',
    message: '',
    priority: 'medium',
  });

  // Priority levels
  const priorityLevels = [
    { value: 'low', label: 'LOW', icon: 'fas fa-arrow-down' },
    { value: 'medium', label: 'MEDIUM', icon: 'fas fa-equals' },
    { value: 'high', label: 'HIGH', icon: 'fas fa-arrow-up' },
    { value: 'critical', label: 'CRITICAL', icon: 'fas fa-exclamation' },
  ];

  // Can submit?
  const canSubmit = computed(
    () => newTicket.value.subject.trim() && newTicket.value.message.trim()
  );

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      loadingTickets.value = true;
      const { data } = await api.get('/tickets');
      tickets.value = data;
    } catch (error) {
      console.error('Ticket fetch error:', error);
    } finally {
      loadingTickets.value = false;
    }
  };

  // Submit new ticket
  const submitTicket = async () => {
    try {
      const { data } = await api.post('/tickets', newTicket.value);
      tickets.value.unshift(data);
      resetForm();
    } catch (error) {
      console.error('Ticket submission error:', error);
    }
  };

  // Select ticket for modal
  const selectTicket = (ticket) => {
    selectedTicket.value = ticket;
    if (!ticket.viewed) ticket.viewed = true;
  };

  // Close modal
  const closeModal = () => {
    selectedTicket.value = null;
    replyMessage.value = '';
  };

  // Send reply
  const sendReply = async () => {
    if (!replyMessage.value.trim()) return;
    try {
      const { data } = await api.post(`/tickets/${selectedTicket.value._id}/replies`, {
        message: replyMessage.value,
      });
      selectedTicket.value.replies.push(data);
      replyMessage.value = '';
    } catch (error) {
      console.error('Reply error:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    newTicket.value = {
      subject: '',
      category: 'technical',
      message: '',
      priority: 'medium',
    };
  };

  // Format helpers
  const formatCategory = (category) => {
    const categories = {
      technical: 'TECH',
      account: 'ACCOUNT',
      payment: 'PAYMENT',
      other: 'OTHER',
    };
    return categories[category] || category.toUpperCase();
  };

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: withTime ? '2-digit' : undefined,
      minute: withTime ? '2-digit' : undefined,
      hour12: true,
    };
    return date.toLocaleString(undefined, options);
  };

  // Load tickets on mount
  onMounted(fetchTickets);
</script>

<style scoped>
  .support-page {
    padding: 20px;
    min-height: 100vh;
    background: #0a0a12;
    color: #c5c6c7;
    position: relative;
    overflow-x: hidden;
  }

  .scanline-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 255, 255, 0.05),
      rgba(0, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: -1; /* Changed from 0 to -1 to ensure it stays behind content */
  }

  .glitch {
    position: relative;
    color: #66fcf1;
    font-size: 2.5rem;
    text-align: center;
    margin: 1rem 0 2rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    z-index: 1; /* Added to ensure text stays above scanlines */
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch::before {
    left: 2px;
    text-shadow: -2px 0 #ff00ff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }

  .glitch::after {
    left: -2px;
    text-shadow: -2px 0 #00ffff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
  }

  @keyframes glitch-anim {
    0% {
      clip: rect(31px, 9999px, 94px, 0);
    }
    20% {
      clip: rect(112px, 9999px, 76px, 0);
    }
    40% {
      clip: rect(75px, 9999px, 107px, 0);
    }
    60% {
      clip: rect(42px, 9999px, 130px, 0);
    }
    80% {
      clip: rect(84px, 9999px, 106px, 0);
    }
    100% {
      clip: rect(58px, 9999px, 129px, 0);
    }
  }

  @keyframes glitch-anim2 {
    0% {
      clip: rect(65px, 9999px, 119px, 0);
    }
    20% {
      clip: rect(25px, 9999px, 145px, 0);
    }
    40% {
      clip: rect(110px, 9999px, 83px, 0);
    }
    60% {
      clip: rect(109px, 9999px, 52px, 0);
    }
    80% {
      clip: rect(20px, 9999px, 78px, 0);
    }
    100% {
      clip: rect(68px, 9999px, 109px, 0);
    }
  }

  .support-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    position: relative;
    z-index: 1; /* Added to ensure content stays above scanlines */
  }

  @media (min-width: 992px) {
    .support-container {
      grid-template-columns: 1fr 1fr;
    }
  }

  .cyber-panel {
    background: rgba(15, 20, 25, 0.8);
    border: 1px solid #45a29e;
    border-radius: 4px;
    padding: 1.5rem;
    box-shadow: 0 0 20px rgba(69, 162, 158, 0.1);
    position: relative;
    overflow: hidden;
    z-index: 1; /* Added to ensure panels stay above scanlines */
  }

  .cyber-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(102, 252, 241, 0.05), transparent);
    z-index: -1;
  }

  .section-title {
    color: #66fcf1;
    margin: 0 0 1rem;
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .cyber-divider {
    height: 2px;
    background: linear-gradient(90deg, #45a29e, #1f2833);
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    position: relative;
  }

  .cyber-label {
    display: block;
    margin-bottom: 0.5rem;
    color: #66fcf1;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .cyber-input,
  .cyber-select,
  .cyber-textarea {
    width: 100%;
    padding: 0.8rem;
    background: rgba(31, 40, 51, 0.5);
    border: 1px solid #45a29e;
    color: #c5c6c7;
    font-family: 'Courier New', monospace;
    border-radius: 4px;
    outline: none;
    transition: all 0.3s ease;
    position: relative;
  }

  .cyber-input:focus,
  .cyber-textarea:focus {
    border-color: #66fcf1;
    box-shadow: 0 0 10px rgba(102, 252, 241, 0.3);
  }

  .cyber-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2366fcf1'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.5rem;
  }

  .cyber-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .priority-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .priority-btn {
    padding: 0.5rem;
    background: rgba(31, 40, 51, 0.5);
    border: 1px solid #45a29e;
    color: #c5c6c7;
    font-family: 'Courier New', monospace;
    font-size: 0.7rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    position: relative;
  }

  .priority-btn:hover {
    border-color: #66fcf1;
  }

  .priority-btn.active {
    border-color: #66fcf1;
    background: rgba(102, 252, 241, 0.1);
    color: #66fcf1;
  }

  .priority-btn i {
    font-size: 1rem;
  }

  .submit-btn,
  .reply-btn {
    width: 100%;
    padding: 0.8rem;
    background: linear-gradient(135deg, #45a29e 0%, #1f2833 100%);
    border: 1px solid #66fcf1;
    color: #0b0c10;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
  }

  .submit-btn:hover,
  .reply-btn:hover {
    background: linear-gradient(135deg, #66fcf1 0%, #1f2833 100%);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ticket-items {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .ticket-item {
    background: rgba(31, 40, 51, 0.5);
    border: 1px solid #45a29e;
    border-radius: 4px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .ticket-item:hover {
    border-color: #66fcf1;
    box-shadow: 0 0 10px rgba(102, 252, 241, 0.2);
  }

  .ticket-item.unread {
    border-left: 3px solid #66fcf1;
  }

  .ticket-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.7rem;
    color: #66fcf1;
  }

  .ticket-subject {
    margin: 0.5rem 0;
    color: #fff;
    font-size: 0.9rem;
  }

  .ticket-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7rem;
    text-transform: uppercase;
  }

  .ticket-status i {
    color: #66fcf1;
  }

  .status-open {
    color: #4caf50;
  }
  .status-pending {
    color: #ff9800;
  }
  .status-closed {
    color: #f44336;
  }
  .status-resolved {
    color: #2196f3;
  }

  .priority-low {
    color: #4caf50;
  }
  .priority-medium {
    color: #ffc107;
  }
  .priority-high {
    color: #ff9800;
  }
  .priority-critical {
    color: #f44336;
  }

  .loading-indicator {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    padding: 2rem 0;
  }

  .pulse-dot {
    width: 12px;
    height: 12px;
    background: #66fcf1;
    border-radius: 50%;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .pulse-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .pulse-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  .empty-state {
    text-align: center;
    padding: 2rem 0;
    color: #45a29e;
  }

  .empty-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .empty-state p {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .ticket-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    padding: 1rem;
  }

  .modal-content {
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #45a29e;
  }

  .modal-header h3 {
    margin: 0;
    color: #66fcf1;
    font-size: 1.1rem;
  }

  .modal-close {
    background: transparent;
    border: none;
    color: #c5c6c7;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .modal-close:hover {
    color: #f44336;
  }

  .modal-body {
    padding: 1rem;
    overflow-y: auto;
    flex-grow: 1;
  }

  .ticket-meta {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.8rem;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-item label {
    color: #66fcf1;
    margin-bottom: 0.3rem;
    font-size: 0.7rem;
    text-transform: uppercase;
  }

  .ticket-conversation {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .message {
    padding: 1rem;
    border-radius: 4px;
    position: relative;
  }

  .user-message {
    background: rgba(69, 162, 158, 0.1);
    border-left: 3px solid #66fcf1;
  }

  .admin-message {
    background: rgba(31, 40, 51, 0.5);
    border-left: 3px solid #ff9800;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.7rem;
  }

  .sender {
    font-weight: bold;
    text-transform: uppercase;
  }

  .user-message .sender {
    color: #66fcf1;
  }

  .admin-message .sender {
    color: #ff9800;
  }

  .timestamp {
    color: #c5c6c7;
    opacity: 0.7;
  }

  .message-content h4 {
    margin: 0 0 0.5rem;
    color: #fff;
    font-size: 0.9rem;
  }

  .message-content p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    white-space: pre-line;
  }

  .ticket-reply {
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .glitch {
      font-size: 2rem;
    }

    .priority-selector {
      grid-template-columns: repeat(2, 1fr);
    }

    .ticket-meta {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 480px) {
    .support-page {
      padding: 10px;
    }

    .glitch {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .cyber-panel {
      padding: 1rem;
    }

    .ticket-meta {
      grid-template-columns: 1fr;
    }

    .modal-content {
      max-height: 85vh;
    }
  }
</style>
