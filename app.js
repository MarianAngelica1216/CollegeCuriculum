/**
 * Curriculum Calculator Application Logic
 * Supports 4 Years x 4 Terms, 5-column term tables, full drag & drop,
 * real-time credit unit calculation, prerequisite checking, and color customization.
 */

// Global Application State
const state = {
  courses: [],
  curriculum: {}, // { 'y1-t1': ['course-math101', ...], ... }
  termStatuses: {}, // { 'y1-t1': 'accomplished', 'y1-t2': 'accomplished', 'y1-t3': 'current', ... }
  activeYear: 1,  // 1, 2, 3, 4, or 'all'
  bankFilter: 'unassigned', // 'unassigned', 'assigned', 'all'
  statusFilter: 'all', // 'all', 'finished', 'unfinished'
  colorFilter: 'all',  // 'all' or color hex code
  expandedCards: new Set(),
  searchTerm: '',
  theme: 'dark',
  compareMode: false
};

// Term metadata
const YEARS = [1, 2, 3, 4];
const TERMS_PER_YEAR = [1, 2, 3, 4];

// Color presets for quick selection (Warm Maroon, Peach, Navy, Spruce, Petrol, Coral)
const COLOR_PRESETS = [
  '#800020', '#FFC09F', '#1B2A4A', '#2A9D8F', '#F4A261', '#E76F51',
  '#489FB5', '#991B1B', '#6B1414', '#15803D', '#D97706', '#8B5CF6'
];

// Selected color in creation form
let selectedFormColor = COLOR_PRESETS[0];

// DOM Element References
let dom = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  loadState();
  bindEvents();
  render();
});

function cacheDOM() {
  dom = {
    // Header & Stats
    totalUnitsEl: document.getElementById('totalUnits'),
    finishedUnitsEl: document.getElementById('finishedUnits'),
    unitsLeftEl: document.getElementById('unitsLeft'),
    prereqConflictsEl: document.getElementById('prereqConflicts'),
    headerMenuToggleBtn: document.getElementById('headerMenuToggleBtn'),
    headerDropdownMenu: document.getElementById('headerDropdownMenu'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    resetBtn: document.getElementById('resetBtn'),
    printBtn: document.getElementById('printBtn'),

    // Tabs & Views
    yearTabsContainer: document.getElementById('yearTabs'),
    viewGridAllBtn: document.getElementById('viewGridAllBtn'),
    compareToggleBtn: document.getElementById('compareToggleBtn'),
    curriculumContainer: document.getElementById('curriculumContainer'),
    mainLayout: document.getElementById('mainLayout'),

    // Sidebar & Bank
    courseBankSidebar: document.getElementById('courseBankSidebar'),
    openAddCourseModalBtn: document.getElementById('openAddCourseModalBtn'),
    searchInput: document.getElementById('searchInput'),
    bankFilterGroup: document.getElementById('bankFilterGroup'),
    repoFilterToggleBtn: document.getElementById('repoFilterToggleBtn'),
    repoFilterMenu: document.getElementById('repoFilterMenu'),
    closeRepoFilterMenuBtn: document.getElementById('closeRepoFilterMenuBtn'),
    repoStatusFilterSelect: document.getElementById('repoStatusFilterSelect'),
    repoColorFilterSelect: document.getElementById('repoColorFilterSelect'),
    resetRepoFiltersBtn: document.getElementById('resetRepoFiltersBtn'),
    bankCardsContainer: document.getElementById('bankCardsContainer'),
    bankCountEl: document.getElementById('bankCount'),

    // Modals & Toasts
    editModal: document.getElementById('editModal'),
    toastContainer: document.getElementById('toastContainer')
  };
}

// Load State from LocalStorage or Defaults
function loadState() {
  const savedState = localStorage.getItem('curriculum_calc_state_v1');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      state.courses = parsed.courses || DEFAULT_COURSES;
      state.curriculum = parsed.curriculum || DEFAULT_CURRICULUM_PLAN;
      state.termStatuses = parsed.termStatuses || getDefaultTermStatuses();
      state.theme = parsed.theme || 'dark';
    } catch (e) {
      console.error('Error loading saved state:', e);
      loadDefaults();
    }
  } else {
    loadDefaults();
  }

  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();
}

function getDefaultTermStatuses() {
  const statuses = {};
  YEARS.forEach(y => {
    TERMS_PER_YEAR.forEach(t => {
      const id = `y${y}-t${t}`;
      if (id === 'y1-t1' || id === 'y1-t2') {
        statuses[id] = 'accomplished';
      } else if (id === 'y1-t3') {
        statuses[id] = 'current';
      } else {
        statuses[id] = 'upcoming';
      }
    });
  });
  return statuses;
}

function loadDefaults() {
  state.courses = JSON.parse(JSON.stringify(DEFAULT_COURSES));
  state.curriculum = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM_PLAN));
  state.termStatuses = getDefaultTermStatuses();
  saveState();
}

function saveState() {
  const payload = {
    courses: state.courses,
    curriculum: state.curriculum,
    termStatuses: state.termStatuses,
    theme: state.theme
  };
  localStorage.setItem('curriculum_calc_state_v1', JSON.stringify(payload));
}

