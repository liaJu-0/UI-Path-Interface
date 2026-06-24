/* ============================================
   GLOBAL VARIABLES & INITIALIZATION
   ============================================ */
let currentUser = null;
let processes = [];
let erpCounter = 0;

/* ============================================
   ROUTING (URLs reais para login / dashboard / processos / relatórios / configurações)
   ============================================ */
const VALID_SECTIONS = ['dashboard', 'processos', 'relatorios', 'configuracoes'];

function isLoggedIn() {
    return currentUser !== null;
}

// Aplica a rota atual (com base no path da URL) à interface, sem empilhar histórico
function applyRoute(path) {
    let route = path.replace(/^\/+|\/+$/g, ''); // remove barras nas pontas

    if (!isLoggedIn()) {
        // Sem sessão, sempre cai no login
        showLoginScreen();
        if (route !== 'login') {
            history.replaceState({ section: 'login' }, '', '/login');
        }
        return;
    }

    if (!VALID_SECTIONS.includes(route)) {
        route = 'dashboard';
    }

    showMainScreen();
    activateSection(route);
    history.replaceState({ section: route }, '', '/' + route);
}

// Atualiza a URL do navegador (cria uma nova entrada no histórico)
function navigateTo(path) {
    const section = path.replace(/^\/+/, '');
    history.pushState({ section: section }, '', path);
}

function showLoginScreen() {
    document.getElementById('loginContainer').style.display = 'grid';
    document.getElementById('mainContainer').style.display = 'none';
}

function showMainScreen() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'flex';
}

// Ativa visualmente a seção (sem tocar na URL) — usado pelo roteador
function activateSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    const menuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
}

// Responde ao botão voltar/avançar do navegador
window.addEventListener('popstate', function() {
    applyRoute(window.location.pathname);
});

// Sample data for search results
const mockOPData = [
    { id: 'ID001', op: 'OP-2024-001', supplier: 'Fornecedor A', invoiceNumber: '', invoiceValue: '', issueDate: '', dueDate: '', observations: '' },
    { id: 'ID002', op: 'OP-2024-002', supplier: 'Fornecedor B', invoiceNumber: '', invoiceValue: '', issueDate: '', dueDate: '', observations: '' },
    { id: 'ID003', op: 'OP-2024-003', supplier: 'Fornecedor C', invoiceNumber: '', invoiceValue: '', issueDate: '', dueDate: '', observations: '' },
    { id: 'ID004', op: 'OP-2024-004', supplier: 'Fornecedor A', invoiceNumber: '', invoiceValue: '', issueDate: '', dueDate: '', observations: '' },
    { id: 'ID005', op: 'OP-2024-005', supplier: 'Fornecedor D', invoiceNumber: '', invoiceValue: '', issueDate: '', dueDate: '', observations: '' },
];

/* ============================================
   LOGIN FUNCTIONALITY
   ============================================ */
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    // Simulate login (in a real app, this would be sent to a server)
    currentUser = {
        email: email,
        name: email.split('@')[0].toUpperCase()
    };
    
    // Update UI
    document.getElementById('userName').textContent = currentUser.name;
    
    // Show main container and navigate to dashboard with a real URL
    showMainScreen();
    activateSection('dashboard');
    navigateTo('/dashboard');
    
    // Clear form
    document.getElementById('loginForm').reset();
});

/* ============================================
   NAVIGATION & SECTION DISPLAY
   ============================================ */
function showSection(sectionId) {
    activateSection(sectionId);
    navigateTo('/' + sectionId);
}

/* ============================================
   LOGOUT FUNCTIONALITY
   ============================================ */
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Deseja realmente sair do sistema?')) {
        currentUser = null;
        
        // Hide main container and show login
        showLoginScreen();
        navigateTo('/login');
        
        // Reset form
        document.getElementById('loginForm').reset();
    }
});

/* ============================================
   SEARCH FUNCTIONALITY
   ============================================ */
