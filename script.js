/* ============================================
   GLOBAL VARIABLES & INITIALIZATION
   ============================================ */
let currentUser = null;
let processes = [];
let erpCounter = 0;

// Sample data for search results
const mockOPData = [
    { id: 'ID001', op: 'OP-2024-001', supplier: 'Fornecedor A', invoiceNumber: 'NF-001', invoiceValue: 5000, issueDate: '2024-01-10', dueDate: '2024-02-10' },
    { id: 'ID002', op: 'OP-2024-002', supplier: 'Fornecedor B', invoiceNumber: 'NF-002', invoiceValue: 7500, issueDate: '2024-01-15', dueDate: '2024-02-15' },
    { id: 'ID003', op: 'OP-2024-003', supplier: 'Fornecedor C', invoiceNumber: 'NF-003', invoiceValue: 3200, issueDate: '2024-01-20', dueDate: '2024-02-20' },
    { id: 'ID004', op: 'OP-2024-004', supplier: 'Fornecedor A', invoiceNumber: 'NF-004', invoiceValue: 9100, issueDate: '2024-01-25', dueDate: '2024-02-25' },
    { id: 'ID005', op: 'OP-2024-005', supplier: 'Fornecedor D', invoiceNumber: 'NF-005', invoiceValue: 4500, issueDate: '2024-02-01', dueDate: '2024-03-01' },
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
    
    // Hide login and show main container
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'flex';
    
    // Clear form
    document.getElementById('loginForm').reset();
});

/* ============================================
   NAVIGATION & SECTION DISPLAY
   ============================================ */
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Add active class to clicked menu item
    event.target.closest('.menu-item').classList.add('active');
}

/* ============================================
   LOGOUT FUNCTIONALITY
   ============================================ */
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Deseja realmente sair do sistema?')) {
        currentUser = null;
        
        // Hide main container and show login
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('loginContainer').style.display = 'grid';
        
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
        item.id.toLowerCase().includes(searchTerm)
    );
    
    if (results.length === 0) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
    }
    
    // Display results
    searchResults.classList.add('active');
    searchResults.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="selectSearchResult('${result.id}', '${result.op}', '${result.supplier}', '${result.invoiceNumber}', ${result.invoiceValue}, '${result.issueDate}', '${result.dueDate}')">
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
    document.getElementById('invoiceNumber').value = invoiceNumber;
    document.getElementById('invoiceValue').value = invoiceValue.toFixed(2);
    document.getElementById('issueDate').value = issueDate;
    document.getElementById('dueDate').value = dueDate;
    
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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    // Check required fields
    if (!data.op || !data.supplier || !data.invoiceNumber || !data.invoiceValue) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return false;
    }
    
    // Validate dates
    if (!dateRegex.test(data.issueDate) || !dateRegex.test(data.dueDate)) {
        alert('Datas inválidas');
        return false;
    }
    
    // Validate that due date is after issue date
    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);
    
    if (dueDate < issueDate) {
        alert('A data de vencimento deve ser posterior à data de emissão');
        return false;
    }
    
    // Validate invoice value
    if (parseFloat(data.invoiceValue) <= 0) {
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
    // Set focus to first input on page load
    document.getElementById('email').focus();
});

/* ============================================
   FORM INPUT MASKING
   ============================================ */
document.getElementById('invoiceValue').addEventListener('input', function(e) {
    // Format currency input
    let value = e.target.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2);
    if (!isNaN(value)) {
        e.target.value = value;
    }
});

/* ============================================
   DATE VALIDATION
   ============================================ */
document.getElementById('issueDate').addEventListener('change', function() {
    const issueDate = new Date(this.value);
    const dueDate = document.getElementById('dueDate');
    
    // Set minimum due date to issue date
    const minDate = new Date(issueDate);
    minDate.setDate(minDate.getDate() + 1);
    
    dueDate.min = minDate.toISOString().split('T')[0];
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
    document.getElementById('issueDate').value = '2024-06-01';
    document.getElementById('dueDate').value = '2024-07-01';
    document.getElementById('observations').value = 'Dados de teste para demonstração';
    
    // Scroll to form
    document.querySelector('.process-form').scrollIntoView({ behavior: 'smooth' });
}

// Make demo loader accessible via console
window.loadDemoData = loadDemoData;