// Bind Event Listeners
function bindEvents() {
  // Header Hamburger Dropdown Toggle
  if (dom.headerMenuToggleBtn && dom.headerDropdownMenu) {
    dom.headerMenuToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dom.headerDropdownMenu.classList.contains('hidden');
      if (isHidden) {
        dom.headerDropdownMenu.classList.remove('hidden');
        dom.headerMenuToggleBtn.classList.add('active');
      } else {
        dom.headerDropdownMenu.classList.add('hidden');
        dom.headerMenuToggleBtn.classList.remove('active');
      }
    });

    // Close header dropdown menu when clicking any item inside it
    dom.headerDropdownMenu.addEventListener('click', (e) => {
      if (e.target.closest('.menu-item-btn')) {
        dom.headerDropdownMenu.classList.add('hidden');
        dom.headerMenuToggleBtn.classList.remove('active');
      }
    });
  }

  // Theme Toggle
  dom.themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
    saveState();
  });

  // Reset to Defaults
  dom.resetBtn.addEventListener('click', () => {
    if (confirm('Reset curriculum to default Mapúa BS Computer Science template? All custom changes will be reset.')) {
      loadDefaults();
      render();
      showToast('Reset to default curriculum template');
    }
  });

  // Print View
  dom.printBtn.addEventListener('click', () => {
    window.print();
  });

  // Year Tabs Switcher
  dom.yearTabsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      const year = e.target.dataset.year;
      state.activeYear = parseInt(year, 10);
      updateTabsUI();
      renderCurriculumGrid();
    }
  });

  // Full Matrix View Toggle
  dom.viewGridAllBtn.addEventListener('click', () => {
    state.activeYear = 'all';
    updateTabsUI();
    renderCurriculumGrid();
  });

  // Compare School Curriculum Toggle
  if (dom.compareToggleBtn) {
    dom.compareToggleBtn.addEventListener('click', toggleCompareMode);
  }

  // Open Add Course Popup Modal
  dom.openAddCourseModalBtn.addEventListener('click', () => {
    openAddCourseModal();
  });

  // Search Filter in Sidebar
  dom.searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.toLowerCase().trim();
    renderBankCards();
  });

  // Repository Filter Tabs (Unassigned / Assigned / All)
  dom.bankFilterGroup.addEventListener('click', (e) => {
    if (e.target.classList.contains('bank-filter-btn')) {
      state.bankFilter = e.target.dataset.filter;
      updateBankFilterTabsUI();
      renderBankCards();
    }
  });

  // Toggle Extra Repository Filter Popover Menu
  dom.repoFilterToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = dom.repoFilterMenu.classList.contains('hidden');
    if (isHidden) {
      renderRepoColorSwatches();
      dom.repoFilterMenu.classList.remove('hidden');
      dom.repoFilterToggleBtn.classList.add('active');
    } else {
      dom.repoFilterMenu.classList.add('hidden');
      dom.repoFilterToggleBtn.classList.remove('active');
    }
  });

  dom.closeRepoFilterMenuBtn.addEventListener('click', () => {
    dom.repoFilterMenu.classList.add('hidden');
    dom.repoFilterToggleBtn.classList.remove('active');
  });

  // Filter Menu Select Changes
  dom.repoStatusFilterSelect.addEventListener('change', (e) => {
    state.statusFilter = e.target.value;
    updateRepoFilterIndicator();
    renderBankCards();
  });

  // Reset Repo Filters
  dom.resetRepoFiltersBtn.addEventListener('click', () => {
    state.statusFilter = 'all';
    state.colorFilter = 'all';
    dom.repoStatusFilterSelect.value = 'all';
    updateRepoFilterIndicator();
    renderRepoColorSwatches();
    renderBankCards();
  });

  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    if (dom.repoFilterMenu && !dom.repoFilterMenu.contains(e.target) && e.target !== dom.repoFilterToggleBtn) {
      dom.repoFilterMenu.classList.add('hidden');
      dom.repoFilterToggleBtn.classList.remove('active');
    }
    if (dom.headerDropdownMenu && !dom.headerDropdownMenu.contains(e.target) && e.target !== dom.headerMenuToggleBtn && !dom.headerMenuToggleBtn.contains(e.target)) {
      dom.headerDropdownMenu.classList.add('hidden');
      dom.headerMenuToggleBtn.classList.remove('active');
    }
  });

  // Sidebar Container Dropzone (Dropping a term row into sidebar removes it from the term)
  dom.bankCardsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    dom.bankCardsContainer.classList.add('drag-over-active');
  });
  dom.bankCardsContainer.addEventListener('dragleave', () => {
    dom.bankCardsContainer.classList.remove('drag-over-active');
  });
  dom.bankCardsContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    dom.bankCardsContainer.classList.remove('drag-over-active');
    const dragData = getDragData(e);
    if (dragData && dragData.fromTerm) {
      removeCourseFromTerm(dragData.fromTerm, dragData.courseId);
      showToast(`Removed course from term`);
    }
  });

  // Modal Overlay Close
  dom.editModal.addEventListener('click', (e) => {
    if (e.target === dom.editModal) closeEditModal();
  });
}

function updateThemeIcon() {
  if (state.theme === 'dark') {
    dom.themeToggleBtn.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
      <span>Light Mode</span>
    `;
  } else {
    dom.themeToggleBtn.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
      <span>Dark Mode</span>
    `;
  }
}

function renderColorPresets() {
  dom.colorPresetContainer.innerHTML = '';
  COLOR_PRESETS.forEach(color => {
    const dot = document.createElement('div');
    dot.className = `color-preset-dot ${color === selectedFormColor ? 'active' : ''}`;
    dot.style.backgroundColor = color;
    dot.addEventListener('click', () => {
      selectedFormColor = color;
      dom.customColorInput.value = color;
      updateColorPresetActiveUI();
    });
    dom.colorPresetContainer.appendChild(dot);
  });
}

