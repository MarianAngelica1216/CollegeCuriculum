/**
 * Pre-populated curriculum: Mapúa BS Computer Science (2025)
 * 4 Years x 4 Terms (Quarter System)
 */

const DEFAULT_COURSES = [
  // --- YEAR 1, TERM 1 ---
  { id: "course-css100", code: "CSS100", name: "Introduction to Computer Science", units: 3.0, prerequisites: "None", color: "#489fb5" },
  { id: "course-css121p", code: "CSS121P", name: "Computer Programming 1", units: 3.0, prerequisites: "None", color: "#489fb5" },
  { id: "course-fw01-2", code: "FW01-2", name: "Physical Activities Toward Health and Fitness 1", units: 2.0, prerequisites: "None", color: "#5f7174" },
  { id: "course-ged101", code: "GED101", name: "Understanding the Self", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-ged103", code: "GED103", name: "Readings in Philippine History", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-math165", code: "MATH165", name: "College Algebra with Analytic Geometry", units: 3.0, prerequisites: "None", color: "#b56576" },
  { id: "course-nstp001", code: "NSTP001", name: "National Service Training Program General Module", units: 2.0, prerequisites: "None", color: "#5f7174" },

  // --- YEAR 1, TERM 2 ---
  { id: "course-css122p", code: "CSS122P", name: "Computer Programming 2", units: 3.0, prerequisites: "CSS121P", color: "#489fb5" },
  { id: "course-cwt5001", code: "CWT5001", name: "Civic Welfare Training Service 1", units: 2.0, prerequisites: "NSTP001", color: "#5f7174" },
  { id: "course-fw02-2", code: "FW02-2", name: "Physical Activities Toward Health and Fitness 2", units: 2.0, prerequisites: "FW01-2", color: "#5f7174" },
  { id: "course-ged104", code: "GED104", name: "Science, Technology and Society", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-ged105", code: "GED105", name: "The Contemporary World", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-its110p", code: "ITS110P", name: "Computer Hardware Fundamentals", units: 3.0, prerequisites: "None", color: "#2a9d8f" },
  { id: "course-its121-1l", code: "ITS121-1L", name: "Web Systems and Technologies 1 Laboratory", units: 1.0, prerequisites: "CSS121P", color: "#2a9d8f" },
  { id: "course-math170", code: "MATH170", name: "Linear Algebra with Computer Applications", units: 3.0, prerequisites: "MATH165", color: "#b56576" },

  // --- YEAR 1, TERM 3 ---
  { id: "course-css130-1", code: "CSS130-1", name: "Data Structures and Algorithms 1", units: 3.0, prerequisites: "CSS121P", color: "#489fb5" },
  { id: "course-cwt5002", code: "CWT5002", name: "Civic Welfare Training Service 2", units: 2.0, prerequisites: "CWT5001", color: "#5f7174" },
  { id: "course-fw03-2", code: "FW03-2", name: "Physical Activities Toward Health and Fitness 3", units: 2.0, prerequisites: "FW02-2", color: "#5f7174" },
  { id: "course-ged106", code: "GED106", name: "Purposive Communication", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-ged107", code: "GED107", name: "Ethics", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-its131p", code: "ITS131P", name: "Information Management", units: 3.0, prerequisites: "CSS122P", color: "#2a9d8f" },
  { id: "course-its161-1l", code: "ITS161-1L", name: "Data Communication and Networking Fundamentals", units: 2.0, prerequisites: "CSS121P", color: "#2a9d8f" },
  { id: "course-math174", code: "MATH174", name: "Differential and Integral Calculus", units: 3.0, prerequisites: "MATH165", color: "#b56576" },

  // --- YEAR 2, TERM 1 ---
  { id: "course-css123p", code: "CSS123P", name: "Computer Programming 3", units: 3.0, prerequisites: "ITS131P", color: "#489fb5" },
  { id: "course-dss110", code: "DSS110", name: "Introduction to Data Science", units: 3.0, prerequisites: "ITS131P", color: "#489fb5" },
  { id: "course-fw04-2", code: "FW04-2", name: "Physical Activities Toward Health and Fitness 4", units: 2.0, prerequisites: "FW03-2", color: "#5f7174" },
  { id: "course-its112p", code: "ITS112P", name: "Computer Architecture and Organization", units: 3.0, prerequisites: "ITS110P", color: "#2a9d8f" },
  { id: "course-its162-1l", code: "ITS162-1L", name: "Data Communication and Networking Essentials", units: 2.0, prerequisites: "ITS161-1L", color: "#2a9d8f" },
  { id: "course-math175", code: "MATH175", name: "Integral Calculus with Differential Equation", units: 3.0, prerequisites: "MATH174", color: "#b56576" },

  // --- YEAR 2, TERM 2 ---
  { id: "course-css131-1", code: "CSS131-1", name: "Discrete Mathematics 1", units: 3.0, prerequisites: "CSS130-1", color: "#489fb5" },
  { id: "course-css151p", code: "CSS151P", name: "Software Engineering 1", units: 3.0, prerequisites: "CSS123P", color: "#489fb5" },
  { id: "course-its163-1l", code: "ITS163-1L", name: "Data Communication and Networking Core", units: 2.0, prerequisites: "ITS162-1L", color: "#2a9d8f" },
  { id: "course-math181", code: "MATH181", name: "Quantitative Methods", units: 3.0, prerequisites: "MATH170", color: "#b56576" },
  { id: "course-rzl110", code: "RZL110", name: "The Life and Works of Rizal", units: 3.0, prerequisites: "None", color: "#800020" },

  // --- YEAR 2, TERM 3 ---
  { id: "course-css132-1", code: "CSS132-1", name: "Discrete Mathematics 2", units: 3.0, prerequisites: "CSS131-1", color: "#489fb5" },
  { id: "course-css152p", code: "CSS152P", name: "Software Engineering 2", units: 3.0, prerequisites: "CSS151P", color: "#489fb5" },
  { id: "course-ged102", code: "GED102", name: "Mathematics in the Modern World", units: 3.0, prerequisites: "None", color: "#b56576" },
  { id: "course-its150p", code: "ITS150P", name: "Operating Systems", units: 3.0, prerequisites: "ITS112P", color: "#2a9d8f" },

  // --- YEAR 2, TERM 4 ---
  { id: "course-css125p", code: "CSS125P", name: "Principles of Programming Languages", units: 3.0, prerequisites: "CSS123P", color: "#489fb5" },
  { id: "course-its122p", code: "ITS122P", name: "Web Systems and Technologies 2", units: 3.0, prerequisites: "ITS121-1L, ITS131P", color: "#2a9d8f" },
  { id: "course-its132p", code: "ITS132P", name: "Data Warehousing and Data Mining", units: 3.0, prerequisites: "DSS110, ITS131P", color: "#2a9d8f" },
  { id: "course-pcc150", code: "PCC150", name: "Professional Communications Course", units: 3.0, prerequisites: "None", color: "#800020" },

  // --- YEAR 3, TERM 1 ---
  { id: "course-css133-1", code: "CSS133-1", name: "Algorithms and Complexity", units: 3.0, prerequisites: "CSS131-1", color: "#489fb5" },
  { id: "course-css134-1", code: "CSS134-1", name: "Automata Theory and Formal Language", units: 3.0, prerequisites: "CSS132-1", color: "#489fb5" },
  { id: "course-gee120", code: "GEE120", name: "GE Elective", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-ie103-2", code: "IE103-2", name: "Technopreneurship 101", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-phy10-8", code: "PHY10-8", name: "College Physics 1", units: 2.0, prerequisites: "None", color: "#d62828" },
  { id: "course-phy10-8l", code: "PHY10-8L", name: "College Physics 1 Laboratory", units: 1.0, prerequisites: "None", color: "#d62828" },

  // --- YEAR 3, TERM 2 ---
  { id: "course-css141-1", code: "CSS141-1", name: "Numerical Methods", units: 3.0, prerequisites: "CSS132-1", color: "#489fb5" },
  { id: "course-css142p", code: "CSS142P", name: "Modeling and Simulation Theory", units: 3.0, prerequisites: "CSS133-1", color: "#489fb5" },
  { id: "course-ged108", code: "GED108", name: "Art Appreciation", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-phy11-8", code: "PHY11-8", name: "College Physics 2", units: 2.0, prerequisites: "PHY10-8, PHY10-8L", color: "#d62828" },
  { id: "course-phy11-8l", code: "PHY11-8L", name: "College Physics 2 Laboratory", units: 1.0, prerequisites: "PHY10-8, PHY10-8L", color: "#d62828" },

  // --- YEAR 3, TERM 3 ---
  { id: "course-css109-1", code: "CSS109-1", name: "Research Methods in Computer Science", units: 3.0, prerequisites: "CSS142P, CSS152P", color: "#489fb5" },
  { id: "course-css154-1", code: "CSS154-1", name: "Parallel and Distributed Computing", units: 3.0, prerequisites: "ITS131P, ITS150P, ITS163-1L", color: "#489fb5" },
  { id: "course-env121", code: "ENV121", name: "Environmental Science and Sustainability", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-its141-1", code: "ITS141-1", name: "Human-Computer Interaction 1", units: 3.0, prerequisites: "CSS123P", color: "#2a9d8f" },
  { id: "course-its165-1", code: "ITS165-1", name: "Information Security and Assurance 1", units: 3.0, prerequisites: "ITS131P, ITS161-1L", color: "#2a9d8f" },

  // --- YEAR 3, TERM 4 ---
  { id: "course-css200-01", code: "CSS200-01", name: "Thesis 1", units: 1.0, prerequisites: "CSS109-1", color: "#c26d5c" },
  { id: "course-ged110", code: "GED110", name: "People and Earth's Ecosystem", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-gee130", code: "GEE130", name: "GE Elective", units: 3.0, prerequisites: "None", color: "#800020" },
  { id: "course-its105-1", code: "ITS105-1", name: "Social and Professional Issues", units: 3.0, prerequisites: "CSS123P, GED107", color: "#2a9d8f" },
  { id: "course-its120p", code: "ITS120P", name: "Application Development and Emerging Technologies", units: 3.0, prerequisites: "CSS123P", color: "#2a9d8f" },

  // --- YEAR 4, TERM 1 ---
  { id: "course-css199-8r", code: "CSS199-8R", name: "CS Practicum", units: 3.0, prerequisites: "None", color: "#c26d5c" },
  { id: "course-css200-02", code: "CSS200-02", name: "Thesis 2", units: 1.0, prerequisites: "CSS200-01", color: "#c26d5c" },
  { id: "course-its198f", code: "ITS198F", name: "Career Development and Seminar in IT", units: 1.0, prerequisites: "None", color: "#c26d5c" },
  { id: "course-sge100x", code: "SGE100X", name: "Student Global Experience", units: 0.0, prerequisites: "None", color: "#800020" }
];

// Initial layout for terms (Year 1 to Year 4, Term 1 to Term 4)
const DEFAULT_CURRICULUM_PLAN = {
  "y1-t1": ["course-css100", "course-css121p", "course-fw01-2", "course-ged101", "course-ged103", "course-math165", "course-nstp001"],
  "y1-t2": ["course-css122p", "course-cwt5001", "course-fw02-2", "course-ged104", "course-ged105", "course-its110p", "course-its121-1l", "course-math170"],
  "y1-t3": ["course-css130-1", "course-cwt5002", "course-fw03-2", "course-ged106", "course-ged107", "course-its131p", "course-its161-1l", "course-math174"],
  "y1-t4": [],
  "y2-t1": ["course-css123p", "course-dss110", "course-fw04-2", "course-its112p", "course-its162-1l", "course-math175"],
  "y2-t2": ["course-css131-1", "course-css151p", "course-its163-1l", "course-math181", "course-rzl110"],
  "y2-t3": ["course-css132-1", "course-css152p", "course-ged102", "course-its150p"],
  "y2-t4": ["course-css125p", "course-its122p", "course-its132p", "course-pcc150"],
  "y3-t1": ["course-css133-1", "course-css134-1", "course-gee120", "course-ie103-2", "course-phy10-8", "course-phy10-8l"],
  "y3-t2": ["course-css141-1", "course-css142p", "course-ged108", "course-phy11-8", "course-phy11-8l"],
  "y3-t3": ["course-css109-1", "course-css154-1", "course-env121", "course-its141-1", "course-its165-1"],
  "y3-t4": ["course-css200-01", "course-ged110", "course-gee130", "course-its105-1", "course-its120p"],
  "y4-t1": ["course-css199-8r", "course-css200-02", "course-its198f", "course-sge100x"],
  "y4-t2": [],
  "y4-t3": [],
  "y4-t4": []
};