function searchOP() {
    const searchTerm = document.getElementById('searchOP').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    if (searchTerm.length < 2) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
    }
    
    // Filter mock data based on search term
    const results = mockOPData.filter(item => 
        item.op.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm) ||
        item.supplier.toLowerCase().includes(searchTerm)
    );
    
    if (results.length === 0) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
    }
    
    // Display results
    searchResults.classList.add('active');
    searchResults.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="selectSearchResult('${result.id}', '${result.op}', '${result.supplier}', '${result.invoiceNumber}', '${result.invoiceValue}', '${result.issueDate}', '${result.dueDate}')">
            <strong>${result.op}</strong> - ${result.id} - ${result.supplier}
        </div>
    `).join('');
}

function performSearch() {
    const searchTerm = document.getElementById('searchOP').value;
    if (searchTerm.length === 0) {
        alert('Por favor, digite algo para pesquisar');
        return;
    }
    searchOP();
}

function selectSearchResult(id, op, supplier, invoiceNumber, invoiceValue, issueDate, dueDate) {
    // Populate form with selected result
    document.getElementById('processID').value = id;
    document.getElementById('op').value = op;
    document.getElementById('supplier').value = supplier;
    document.getElementById('invoiceNumber').value = invoiceNumber || '';
    document.getElementById('invoiceValue').value = invoiceValue || '';
    document.getElementById('issueDate').value = issueDate || '';
    document.getElementById('dueDate').value = dueDate || '';
    
    // Hide search results
    document.getElementById('searchResults').classList.remove('active');
    document.getElementById('searchOP').value = '';
    
    // Scroll to form
    document.querySelector('.process-form').scrollIntoView({ behavior: 'smooth' });
}

/* ============================================
   FORM SUBMISSION
   ============================================ */
document.getElementById('processForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Generate ERP code
    const erpCode = `ERP${String(erpCounter++).padStart(4, '0')}`;
    
    // Get form data
    const processData = {
        processID: document.getElementById('processID').value || erpCode,
        erpCode: erpCode,
        op: document.getElementById('op').value,
        supplier: document.getElementById('supplier').value,
        invoiceNumber: document.getElementById('invoiceNumber').value,
        invoiceValue: document.getElementById('invoiceValue').value,
        issueDate: document.getElementById('issueDate').value,
        dueDate: document.getElementById('dueDate').value,
        observations: document.getElementById('observations').value,
        createdAt: new Date().toLocaleString('pt-BR'),
        status: 'Processado'
    };
    
    // Validation
    if (!validateForm(processData)) {
        return;
    }
    
    // Save to processes array
    processes.push(processData);
    
    // Show success message
    showSuccessModal(`Código ERP: ${erpCode}`);
    
    // Reset form
    clearForm();
    
    // Log data (for demo purposes)
    console.log('Novo processo criado:', processData);
});

/* ============================================
   FORM VALIDATION
   ============================================ */
function validateForm(data) {
    // Check required fields
    if (!data.op || !data.supplier || !data.invoiceNumber || !data.invoiceValue) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return false;
    }
    
    // Validate dates (formato dd/mm/aaaa)
    const issueDate = parseBrDate(data.issueDate);
    const dueDate = parseBrDate(data.dueDate);

    if (!issueDate || !dueDate) {
        alert('Datas inválidas. Use o formato dd/mm/aaaa');
        return false;
    }
    
    // Validate that due date is after issue date
    if (dueDate < issueDate) {
        alert('A data de vencimento deve ser posterior à data de emissão');
        return false;
    }
    
    // Validate invoice value
    if (parseBrCurrency(data.invoiceValue) <= 0) {
        alert('O valor da fatura deve ser maior que zero');
        return false;
    }
    
    return true;
}

/* ============================================
   FORM UTILITIES
   ============================================ */
function clearForm() {
    document.getElementById('processForm').reset();
    document.getElementById('processID').value = '';
    document.getElementById('searchOP').value = '';
    document.getElementById('searchResults').classList.remove('active');
}

function generateProcessID() {
    return `PROC-${new Date().getTime()}`;
}

/* ============================================
   MODAL FUNCTIONALITY
   ============================================ */
function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    document.getElementById('modalMessage').textContent = message;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        closeModal();
    }
});

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */
document.addEventListener('keydown', function(event) {
    // Escape key closes modal
    if (event.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl/Cmd + S submits form
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (document.getElementById('mainContainer').style.display !== 'none') {
            document.getElementById('processForm').dispatchEvent(new Event('submit'));
        }
    }
});

/* ============================================
   LOCAL STORAGE
   ============================================ */
function saveProcessesToStorage() {
    localStorage.setItem('processes', JSON.stringify(processes));
}

function loadProcessesFromStorage() {
    const stored = localStorage.getItem('processes');
    if (stored) {
        processes = JSON.parse(stored);
    }
}

// Load processes when page loads
window.addEventListener('load', function() {
    loadProcessesFromStorage();
});

// Auto-save to local storage every 30 seconds
setInterval(function() {
    if (processes.length > 0) {
        saveProcessesToStorage();
    }
}, 30000);

/* ============================================
   DEBUGGING & UTILITIES
   ============================================ */
window.getProcesses = function() {
    console.table(processes);
    return processes;
};

window.exportProcessesAsJSON = function() {
    const dataStr = JSON.stringify(processes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processes_${new Date().toISOString()}.json`;
    link.click();
};