function updateColorPresetActiveUI() {
  const dots = dom.colorPresetContainer.querySelectorAll('.color-preset-dot');
  dots.forEach(dot => {
    const bg = rgbToHex(dot.style.backgroundColor);
    if (bg.toLowerCase() === selectedFormColor.toLowerCase()) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function updateTabsUI() {
  const tabs = dom.yearTabsContainer.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    const y = tab.dataset.year;
    if (y === String(state.activeYear)) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  if (state.activeYear === 'all') {
    dom.viewGridAllBtn.classList.add('active');
  } else {
    dom.viewGridAllBtn.classList.remove('active');
  }

  if (dom.compareToggleBtn) {
    if (state.compareMode) {
      dom.compareToggleBtn.classList.add('active');
    } else {
      dom.compareToggleBtn.classList.remove('active');
    }
  }

  if (dom.compareBtn) {
    if (state.compareMode) {
      dom.compareBtn.classList.add('active');
    } else {
      dom.compareBtn.classList.remove('active');
    }
  }
}

function toggleCompareMode() {
  state.compareMode = !state.compareMode;
  if (state.compareMode) {
    if (dom.mainLayout) dom.mainLayout.classList.add('compare-mode-active');
    showToast('Entered School Curriculum Comparison Mode');
  } else {
    if (dom.mainLayout) dom.mainLayout.classList.remove('compare-mode-active');
    showToast('Exited Comparison Mode');
  }
  updateTabsUI();
  renderCurriculumGrid();
}

function updateBankFilterTabsUI() {
  if (!dom.bankFilterGroup) return;
  const btns = dom.bankFilterGroup.querySelectorAll('.bank-filter-btn');
  btns.forEach(btn => {
    if (btn.dataset.filter === state.bankFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Master Render Function
function render() {
  updateTabsUI();
  updateBankFilterTabsUI();
  renderCurriculumGrid();
  renderBankCards();
  renderHeaderStats();
}

// Calculate Prerequisite Conflicts
function checkPrerequisites() {
  // Build term order index: 'y1-t1': 1, 'y1-t2': 2 ... 'y4-t4': 16
  const termOrderMap = {};
  let orderIndex = 1;
  YEARS.forEach(y => {
    TERMS_PER_YEAR.forEach(t => {
      termOrderMap[`y${y}-t${t}`] = orderIndex++;
    });
  });

  // Map course code -> term index where it is scheduled
  const courseCodeTermMap = {};
  Object.keys(state.curriculum).forEach(termId => {
    const courseIds = state.curriculum[termId] || [];
    courseIds.forEach(cId => {
      const course = state.courses.find(c => c.id === cId);
      if (course) {
        courseCodeTermMap[course.code.toUpperCase()] = {
          termId,
          order: termOrderMap[termId]
        };
      }
    });
  });

  const conflicts = []; // [{ courseId, courseCode, termId, missingPrereqs: [] }]

  Object.keys(state.curriculum).forEach(termId => {
    const termOrder = termOrderMap[termId];
    const courseIds = state.curriculum[termId] || [];

    courseIds.forEach(cId => {
      const course = state.courses.find(c => c.id === cId);
      if (!course || !course.prerequisites || course.prerequisites === 'None') return;

      // Parse prerequisites string e.g. "CS101-1L, MATH101"
      const reqCodes = course.prerequisites.split(',').map(s => s.trim().toUpperCase());
      const invalidReqs = [];

      reqCodes.forEach(reqCode => {
        if (!reqCode || reqCode === 'NONE') return;
        const scheduled = courseCodeTermMap[reqCode];
        if (!scheduled) {
          // Prerequisite not scheduled in any term yet
          invalidReqs.push(`${reqCode} (Not scheduled)`);
        } else if (scheduled.order >= termOrder) {
          // Prerequisite scheduled in same term or later term!
          invalidReqs.push(`${reqCode} (Scheduled in ${formatTermName(scheduled.termId)})`);
        }
      });

      if (invalidReqs.length > 0) {
        conflicts.push({
          courseId: cId,
          courseCode: course.code,
          termId,
          invalidReqs
        });
      }
    });
  });

  return conflicts;
}

// Render Header Stats Bar
function renderHeaderStats() {
  let totalUnits = 0;
  let finishedUnits = 0;

  Object.keys(state.curriculum).forEach(termId => {
    const isAccomplished = (state.termStatuses[termId] || 'upcoming') === 'accomplished';
    const courseIds = state.curriculum[termId] || [];
    courseIds.forEach(cId => {
      const course = state.courses.find(c => c.id === cId);
      if (course) {
        totalUnits += course.units;
        if (isAccomplished) {
          finishedUnits += course.units;
        }
      }
    });
  });

  const unitsLeft = Math.max(0, totalUnits - finishedUnits);
  const conflicts = checkPrerequisites();

  dom.totalUnitsEl.textContent = totalUnits.toFixed(1);
  if (dom.finishedUnitsEl) dom.finishedUnitsEl.textContent = finishedUnits.toFixed(1);
  if (dom.unitsLeftEl) dom.unitsLeftEl.textContent = unitsLeft.toFixed(1);
  dom.prereqConflictsEl.textContent = conflicts.length;

  if (conflicts.length > 0) {
    dom.prereqConflictsEl.style.color = 'var(--accent-rose)';
  } else {
    dom.prereqConflictsEl.style.color = 'var(--accent-emerald)';
  }
}

// Render Main Curriculum Grid
function renderCurriculumGrid() {
  const container = dom.curriculumContainer;
  container.innerHTML = '';

  const conflicts = checkPrerequisites();

  if (state.compareMode) {
    // Render 2 Side-by-Side Comparison Layout with Term-by-Term Alignment
    const compareWrapper = document.createElement('div');
    compareWrapper.className = 'compare-grid-container';

    // Column Titles Header
    const headerRow = document.createElement('div');
    headerRow.className = 'compare-main-header';
    headerRow.innerHTML = `
      <div class="compare-column-title school-title">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
        </svg>
        School Curriculum <span class="compare-tag school-tag">Recommended</span>
      </div>
      <div class="compare-column-title user-title">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        My Organized Classes <span class="compare-tag user-tag">Your Plan</span>
      </div>
    `;
    compareWrapper.appendChild(headerRow);

    const schoolOptions = {
      isReadOnly: true,
      curriculumPlan: DEFAULT_CURRICULUM_PLAN,
      coursesList: DEFAULT_COURSES,
      columnType: 'school'
    };

    const userOptions = {
      isReadOnly: false,
      curriculumPlan: state.curriculum,
      coursesList: state.courses,
      columnType: 'user'
    };

    const yearsToRender = state.activeYear === 'all' ? YEARS : [state.activeYear];

    yearsToRender.forEach(y => {
      if (state.activeYear === 'all') {
        let schoolYearUnits = 0;
        let userYearUnits = 0;
        TERMS_PER_YEAR.forEach(t => {
          (DEFAULT_CURRICULUM_PLAN[`y${y}-t${t}`] || []).forEach(cId => {
            const c = DEFAULT_COURSES.find(item => item.id === cId);
            if (c) schoolYearUnits += c.units;
          });
          (state.curriculum[`y${y}-t${t}`] || []).forEach(cId => {
            const c = state.courses.find(item => item.id === cId);
            if (c) userYearUnits += c.units;
          });
        });

        const yearHeader = document.createElement('div');
        yearHeader.className = 'year-section-header compare-year-header';
        yearHeader.innerHTML = `
          <div class="year-section-title">YEAR ${y}</div>
          <div style="display:flex; gap:16px; align-items:center;">
            <div class="year-units-badge" style="font-size:0.75rem;">School: ${schoolYearUnits.toFixed(1)}u</div>
            <div class="year-units-badge" style="font-size:0.75rem;">My Plan: ${userYearUnits.toFixed(1)}u</div>
          </div>
        `;
        compareWrapper.appendChild(yearHeader);
      }

      // Render each term side-by-side in a paired row
      TERMS_PER_YEAR.forEach(t => {
        const termRow = document.createElement('div');
        termRow.className = 'compare-term-row';

        const schoolCard = renderTermCard(y, t, conflicts, schoolOptions);
        schoolCard.classList.add('school-column');

        const userCard = renderTermCard(y, t, conflicts, userOptions);
        userCard.classList.add('user-column');

        termRow.appendChild(schoolCard);
        termRow.appendChild(userCard);

        compareWrapper.appendChild(termRow);
      });
    });

    container.appendChild(compareWrapper);
    return;
  } else {
    // Normal Single View
    const userOptions = {
      isReadOnly: false,
      curriculumPlan: state.curriculum,
      coursesList: state.courses,
      columnType: 'user'
    };

    if (state.activeYear === 'all') {
      YEARS.forEach(y => {
        const yearSection = document.createElement('div');
        yearSection.className = 'year-section';
        let yearUnits = 0;
        TERMS_PER_YEAR.forEach(t => {
          const tId = `y${y}-t${t}`;
          (state.curriculum[tId] || []).forEach(cId => {
            const c = state.courses.find(item => item.id === cId);
            if (c) yearUnits += c.units;
          });
        });

        yearSection.innerHTML = `
          <div class="year-section-header">
            <div class="year-section-title">YEAR ${y}</div>
            <div class="year-units-badge">${yearUnits.toFixed(1)} Total Units</div>
          </div>
          <div class="terms-grid grid-all" id="year-grid-${y}"></div>
        `;
        container.appendChild(yearSection);

        const gridEl = yearSection.querySelector(`#year-grid-${y}`);
        TERMS_PER_YEAR.forEach(t => {
          const termCard = renderTermCard(y, t, conflicts, userOptions);
          gridEl.appendChild(termCard);
        });
      });
    } else {
      const yearGrid = document.createElement('div');
      yearGrid.className = 'terms-grid grid-4';

      TERMS_PER_YEAR.forEach(t => {
        const termCard = renderTermCard(state.activeYear, t, conflicts, userOptions);
        yearGrid.appendChild(termCard);
      });

      container.appendChild(yearGrid);
    }
  }
}

// Render Individual Term Table Card (5 Columns: Color, Code, Name, Units, Pre-reqs + Action)
function renderTermCard(year, term, conflicts, options) {
  options = options || {
    isReadOnly: false,
    curriculumPlan: state.curriculum,
    coursesList: state.courses,
    columnType: 'user'
  };

  const isReadOnly = !!options.isReadOnly;
  const curriculumPlan = options.curriculumPlan || state.curriculum;
  const coursesList = options.coursesList || state.courses;
  const termId = `y${year}-t${term}`;
  const courseIds = curriculumPlan[termId] || [];
  const currentStatus = state.termStatuses[termId] || 'upcoming';

  let statusLabel = 'Upcoming';
  if (currentStatus === 'accomplished') {
    statusLabel = '✓ Accomplished';
  } else if (currentStatus === 'current') {
    statusLabel = 'Current';
  }

  // Sum units for this term
  let termUnits = 0;
  courseIds.forEach(cId => {
    const course = coursesList.find(c => c.id === cId);
    if (course) termUnits += course.units;
  });

  const card = document.createElement('div');
  card.className = `term-card ${isReadOnly ? 'read-only-card' : ''}`;
  card.dataset.termId = termId;

  card.innerHTML = `
    <div class="term-header">
      <div class="term-title">
        <span>Term ${term}</span>
        ${isReadOnly
      ? `<span class="read-only-badge">School Recommended</span>`
      : `<span class="term-status-badge ${currentStatus}" data-term-id="${termId}" title="Click to toggle term status">${statusLabel}</span>`}
      </div>
      <div class="term-units-summary">${termUnits.toFixed(1)} Units</div>
    </div>
    <div class="table-wrapper">
      <table class="curriculum-table">
        <thead>
          <tr>
            <th class="col-color" title="Color Code">Clr</th>
            <th class="col-code">Course Code</th>
            <th class="col-name">Course Name</th>
            <th class="col-units">Units</th>
            <th class="col-prereqs">Pre-req</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody class="term-table-body" data-term-id="${termId}">
        </tbody>
      </table>
    </div>
  `;

  if (!isReadOnly) {
    const statusBadge = card.querySelector('.term-status-badge');
    if (statusBadge) {
      statusBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextStatusMap = {
          'accomplished': 'current',
          'current': 'upcoming',
          'upcoming': 'accomplished'
        };
        const nextStatus = nextStatusMap[state.termStatuses[termId] || 'upcoming'];
        state.termStatuses[termId] = nextStatus;
        saveState();
        render();
        showToast(`${formatTermName(termId)} marked as ${nextStatus.toUpperCase()}`);
      });
    }
  }

  const tbody = card.querySelector('.term-table-body');

  if (courseIds.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-term-msg">
          ${isReadOnly ? 'No courses recommended in default curriculum' : 'Drag courses here from the repository'}
        </td>
      </tr>
    `;
  } else {
    courseIds.forEach((cId, index) => {
      const course = coursesList.find(c => c.id === cId) || state.courses.find(c => c.id === cId);
      if (!course) return;

      const hasConflict = !isReadOnly && conflicts.some(cf => cf.courseId === cId && cf.termId === termId);
      const conflictDetail = !isReadOnly && conflicts.find(cf => cf.courseId === cId && cf.termId === termId);

      // User term status for school curriculum row indication (accomplished = grey text, current = highlighted row)
      let statusRowClass = '';
      const userTermId = Object.keys(state.curriculum).find(t => (state.curriculum[t] || []).includes(cId));
      if (options.columnType === 'school' && userTermId) {
        const userStatus = state.termStatuses[userTermId] || 'upcoming';
        if (userStatus === 'accomplished') {
          statusRowClass = 'course-row-accomplished';
        } else if (userStatus === 'current') {
          statusRowClass = 'course-row-current';
        }
      }

      // Diff comparison badge logic when in compare mode
      let diffBadgeHTML = '';
      if (state.compareMode) {
        if (options.columnType === 'school') {
          if (userTermId === termId) {
            diffBadgeHTML = `<span class="diff-badge matched" title="Matches your scheduled term">✓ Matched</span>`;
          } else if (userTermId) {
            diffBadgeHTML = `<span class="diff-badge shifted" title="Scheduled in your ${formatShortTermName(userTermId)}">Moved (${formatShortTermName(userTermId)})</span>`;
          } else {
            diffBadgeHTML = `<span class="diff-badge extra" title="Not currently scheduled in your plan">Unscheduled</span>`;
          }
        } else if (options.columnType === 'user') {
          // Check where course is in school curriculum
          const schoolTermId = Object.keys(DEFAULT_CURRICULUM_PLAN).find(t => (DEFAULT_CURRICULUM_PLAN[t] || []).includes(cId));
          if (schoolTermId === termId) {
            diffBadgeHTML = `<span class="diff-badge matched" title="Matches recommended school term">✓ Matched</span>`;
          } else if (schoolTermId) {
            diffBadgeHTML = `<span class="diff-badge shifted" title="School recommends in ${formatShortTermName(schoolTermId)}">Shifted (${formatShortTermName(schoolTermId)})</span>`;
          } else {
            diffBadgeHTML = `<span class="diff-badge extra" title="Custom course added to your plan">Custom</span>`;
          }
        }
      }

      const tr = document.createElement('tr');
      tr.className = `course-row ${hasConflict ? 'prereq-warning-row' : ''} ${statusRowClass}`;
      if (!isReadOnly) {
        tr.draggable = true;
        tr.dataset.type = 'term-row';
        tr.dataset.courseId = course.id;
        tr.dataset.fromTerm = termId;
        tr.dataset.rowIndex = index;
      }

      tr.innerHTML = `
        <td class="col-color">
          <div class="color-swatch-wrapper">
            <button class="color-swatch-btn" style="background-color: ${course.color};"></button>
            ${!isReadOnly ? `<input type="color" class="native-color-picker" value="${course.color}" data-course-id="${course.id}">` : ''}
          </div>
        </td>
        <td class="col-code">
          <span class="code-badge">${escapeHTML(course.code)}</span>
        </td>
        <td class="col-name">
          <span class="course-name-text" title="${escapeHTML(course.name)}">${escapeHTML(course.name)}</span>
          ${diffBadgeHTML ? `<div class="course-diff-wrapper">${diffBadgeHTML}</div>` : ''}
        </td>
        <td class="col-units">
          ${course.units.toFixed(1)}
        </td>
        <td class="col-prereqs">
          ${hasConflict
          ? `<span class="prereq-badge-warning" title="${escapeHTML(conflictDetail.invalidReqs.join('; '))}">⚠️ Prereq Issue</span>`
          : formatPrereqPills(course.prerequisites)}
        </td>
        <td class="col-actions">
          ${isReadOnly ? '<span style="font-size:0.7rem; color:var(--text-muted);">Read Only</span>' : `
          <button class="action-btn-sm edit-term-course-btn" title="Edit course details" data-course-id="${course.id}">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="action-btn-sm remove-course-btn" title="Remove from term" data-course-id="${course.id}" data-term-id="${termId}">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          `}
        </td>
      `;

      if (!isReadOnly) {
        // Color picker input change event
        const colorPicker = tr.querySelector('.native-color-picker');
        if (colorPicker) {
          colorPicker.addEventListener('input', (e) => {
            updateCourseColor(course.id, e.target.value);
          });
        }

        // Edit course details button
        const editTermBtn = tr.querySelector('.edit-term-course-btn');
        if (editTermBtn) {
          editTermBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(course);
          });
        }

        // Remove course from term button
        const removeBtn = tr.querySelector('.remove-course-btn');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeCourseFromTerm(termId, course.id);
          });
        }

        // Drag event handlers on row for intra-term reordering & row placement
        tr.addEventListener('dragstart', (e) => handleDragStart(e, {
          type: 'term-row',
          courseId: course.id,
          fromTerm: termId
        }));

        tr.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = tr.getBoundingClientRect();
          const isUpperHalf = e.clientY < (rect.top + rect.height / 2);

          tr.classList.remove('drag-over-top', 'drag-over-bottom');
          if (isUpperHalf) {
            tr.classList.add('drag-over-top');
          } else {
            tr.classList.add('drag-over-bottom');
          }
        });

        tr.addEventListener('dragleave', () => {
          tr.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        tr.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          tr.classList.remove('drag-over-top', 'drag-over-bottom');
          card.classList.remove('drag-over-active');

          const data = getDragData(e);
          if (!data) return;

          const rect = tr.getBoundingClientRect();
          const isUpperHalf = e.clientY < (rect.top + rect.height / 2);

          const termList = state.curriculum[termId] || [];
          let targetIdx = termList.indexOf(course.id);
          if (!isUpperHalf) {
            targetIdx += 1;
          }

          moveCourseToPosition(data.fromTerm, data.courseId, termId, targetIdx);
          draggedData = null;
        });

        tr.addEventListener('dragend', handleDragEnd);
      } else if (options.columnType === 'school') {
        tr.title = `Click to locate ${course.code} in your organized classes`;
        tr.addEventListener('click', () => {
          locateCourseInUserPlan(course.id);
        });
      }

      tbody.appendChild(tr);
    });
  }

  if (!isReadOnly) {
    // Set term card as dropzone
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-over-active');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over-active');
    });
    card.addEventListener('drop', (e) => handleDropOnTerm(e, termId));
  }

  return card;
}

// Helper to get Set of all course IDs assigned to any term
function getAssignedCourseIds() {
  const assigned = new Set();
  Object.values(state.curriculum).forEach(courseList => {
    (courseList || []).forEach(cId => assigned.add(cId));
  });
  return assigned;
}

function renderRepoColorSwatches() {
  const container = document.getElementById('repoColorSwatches');
  if (!container) return;
  container.innerHTML = '';

  const usedColors = new Set();
  state.courses.forEach(c => {
    if (c.color) usedColors.add(c.color.toLowerCase());
  });

  // "All" Box
  const allBox = document.createElement('div');
  allBox.className = `repo-color-box repo-color-box-all ${state.colorFilter === 'all' ? 'active' : ''}`;
  allBox.textContent = 'All';
  allBox.title = 'Show all colors';
  allBox.addEventListener('click', () => {
    state.colorFilter = 'all';
    updateRepoFilterIndicator();
    renderRepoColorSwatches();
    renderBankCards();
  });
  container.appendChild(allBox);

  // Swatch for each used color
  usedColors.forEach(hex => {
    const box = document.createElement('div');
    const isActive = state.colorFilter.toLowerCase() === hex.toLowerCase();
    box.className = `repo-color-box ${isActive ? 'active' : ''}`;
    box.style.backgroundColor = hex;
    box.title = `Filter by color ${hex}`;
    box.addEventListener('click', () => {
      state.colorFilter = hex;
      updateRepoFilterIndicator();
      renderRepoColorSwatches();
      renderBankCards();
    });
    container.appendChild(box);
  });
}

function updateRepoFilterIndicator() {
  const hasActiveFilter = state.statusFilter !== 'all' || state.colorFilter !== 'all';
  if (hasActiveFilter) {
    dom.repoFilterToggleBtn.classList.add('active');
  } else if (dom.repoFilterMenu.classList.contains('hidden')) {
    dom.repoFilterToggleBtn.classList.remove('active');
  }
}

// Helper to jump to and highlight an assigned course in the term table
function jumpToAssignedCourse(courseId, termId) {
  const match = termId.match(/y(\d+)-t(\d+)/);
  if (match) {
    const yearNum = parseInt(match[1], 10);
    if (state.activeYear !== 'all' && state.activeYear !== yearNum) {
      state.activeYear = yearNum;
      updateTabsUI();
      renderCurriculumGrid();
    }
  }

  setTimeout(() => {
    const rowEl = document.querySelector(`.user-column tr.course-row[data-course-id="${courseId}"]`) ||
      document.querySelector(`tr.course-row[data-course-id="${courseId}"]`);
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      rowEl.classList.remove('flash-highlight');
      void rowEl.offsetWidth; // trigger reflow
      rowEl.classList.add('flash-highlight');
      setTimeout(() => {
        rowEl.classList.remove('flash-highlight');
      }, 2300);
    }
  }, 60);
}

function locateCourseInUserPlan(courseId) {
  const course = state.courses.find(c => c.id === courseId) || (typeof DEFAULT_COURSES !== 'undefined' ? DEFAULT_COURSES.find(c => c.id === courseId) : null);
  const userTermId = Object.keys(state.curriculum).find(t => (state.curriculum[t] || []).includes(courseId));

  if (userTermId) {
    jumpToAssignedCourse(courseId, userTermId);
    showToast(`Located ${course ? course.code : 'course'} in ${formatTermName(userTermId)}`);
  } else {
    showToast(`${course ? course.code : 'Course'} is unassigned in your plan`);
  }
}

// Render Sidebar Course Repository Cards (Filterable by Unassigned, Assigned, All + Color & Status)
function renderBankCards() {
  const container = dom.bankCardsContainer;
  container.innerHTML = '';

  // Map courseId -> termId for all assigned courses
  const assignedMap = new Map();
  Object.entries(state.curriculum).forEach(([tId, list]) => {
    (list || []).forEach(cId => assignedMap.set(cId, tId));
  });

  let filteredCourses = state.courses;

  // 1. Repository Nav Tab Filter
  if (state.bankFilter === 'unassigned') {
    filteredCourses = filteredCourses.filter(c => !assignedMap.has(c.id));
  } else if (state.bankFilter === 'assigned') {
    filteredCourses = filteredCourses.filter(c => assignedMap.has(c.id));
  }

  // 2. Status Filter (Finished / Accomplished vs Unfinished / Upcoming)
  if (state.statusFilter === 'finished') {
    filteredCourses = filteredCourses.filter(c => {
      const tId = assignedMap.get(c.id);
      return tId && state.termStatuses[tId] === 'accomplished';
    });
  } else if (state.statusFilter === 'unfinished') {
    filteredCourses = filteredCourses.filter(c => {
      const tId = assignedMap.get(c.id);
      return !tId || state.termStatuses[tId] !== 'accomplished';
    });
  }

  // 3. Color Filter
  if (state.colorFilter && state.colorFilter !== 'all') {
    const targetColor = state.colorFilter.toLowerCase();
    filteredCourses = filteredCourses.filter(c => (c.color || '').toLowerCase() === targetColor);
  }

  // 4. Search Filter
  if (state.searchTerm) {
    filteredCourses = filteredCourses.filter(c =>
      c.code.toLowerCase().includes(state.searchTerm) ||
      c.name.toLowerCase().includes(state.searchTerm) ||
      c.prerequisites.toLowerCase().includes(state.searchTerm)
    );
  }

  dom.bankCountEl.textContent = filteredCourses.length;

  if (filteredCourses.length === 0) {
    let msg = 'No courses found.';
    if (state.bankFilter === 'unassigned') msg = 'All courses are assigned to term tables!';
    if (state.bankFilter === 'assigned') msg = 'No courses assigned to terms yet.';
    if (state.searchTerm) msg = 'No courses match search filter.';
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 24px; font-style: italic;">
        ${msg}
      </div>
    `;
    return;
  }

  filteredCourses.forEach(course => {
    const isExpanded = state.expandedCards.has(course.id);
    const assignedTermId = assignedMap.get(course.id);
    const isAssigned = !!assignedTermId;

    const card = document.createElement('div');
    card.className = `course-card ${isAssigned ? 'assigned-card' : ''}`;
    card.draggable = !isAssigned; // Only unassigned courses are draggable into terms
    card.dataset.type = 'bank-card';
    card.dataset.courseId = course.id;

    card.innerHTML = `
      <div class="card-summary">
        <div class="card-left">
          <div class="card-color-indicator" style="background-color: ${course.color};"></div>
          <div class="card-code">${escapeHTML(course.code)}</div>
        </div>
        <div class="card-right">
          ${isAssigned ? `<span class="assigned-term-tag" title="Click to view course in table">${formatShortTermName(assignedTermId)}</span>` : `<span class="card-units-badge">${course.units}u</span>`}
          <button class="card-expand-btn" data-course-id="${course.id}">
            ${isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      <div class="card-details ${isExpanded ? '' : 'hidden'}">
        <div class="card-name-title">${escapeHTML(course.name)}</div>
        <div class="card-meta-item"><strong>Pre-reqs:</strong> ${escapeHTML(course.prerequisites)}</div>
        <div class="card-actions">
          <button class="btn btn-secondary edit-course-btn" style="padding: 3px 8px; font-size: 0.75rem;" data-course-id="${course.id}">Edit</button>
          <button class="btn btn-secondary delete-course-btn" style="padding: 3px 8px; font-size: 0.75rem; color: var(--accent-rose);" data-course-id="${course.id}">Delete</button>
        </div>
      </div>
    `;

    if (isAssigned) {
      card.style.cursor = 'pointer';
      card.title = 'Click to jump & highlight in term table';
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('card-expand-btn') ||
          e.target.classList.contains('edit-course-btn') ||
          e.target.classList.contains('delete-course-btn')) {
          return;
        }
        jumpToAssignedCourse(course.id, assignedTermId);
      });
    } else {
      // Drag start/end handlers for unassigned sidebar card
      card.addEventListener('dragstart', (e) => handleDragStart(e, {
        type: 'bank-card',
        courseId: course.id
      }));
      card.addEventListener('dragend', handleDragEnd);
    }

    // Expand/Collapse toggle
    const expandBtn = card.querySelector('.card-expand-btn');
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.expandedCards.has(course.id)) {
        state.expandedCards.delete(course.id);
      } else {
        state.expandedCards.add(course.id);
      }
      renderBankCards();
    });

    // Edit button
    const editBtn = card.querySelector('.edit-course-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(course);
      });
    }

    // Delete button
    const deleteBtn = card.querySelector('.delete-course-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCourseFromRepository(course.id);
      });
    }

    container.appendChild(card);
  });
}

