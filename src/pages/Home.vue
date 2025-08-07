<template>
  <div class="dark-market">
    <!-- Animated Terminal Header -->
    <div class="terminal-header">
      <div class="terminal-title">darkmarket://root-access</div>
    </div>

    <!-- Main Content -->
    <main class="market-container">
      <div class="market-header">
        <h1 class="glitch" data-text="DARK_MARKET_V3">DARK_MARKET_V3</h1>
        <p class="encrypted-text">[ENCRYPTED CONNECTION ESTABLISHED]</p>
      </div>

      <!-- Category Grid -->
      <div class="category-grid">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/products/${category.slug}`"
          class="category-card"
        >
          <div class="category-icon">
            <i :class="category.icon"></i>
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
          <div class="access-level">
            <span class="access-badge" :class="category.accessClass">{{
              category.accessLevel
            }}</span>
          </div>
        </router-link>
      </div>

      <div class="market-footer">
        <p class="disclaimer">[ ALL TRANSACTIONS ARE ENCRYPTED AND ANONYMOUS ]</p>
        <div class="connection-status">
          <span class="status-indicator active"></span>
          <span>T0R_ACTIVE</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  const categories = [
    {
      id: 1,
      name: 'DIGITAL GOODS',
      slug: 'digital',
      icon: 'fas fa-lock',
      description: 'Accounts, licenses, and digital assets',
      accessLevel: 'LEVEL 1',
      accessClass: 'level1',
    },
    {
      id: 2,
      name: 'PHARMACEUTICALS',
      slug: 'pharma',
      icon: 'fas fa-prescription-bottle-alt',
      description: 'Quality substances and medications',
      accessLevel: 'LEVEL 2',
      accessClass: 'level2',
    },
    {
      id: 3,
      name: 'SECURITY TOOLS',
      slug: 'security',
      icon: 'fas fa-shield-alt',
      description: 'Penetration testing software',
      accessLevel: 'LEVEL 3',
      accessClass: 'level3',
    },
    {
      id: 4,
      name: 'PRIVACY SERVICES',
      slug: 'privacy',
      icon: 'fas fa-user-secret',
      description: 'Identity protection solutions',
      accessLevel: 'LEVEL 2',
      accessClass: 'level2',
    },
    {
      id: 5,
      name: 'FORGED DOCUMENTS',
      slug: 'documents',
      icon: 'fas fa-passport',
      description: 'High-quality replicas',
      accessLevel: 'LEVEL 4',
      accessClass: 'level4',
    },
    {
      id: 6,
      name: 'EXCLUSIVE ACCESS',
      slug: 'exclusive',
      icon: 'fas fa-key',
      description: 'VIP memberships and privileges',
      accessLevel: 'LEVEL 5',
      accessClass: 'level5',
    },
  ];
</script>

<style scoped>
  .dark-market {
    background-color: #0a0a0a;
    color: #00ff41;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
    padding: 1rem;
    overflow-x: hidden;
  }

  .terminal-header {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #121212;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom: 1px solid #1e1e1e;
  }

  .terminal-controls {
    display: flex;
    gap: 0.5rem;
  }

  .terminal-btn {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
  }

  .terminal-btn.red {
    background-color: #ff5f56;
  }
  .terminal-btn.yellow {
    background-color: #ffbd2e;
  }
  .terminal-btn.green {
    background-color: #27c93f;
  }

  .terminal-title {
    margin-left: 1rem;
    font-size: 0.8rem;
    color: #666;
    letter-spacing: 0.5px;
  }

  .market-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    border-left: 1px solid #1a1a1a;
    border-right: 1px solid #1a1a1a;
    border-bottom: 1px solid #1a1a1a;
    position: relative;
  }

  .market-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #00ff41, transparent);
  }

  .market-header {
    text-align: center;
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    position: relative;
  }

  .market-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 25%;
    width: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #1e1e1e, transparent);
  }

  .glitch-container {
    position: relative;
    display: inline-block;
  }

  .glitch {
    position: relative;
    color: #00ff41;
    font-size: 3rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin: 0;
    line-height: 1;
    animation: text-flicker 3s linear infinite;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0a0a0a;
  }

  .glitch::before {
    left: 2px;
    text-shadow: -2px 0 #ff00ff;
    animation: noise-anim-1 15s infinite linear alternate-reverse;
  }

  .glitch::after {
    left: -2px;
    text-shadow: 2px 0 #00ffea;
    animation: noise-anim-2 15s infinite linear alternate-reverse;
  }

  @keyframes noise-anim-1 {
    0% {
      clip-path: inset(32% 0 39% 0);
    }
    5% {
      clip-path: inset(55% 0 9% 0);
    }
    10% {
      clip-path: inset(25% 0 58% 0);
    }
    15% {
      clip-path: inset(89% 0 3% 0);
    }
    20% {
      clip-path: inset(52% 0 31% 0);
    }
    25% {
      clip-path: inset(16% 0 67% 0);
    }
    30% {
      clip-path: inset(76% 0 12% 0);
    }
    35% {
      clip-path: inset(44% 0 32% 0);
    }
    40% {
      clip-path: inset(28% 0 61% 0);
    }
    45% {
      clip-path: inset(93% 0 4% 0);
    }
    50% {
      clip-path: inset(8% 0 85% 0);
    }
    55% {
      clip-path: inset(63% 0 21% 0);
    }
    60% {
      clip-path: inset(37% 0 42% 0);
    }
    65% {
      clip-path: inset(19% 0 70% 0);
    }
    70% {
      clip-path: inset(81% 0 6% 0);
    }
    75% {
      clip-path: inset(47% 0 39% 0);
    }
    80% {
      clip-path: inset(23% 0 64% 0);
    }
    85% {
      clip-path: inset(72% 0 19% 0);
    }
    90% {
      clip-path: inset(34% 0 53% 0);
    }
    95% {
      clip-path: inset(12% 0 79% 0);
    }
    100% {
      clip-path: inset(88% 0 5% 0);
    }
  }

  @keyframes noise-anim-2 {
    0% {
      clip-path: inset(61% 0 12% 0);
    }
    5% {
      clip-path: inset(33% 0 54% 0);
    }
    10% {
      clip-path: inset(78% 0 7% 0);
    }
    15% {
      clip-path: inset(42% 0 45% 0);
    }
    20% {
      clip-path: inset(19% 0 68% 0);
    }
    25% {
      clip-path: inset(87% 0 4% 0);
    }
    30% {
      clip-path: inset(56% 0 31% 0);
    }
    35% {
      clip-path: inset(27% 0 60% 0);
    }
    40% {
      clip-path: inset(73% 0 16% 0);
    }
    45% {
      clip-path: inset(38% 0 49% 0);
    }
    50% {
      clip-path: inset(14% 0 79% 0);
    }
    55% {
      clip-path: inset(67% 0 21% 0);
    }
    60% {
      clip-path: inset(45% 0 43% 0);
    }
    65% {
      clip-path: inset(22% 0 66% 0);
    }
    70% {
      clip-path: inset(83% 0 8% 0);
    }
    75% {
      clip-path: inset(51% 0 36% 0);
    }
    80% {
      clip-path: inset(29% 0 59% 0);
    }
    85% {
      clip-path: inset(77% 0 12% 0);
    }
    90% {
      clip-path: inset(41% 0 47% 0);
    }
    95% {
      clip-path: inset(18% 0 75% 0);
    }
    100% {
      clip-path: inset(94% 0 3% 0);
    }
  }

  @keyframes text-flicker {
    0%,
    7%,
    9%,
    11%,
    100% {
      opacity: 1;
    }
    8%,
    10% {
      opacity: 0.8;
    }
  }

  .encrypted-text {
    color: #666;
    font-size: 0.9rem;
    letter-spacing: 1px;
    margin-top: 0.5rem;
    animation: fade-pulse 4s ease-in-out infinite;
  }

  @keyframes fade-pulse {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .category-card {
    background-color: #121212;
    border: 1px solid #1e1e1e;
    padding: 1.5rem;
    transition: all 0.3s ease;
    text-decoration: none;
    color: #00ff41;
    position: relative;
    overflow: hidden;
  }

  .category-card:hover {
    border-color: #00ff41;
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 255, 65, 0.1);
  }

  .category-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
    transition: 0.5s;
  }

  .category-card:hover::before {
    left: 100%;
  }

  .category-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #00ff41;
    text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
  }

  .category-card h3 {
    margin: 0.5rem 0;
    font-size: 1.2rem;
    letter-spacing: 1px;
  }

  .category-card p {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    min-height: 40px;
    line-height: 1.5;
  }

  .access-level {
    margin-top: 1rem;
    text-align: right;
  }

  .access-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .level1 {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    border: 1px solid #4caf50;
  }
  .level2 {
    background-color: rgba(255, 235, 59, 0.1);
    color: #ffeb3b;
    border: 1px solid #ffeb3b;
  }
  .level3 {
    background-color: rgba(255, 87, 34, 0.1);
    color: #ff5722;
    border: 1px solid #ff5722;
  }
  .level4 {
    background-color: rgba(33, 150, 243, 0.1);
    color: #2196f3;
    border: 1px solid #2196f3;
  }
  .level5 {
    background-color: rgba(156, 39, 176, 0.1);
    color: #9c27b0;
    border: 1px solid #9c27b0;
  }

  .market-footer {
    margin-top: 3rem;
    text-align: center;
    padding-top: 2rem;
    position: relative;
  }

  .market-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 25%;
    width: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #1e1e1e, transparent);
  }

  .disclaimer {
    color: #666;
    font-size: 0.8rem;
    letter-spacing: 1px;
    margin-bottom: 1rem;
  }

  .connection-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    font-size: 0.8rem;
    padding: 0.3rem 0.8rem;
    background-color: rgba(0, 255, 65, 0.05);
    border-radius: 20px;
    border: 1px solid rgba(0, 255, 65, 0.2);
  }

  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-indicator.active {
    background-color: #00ff41;
    box-shadow: 0 0 10px #00ff41;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .glitch {
      font-size: 2rem;
    }

    .category-grid {
      grid-template-columns: 1fr;
    }

    .market-container {
      padding: 1rem;
      border-left: none;
      border-right: none;
    }
  }
</style>
