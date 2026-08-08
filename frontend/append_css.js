const fs = require('fs');
const css = `

/* RESPONSIVE DESIGN (Compatible Mode) */
@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
    padding-top: 60px;
  }
  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    padding: 1rem;
    border-right: none;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
  }
  .sidebar-menu {
    display: flex;
    gap: 0.5rem;
  }
  .sidebar-menu li {
    margin-bottom: 0;
  }
  .sidebar-menu a {
    white-space: nowrap;
    padding: 0.5rem 1rem;
  }
  .main-content {
    margin-left: 0;
    padding: 1.5rem 1rem;
  }
  .choice-grid {
    grid-template-columns: 1fr !important;
  }
  .metrics-grid {
    grid-template-columns: 1fr !important;
  }
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  .hero h1 {
    font-size: 2.5rem !important;
  }
  .hero p {
    font-size: 1rem !important;
  }
  .navbar {
    padding: 0.8rem 5%;
  }
  .nav-links a, .nav-links button {
    font-size: 0.75rem !important;
  }
  #volNameNav {
    display: none;
  }
}
`;
fs.appendFileSync('style.css', css);
console.log('Appended successfully');