// Drag & Drop Handlers
let draggedData = null;

function handleDragStart(e, data) {
  draggedData = data;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', JSON.stringify(data));
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.term-card, .bank-cards-container').forEach(el => {
    el.classList.remove('drag-over-active');
  });
  document.querySelectorAll('.course-row').forEach(el => {
    el.classList.remove('drag-over-top', 'drag-over-bottom');
  });
}

function getDragData(e) {
  if (draggedData) return draggedData;
  try {
    return JSON.parse(e.dataTransfer.getData('text/plain'));
  } catch (err) {
    return null;
  }
}

function handleDropOnTerm(e, targetTermId) {
  e.preventDefault();
  const data = getDragData(e);
  if (!data) return;

  const { type, courseId } = data;
  addCourseToTerm(targetTermId, courseId);
  draggedData = null;
}

// Course State Mutation Methods
function moveCourseToPosition(fromTerm, courseId, targetTermId, insertIndex) {
  if (!state.curriculum[targetTermId]) {
    state.curriculum[targetTermId] = [];
  }

  const list = state.curriculum[targetTermId];
  const oldIdx = list.indexOf(courseId);

  if (oldIdx !== -1) {
    // Re-ordering inside the SAME term table
    list.splice(oldIdx, 1);
    let adjustedIdx = insertIndex;
    if (oldIdx < insertIndex) {
      adjustedIdx -= 1;
    }
    adjustedIdx = Math.max(0, Math.min(adjustedIdx, list.length));
    list.splice(adjustedIdx, 0, courseId);
  } else {
    // Moving from another term or bank into a specific row position in targetTermId
    Object.keys(state.curriculum).forEach(tId => {
      if (state.curriculum[tId]) {
        state.curriculum[tId] = state.curriculum[tId].filter(id => id !== courseId);
      }
    });
    const clampedIdx = Math.max(0, Math.min(insertIndex, state.curriculum[targetTermId].length));
    state.curriculum[targetTermId].splice(clampedIdx, 0, courseId);
  }

  saveState();
  render();
}