/* ============================================
   AUTO-POPULATE PROCESS ID
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    // Aplica a rota com base na URL atual (login/dashboard/processos/relatorios/configuracoes)
    applyRoute(window.location.pathname);

    // Se a tela de login estiver visível, foca no campo de e-mail
    if (!isLoggedIn()) {
        document.getElementById('email').focus();
    }
});

/* ============================================
   FORM INPUT MASKING
   ============================================ */
function parseBrCurrency(value) {
    if (!value) return NaN;
    const normalized = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized);
}

document.getElementById('invoiceValue').addEventListener('input', function(e) {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits === '') {
        e.target.value = '';
        return;
    }
    let value = (parseInt(digits, 10) / 100).toFixed(2);
    e.target.value = value.replace('.', ',');
});

/* ============================================
   DATE MASK & VALIDATION (dd/mm/aaaa)
   ============================================ */
// Aplica máscara dd/mm/aaaa enquanto o usuário digita
function applyDateMask(inputEl) {
    inputEl.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '').slice(0, 8);
        let formatted = value;
        if (value.length > 4) {
            formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        e.target.value = formatted;
    });
}

// Converte "dd/mm/aaaa" em um objeto Date (ou null se inválido)
function parseBrDate(value) {
    if (!value) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const date = new Date(year, month - 1, day);

    // Garante que a data existe de fato (ex: 31/02 é inválido)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }
    return date;
}

applyDateMask(document.getElementById('issueDate'));
applyDateMask(document.getElementById('dueDate'));

document.getElementById('issueDate').addEventListener('change', function() {
    // Apenas valida o formato; a comparação entre as datas é feita no submit
    if (this.value && !parseBrDate(this.value)) {
        this.style.borderColor = '#ef4444';
    }
});

/* ============================================
   REAL-TIME FORM VALIDATION
   ============================================ */
const requiredFields = ['op', 'supplier', 'invoiceNumber', 'invoiceValue', 'issueDate', 'dueDate'];

requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '';
            }
        });
    }
});

/* ============================================
   DEMO DATA LOADER
   ============================================ */
function loadDemoData() {
    // Populate form with demo data
    document.getElementById('op').value = 'OP-2024-TEST-001';
    document.getElementById('supplier').value = 'Empresa Teste LTDA';
    document.getElementById('invoiceNumber').value = 'NF-TEST-001';
    document.getElementById('invoiceValue').value = '5000.00';
    document.getElementById('issueDate').value = '01/06/2024';
    document.getElementById('dueDate').value = '01/07/2024';
    document.getElementById('observations').value = 'Dados de teste para demonstração';
    
    // Scroll to form
    document.querySelector('.process-form').scrollIntoView({ behavior: 'smooth' });
}

// Make demo loader accessible via console
window.loadDemoData = loadDemoData;