function addCourseToTerm(termId, courseId) {
  // First, remove courseId from ANY existing term table (enforcing strict uniqueness)
  Object.keys(state.curriculum).forEach(tId => {
    if (state.curriculum[tId]) {
      state.curriculum[tId] = state.curriculum[tId].filter(id => id !== courseId);
    }
  });

  if (!state.curriculum[termId]) {
    state.curriculum[termId] = [];
  }

  state.curriculum[termId].push(courseId);
  saveState();
  render();
}

function removeCourseFromTerm(termId, courseId, doRender = true) {
  if (state.curriculum[termId]) {
    state.curriculum[termId] = state.curriculum[termId].filter(id => id !== courseId);
    saveState();
    if (doRender) render();
  }
}

function updateCourseColor(courseId, newColor) {
  const course = state.courses.find(c => c.id === courseId);
  if (course) {
    course.color = newColor;
    saveState();
    render();
  }
}

function deleteCourseFromRepository(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;
  if (confirm(`Delete course ${course.code} from repository and all term schedules?`)) {
    // Remove from repository
    state.courses = state.courses.filter(c => c.id !== courseId);
    // Remove from all terms
    Object.keys(state.curriculum).forEach(tId => {
      state.curriculum[tId] = state.curriculum[tId].filter(id => id !== courseId);
    });
    saveState();
    render();
    showToast(`Deleted course ${course.code}`);
  }
}

// Helper for Modal Color Picker (Used Colors + Custom Color Wheel)
function setupModalColorPicker(initialColor) {
  let selectedColor = initialColor || COLOR_PRESETS[0];
  const container = document.getElementById('modalUsedSwatches');
  const wheelInput = document.getElementById('modalColorWheelInput');

  // Gather unique colors currently used in state.courses + default presets
  const availableColors = new Set(COLOR_PRESETS);
  state.courses.forEach(c => { if (c.color) availableColors.add(c.color); });

  function renderDots() {
    if (!container) return;
    container.innerHTML = '';
    availableColors.forEach(hex => {
      const dot = document.createElement('div');
      const isActive = hex.toLowerCase() === selectedColor.toLowerCase();
      dot.className = `modal-color-dot ${isActive ? 'active' : ''}`;
      dot.style.backgroundColor = hex;
      dot.title = `Use color ${hex}`;
      dot.addEventListener('click', () => {
        selectedColor = hex;
        if (wheelInput) wheelInput.value = hex;
        renderDots();
      });
      container.appendChild(dot);
    });
  }

  if (wheelInput) {
    wheelInput.value = selectedColor;
    wheelInput.addEventListener('input', (e) => {
      selectedColor = e.target.value;
      renderDots();
    });
  }

  renderDots();
  return () => selectedColor;
}

// Helper for Modal Prerequisite Multi-Select Dropdown
function setupModalPrereqPicker(excludeCourseId, initialPrereqsStr) {
  const selectedContainer = document.getElementById('prereqSelectedTags');
  const selectDropdown = document.getElementById('prereqSelectDropdown');

  let selectedCodes = [];
  if (initialPrereqsStr && initialPrereqsStr !== 'None') {
    selectedCodes = initialPrereqsStr.split(',').map(s => s.trim()).filter(Boolean);
  }

  function renderUI() {
    if (selectedContainer) {
      selectedContainer.innerHTML = '';
      if (selectedCodes.length === 0) {
        selectedContainer.innerHTML = '<span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No prerequisites selected</span>';
      } else {
        selectedCodes.forEach((code, idx) => {
          const tag = document.createElement('span');
          tag.className = 'prereq-tag-removable';
          tag.innerHTML = `
            <span>${escapeHTML(code)}</span>
            <button type="button" class="prereq-tag-remove-btn" title="Remove">&times;</button>
          `;
          tag.querySelector('.prereq-tag-remove-btn').addEventListener('click', () => {
            selectedCodes.splice(idx, 1);
            renderUI();
          });
          selectedContainer.appendChild(tag);
        });
      }
    }

    if (selectDropdown) {
      selectDropdown.innerHTML = '<option value="">+ Select Prerequisite Course...</option>';
      state.courses
        .filter(c => c.id !== excludeCourseId && !selectedCodes.includes(c.code))
        .sort((a, b) => a.code.localeCompare(b.code))
        .forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.code;
          opt.textContent = `${c.code} - ${c.name}`;
          selectDropdown.appendChild(opt);
        });
    }
  }

  if (selectDropdown) {
    selectDropdown.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val && !selectedCodes.includes(val)) {
        selectedCodes.push(val);
        renderUI();
      }
    });
  }

  renderUI();
  return () => selectedCodes.length > 0 ? selectedCodes.join(', ') : 'None';
}

// Edit Course Modal Logic
function openEditModal(course) {
  dom.editModal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">Edit Course: ${escapeHTML(course.code)}</div>
        <button class="close-modal-btn" id="modalCloseBtn">&times;</button>
      </div>
      <form id="modalEditForm" style="display: flex; flex-direction: column; gap: 12px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Course Code</label>
            <input type="text" id="editCode" class="form-input" value="${escapeHTML(course.code)}" required>
          </div>
          <div class="form-group" style="flex: 0.6;">
            <label class="form-label">Credit Units</label>
            <input type="number" id="editUnits" class="form-input" step="0.5" value="${course.units}" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Course Name</label>
          <input type="text" id="editName" class="form-input" value="${escapeHTML(course.name)}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Pre-requisite Courses</label>
          <div class="prereq-select-wrapper">
            <div class="prereq-selected-tags" id="prereqSelectedTags"></div>
            <select id="prereqSelectDropdown" class="form-input" style="margin-top: 4px;"></select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Course Color Tag</label>
          <div class="color-picker-selection-row">
            <div class="modal-used-swatches" id="modalUsedSwatches"></div>
            <div class="color-wheel-input-wrapper" title="Choose custom color from color wheel">
              <input type="color" id="modalColorWheelInput" class="color-wheel-input" value="${course.color}">
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">Color Wheel</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
          <button type="button" class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  dom.editModal.classList.add('active');

  const getSelectedColor = setupModalColorPicker(course.color);
  const getSelectedPrereqs = setupModalPrereqPicker(course.id, course.prerequisites);

  document.getElementById('modalCloseBtn').addEventListener('click', closeEditModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeEditModal);

  document.getElementById('modalEditForm').addEventListener('submit', (e) => {
    e.preventDefault();
    course.code = document.getElementById('editCode').value.trim().toUpperCase();
    course.name = document.getElementById('editName').value.trim();
    course.units = parseFloat(document.getElementById('editUnits').value) || 3.0;
    course.color = getSelectedColor();
    course.prerequisites = getSelectedPrereqs();

    saveState();
    closeEditModal();
    render();
    showToast(`Updated course ${course.code}`);
  });
}

function closeEditModal() {
  dom.editModal.classList.remove('active');
}

// Add New Course Modal (Triggered by + bubble button beside search bar)
function openAddCourseModal() {
  const defaultColor = COLOR_PRESETS[0];

  dom.editModal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">Create New Course</div>
        <button class="close-modal-btn" id="modalCloseBtn">&times;</button>
      </div>
      <form id="modalAddForm" style="display: flex; flex-direction: column; gap: 12px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Course Code</label>
            <input type="text" id="addCode" class="form-input" placeholder="e.g. MATH174-1L" required>
          </div>
          <div class="form-group" style="flex: 0.6;">
            <label class="form-label">Credit Units</label>
            <input type="number" id="addUnits" class="form-input" step="0.5" value="3.0" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Course Name</label>
          <input type="text" id="addName" class="form-input" placeholder="e.g. College Algebra" required>
        </div>

        <div class="form-group">
          <label class="form-label">Pre-req Courses</label>
          <div class="prereq-select-wrapper">
            <div class="prereq-selected-tags" id="prereqSelectedTags"></div>
            <select id="prereqSelectDropdown" class="form-input" style="margin-top: 4px;"></select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Course Color Tag</label>
          <div class="color-picker-selection-row">
            <div class="modal-used-swatches" id="modalUsedSwatches"></div>
            <div class="color-wheel-input-wrapper" title="Choose custom color from color wheel">
              <input type="color" id="modalColorWheelInput" class="color-wheel-input" value="${defaultColor}">
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">Color Wheel</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
          <button type="button" class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Course</button>
        </div>
      </form>
    </div>
  `;

  dom.editModal.classList.add('active');

  const getSelectedColor = setupModalColorPicker(defaultColor);
  const getSelectedPrereqs = setupModalPrereqPicker(null, '');

  document.getElementById('modalCloseBtn').addEventListener('click', closeEditModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeEditModal);

  document.getElementById('modalAddForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('addCode').value.trim().toUpperCase();
    const name = document.getElementById('addName').value.trim();
    const units = parseFloat(document.getElementById('addUnits').value) || 3.0;

    const newCourse = {
      id: 'course-' + Date.now(),
      code,
      name,
      units,
      prerequisites: getSelectedPrereqs(),
      color: getSelectedColor()
    };

    state.courses.unshift(newCourse);
    saveState();
    closeEditModal();
    render();
    showToast(`Created course ${code} in repository`);
  });
}

// Utility Helper Functions
function formatTermName(termId) {
  const match = termId.match(/y(\d+)-t(\d+)/i);
  if (match) {
    return `Term ${match[2]}`;
  }
  return termId;
}

function formatShortTermName(termId) {
  if (!termId) return '';
  const match = termId.match(/y(\d+)-t(\d+)/i);
  if (match) {
    return `Y${match[1]}T${match[2]}`;
  }
  return termId;
}

function formatPrereqPills(prereqStr) {
  if (!prereqStr || prereqStr === 'None' || prereqStr.trim() === '') {
    return '';
  }
  return prereqStr.split(',').map(s => `<span class="prereq-tag">${escapeHTML(s.trim())}</span>`).join('');
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function rgbToHex(rgb) {
  if (!rgb || rgb.startsWith('#')) return rgb || '#4F46E5';
  const rgbValues = rgb.match(/\d+/g);
  if (!rgbValues || rgbValues.length < 3) return '#4F46E5';
  return "#" + ((1 << 24) + (parseInt(rgbValues[0]) << 16) + (parseInt(rgbValues[1]) << 8) + parseInt(rgbValues[2])).toString(16).slice(1);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    <span>${escapeHTML(message)}</span>
  `;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
