const fs = require('fs');
const path = require('path');

const datasetDir = path.join(__dirname, '../src/dataset');
const outputFile = path.join(__dirname, '../src/components/ncertData.js');

const chapters = [];
const stemMockData = {
  cs: {
    name: 'Computer Science',
    color: 'var(--accent)',
    bgColor: 'var(--accent-light)',
    highlight: true,
    grades: {}
  },
  maths: {
    name: 'Mathematics',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    highlight: false,
    grades: {}
  },
  science: {
    name: 'Science',
    color: '#10B981',
    bgColor: '#ECFDF5',
    highlight: false,
    grades: {}
  },
  english: {
    name: 'English',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    highlight: false,
    grades: {}
  }
};

const hints = {
  cs: [
    "🤔 Think about what the loop condition does — when does it become False?",
    "💡 Break the problem into smaller sub-problems. Can you write a function for each part?",
    "🔍 Print the value of your variable at each step to trace what is happening."
  ],
  maths: [
    "🤔 What information is given? What are you asked to find? Write it down first.",
    "💡 Substitute a simpler number (like x=0 or x=1) to test if your formula makes sense.",
    "🔍 Can you spot a pattern in the first 3 terms? That often reveals the formula."
  ],
  science: [
    "🤔 Draw a diagram or flow chart of the process — listing inputs and outputs first.",
    "💡 Check your units! E.g., force is Newtons, pressure is Pascals.",
    "🔍 Contrast the concepts: what is similar, what is different?"
  ],
  english: [
    "🤔 Focus on the central theme of the chapter or poem.",
    "💡 Pay attention to character motivations and key quotes.",
    "🔍 Identify literary devices (metaphor, simile, irony) used by the author."
  ]
};

// Traverse directories
const getFiles = (dir) => {
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files = files.concat(getFiles(filePath));
    } else if (file.endsWith('.md')) {
      files.push(filePath);
    }
  });
  return files;
};

const mdFiles = getFiles(datasetDir);

mdFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(datasetDir, file);
  
  // Extract grade from parent folder name (e.g., "Class 8th" -> "8")
  const gradeMatch = relativePath.match(/Class\s*(\d+)/i);
  const grade = gradeMatch ? gradeMatch[1] : '';
  
  // Extract subject from filename
  let subject = '';
  if (file.toLowerCase().includes('_cs_')) subject = 'cs';
  else if (file.toLowerCase().includes('_maths_')) subject = 'maths';
  else if (file.toLowerCase().includes('_science_')) subject = 'science';
  else if (file.toLowerCase().includes('_english_')) subject = 'english';
  
  if (!grade || !subject) {
    console.log(`Skipping file: ${relativePath} (unknown grade/subject)`);
    return;
  }
  
  console.log(`Parsing: ${relativePath} -> Grade ${grade}, Subject ${subject}`);
  
  // Parse chapters in file
  const lines = content.split('\n');
  let currentChap = null;
  let currentSection = ''; // 'overview', 'keyPoints', 'realWorld', 'chapters'
  let keyPointsList = [];
  let overviewText = '';
  let realWorldText = '';

  let chNo = 1;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Check for chapter title (starts with ## or ### and has a number/title)
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      // Save previous chapter if active
      if (currentChap) {
        chapters.push(currentChap);
        currentChap = null;
      }
      
      const titleText = trimmed.replace(/^#+\s*/, '');
      
      // Check if it is a major category header in the markdown or an actual chapter
      if (titleText.toLowerCase().includes('unit ') || titleText.toLowerCase().includes('first flight') || titleText.toLowerCase().includes('footprints')) {
        // Just context heading, skip or keep as unit info
        return;
      }
      
      // It's a chapter!
      currentChap = {
        id: `c${grade}-${subject}-${chNo++}`,
        number: `Ch ${chNo - 1}`,
        title: titleText,
        grade,
        subject,
        description: '',
        topics: [],
        analogy: '',
        syntax: '',
        codeExample: '',
        pitfalls: '',
        challenge: '',
        islAvailable: true
      };
      
      currentSection = 'chap-intro';
      return;
    }
    
    // If not in a chapter, we might be parsing file-wide/subject overview, key points, real world
    if (!currentChap) {
      if (trimmed.startsWith('# ')) {
        return;
      }
      if (trimmed.toLowerCase().includes('**concept:**') || trimmed.toLowerCase().includes('**overview:**') || trimmed.toLowerCase().includes('**summary:**')) {
        overviewText += trimmed.replace(/^\*\*.*?\*\*\s*/i, '') + ' ';
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        keyPointsList.push(trimmed.replace(/^[-*]\s*/, ''));
      }
      if (trimmed.toLowerCase().includes('**example:**') || trimmed.toLowerCase().includes('**real-world:**') || trimmed.toLowerCase().includes('**real world:**')) {
        realWorldText += trimmed.replace(/^\*\*.*?\*\*\s*/i, '') + ' ';
      }
      return;
    }
    
    // We are inside a chapter
    if (trimmed.startsWith('**Concept:**') || trimmed.startsWith('**Summary:**') || trimmed.startsWith('**Verified context:**')) {
      currentChap.description = trimmed.replace(/^\*\*.*?\*\*\s*/, '');
      currentSection = 'desc';
    } else if (trimmed.startsWith('**Key facts:**') || trimmed.startsWith('**Key formulas:**') || trimmed.startsWith('**Key theme:**')) {
      currentSection = 'topics';
    } else if (trimmed.startsWith('**Worked Example:**') || trimmed.startsWith('**Example:**') || trimmed.startsWith('**Solution:**')) {
      currentChap.codeExample = trimmed.replace(/^\*\*.*?\*\*\s*/, '');
      currentSection = 'code';
    } else if (trimmed.startsWith('**Common mistake:**') || trimmed.startsWith('**Common Mistakes Students Make**')) {
      currentChap.pitfalls = trimmed.replace(/^\*\*.*?\*\*\s*/, '');
      currentSection = 'pitfalls';
    } else if (trimmed.startsWith('**Practice question:**') || trimmed.startsWith('**Practice Questions**')) {
      currentChap.challenge = trimmed.replace(/^\*\*.*?\*\*\s*/, '');
      currentSection = 'challenge';
    } else if (trimmed.startsWith('**Historical note:**')) {
      currentChap.analogy = (currentChap.analogy ? currentChap.analogy + '\n' : '') + trimmed;
    } else {
      // Append to the active section
      if (currentSection === 'desc') {
        currentChap.description += ' ' + trimmed;
      } else if (currentSection === 'topics') {
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          currentChap.topics.push(trimmed.replace(/^[-*]\s*/, ''));
        } else {
          currentChap.topics.push(trimmed);
        }
      } else if (currentSection === 'code') {
        currentChap.codeExample += '\n' + trimmed;
      } else if (currentSection === 'pitfalls') {
        currentChap.pitfalls += '\n' + trimmed;
      } else if (currentSection === 'challenge') {
        currentChap.challenge += '\n' + trimmed;
      } else {
        // Fallback: build analogy or description
        if (!currentChap.description) {
          currentChap.description = trimmed;
        } else if (!currentChap.analogy) {
          currentChap.analogy = trimmed;
        } else {
          currentChap.analogy += '\n' + trimmed;
        }
      }
    }
  });
  
  if (currentChap) {
    chapters.push(currentChap);
  }
  
  // Build grade overview if we found overview text, otherwise fallback
  if (!stemMockData[subject].grades[grade]) {
    stemMockData[subject].grades[grade] = {
      overview: overviewText.trim() || `Study materials and chapters for Class ${grade} ${stemMockData[subject].name}.`,
      keyPoints: keyPointsList.slice(0, 4) || [`Complete the curriculum chapters`, `Understand foundational ideas`],
      realWorld: realWorldText.trim() || `Everyday application of Class ${grade} ${stemMockData[subject].name}.`
    };
  }
});

// Injected Mock Chapters for requested grade/subject gaps
const mockChapters = [
  // Class 8 CS
  {
    id: "c8-cs-1", number: "Ch 1", title: "Introduction to Python & Algorithmic Thinking",
    grade: "8", subject: "cs",
    description: "Algorithms, flowchart logic, and your very first Python print statement.",
    topics: ["Algorithm vs Program", "Python Interpreter", "print() and input()"],
    analogy: "An algorithm is like a recipe — step-by-step instructions a cook (computer) must follow in order.",
    syntax: "print(\"Hello\") — tells Python to display text on screen.",
    codeExample: "name = input(\"Enter your name: \")\nprint(\"Namaste,\", name)",
    pitfalls: "Forgetting the colon : after if/while or mixing tabs and spaces causes IndentationError.",
    challenge: "Write an algorithm in plain English to make tea, then convert it into Python print statements.",
    islAvailable: true
  },
  {
    id: "c8-cs-2", number: "Ch 2", title: "Variables, Data Types & Arithmetic Operators",
    grade: "8", subject: "cs",
    description: "Storing Integers, Floats, Strings and Booleans in memory and doing math.",
    topics: ["Variables & Memory", "int / str / float / bool", "Operators +, -, *, /, //"],
    analogy: "A variable is a labelled box — the label is the name, the box holds the value.",
    syntax: "age = 14\nprice = 9.99\nname = \"Priya\"",
    codeExample: "a = 10\nb = 3\nprint(a // b) # integer division -> 3\nprint(a % b) # remainder -> 1",
    pitfalls: "Dividing an integer by zero raises ZeroDivisionError. Always check the denominator first.",
    challenge: "Calculate the area and perimeter of a rectangle using variables and operators.",
    islAvailable: true
  },
  {
    id: "c8-cs-3", number: "Ch 3", title: "Control Flow: Conditionals & Loops",
    grade: "8", subject: "cs",
    description: "Making decisions with if-elif-else and repeating tasks with while and for loops.",
    topics: ["if-else Branching", "while Loops", "for Loop Iteration", "range()"],
    analogy: "A loop is like running laps on a track — keep going until the coach blows the whistle.",
    syntax: "for i in range(1, 6):\n    print(i)",
    codeExample: "total = 0\nfor i in range(1, 6):\n    total += i\nprint(\"Sum =\", total)",
    pitfalls: "An infinite while loop freezes the program. Always ensure the loop condition becomes False eventually.",
    challenge: "Print only even numbers from 1 to 20 using a for loop and an if condition.",
    islAvailable: true
  },
  // Class 9 CS
  {
    id: "c9-cs-1", number: "Ch 1", title: "Functions & Modular Code Design",
    grade: "9", subject: "cs",
    description: "Breaking large programs into reusable, named blocks called functions.",
    topics: ["def Keyword", "Parameters & Arguments", "Return Values", "Scope"],
    analogy: "A function is a TV remote button — press it once and a whole sequence of actions fires.",
    syntax: "def greet(name):\n    return \"Namaste, \" + name",
    codeExample: "def square(n):\n    return n * n\nprint(square(5)) # 25",
    pitfalls: "Forgetting return makes a function return None. Printing inside is NOT the same as returning.",
    challenge: "Write a function that takes two numbers and returns their LCM.",
    islAvailable: true
  },
  {
    id: "c9-cs-2", number: "Ch 2", title: "Strings: Indexing, Slicing & Methods",
    grade: "9", subject: "cs",
    description: "Treating text as a sequence and using built-in string methods.",
    topics: ["Indexing & Slicing", ".upper() .lower()", "len() and in operator"],
    analogy: "A string is a garland of beads — each bead is a character with a position number starting at 0.",
    syntax: "s = \"CodeSeekho\"\nprint(s[0])\nprint(s[4:9])",
    codeExample: "word = \"Python\"\nprint(word[::-1]) # nohtyP",
    pitfalls: "Strings are immutable — you cannot change a character in-place.",
    challenge: "Check if a given word is a palindrome using string slicing.",
    islAvailable: true
  },
  // Class 10 CS
  {
    id: "c10-cs-1", number: "Ch 1", title: "Data Structures: Lists & Dictionaries",
    grade: "10", subject: "cs",
    description: "Organizing data with ordered lists and key-value pair dictionaries.",
    topics: ["List Indexing & Slicing", "Dictionary Keys & Values", "append, pop, del"],
    analogy: "A list is like a train — compartments in order. A dictionary is like a phone book — look up by name.",
    syntax: "fruits = [\"mango\", \"banana\"]\nstudent = {\"name\": \"Ravi\", \"class\": 10}",
    codeExample: "marks = {\"Math\": 92, \"Science\": 87}\nfor subj, score in marks.items():\n    print(subj, \"->\", score)",
    pitfalls: "Accessing a key that does not exist raises KeyError. Use dict.get(key, default).",
    challenge: "Build a student report card using a dictionary and display it with a loop.",
    islAvailable: true
  },
  {
    id: "c10-cs-2", number: "Ch 2", title: "File Handling in Python",
    grade: "10", subject: "cs",
    description: "Reading and writing data to text files using Python's built-in file functions.",
    topics: ["open(), read(), write()", "with Statement", "File Modes r / w / a"],
    analogy: "Opening a file is like opening a notebook — you must close it after writing.",
    syntax: "with open(\"data.txt\", \"w\") as f:\n    f.write(\"Hello!\")",
    codeExample: "with open(\"scores.txt\", \"r\") as f:\n    for line in f:\n        print(line.strip())",
    pitfalls: "Not closing a file or not using 'with' can leave it locked.",
    challenge: "Write a program to store 5 student names in a file and then read them back.",
    islAvailable: true
  },
  // Class 11 Science
  {
    id: "c11-science-1", number: "Ch 1", title: "Physical World, Units & Measurement",
    grade: "11", subject: "science",
    description: "Understanding physical quantities, international system of units (SI), dimensional analysis, and error calculation.",
    topics: ["SI Units", "Dimensional Analysis", "Significant Figures", "Errors in Measurement"],
    analogy: "Units are like language dialects — everyone must agree on the standard dialect (SI) to understand each other.",
    syntax: "Formula: Density = Mass / Volume\nDimensions: [M L^-3]",
    codeExample: "If mass = 10.0g (3 sig figs) and volume = 2.0cm3 (2 sig figs), density = 5.0 g/cm3.",
    pitfalls: "Adding quantities with different dimensions (like adding meters to kilograms) is physically impossible.",
    challenge: "Determine the dimensions of universal gravitational constant G using F = G*m1*m2/r2.",
    islAvailable: true
  },
  {
    id: "c11-science-2", number: "Ch 2", title: "Laws of Motion & Work-Energy Theorem",
    grade: "11", subject: "science",
    description: "Newton's Laws of Motion, conservation of momentum, friction, and the relation between work done and kinetic energy.",
    topics: ["Newton's Three Laws", "Friction and Lubrication", "Work-Energy Theorem", "Potential vs Kinetic Energy"],
    analogy: "Inertia is like laziness — an object wants to keep doing whatever it is currently doing unless forced to change.",
    syntax: "Force: F = m*a\nWork: W = F * d * cos(theta)",
    codeExample: "A 5kg block accelerated at 2 m/s2 requires F = 5 * 2 = 10 Newtons of force.",
    pitfalls: "Confusing mass (kilograms, constant) with weight (Newtons, changes with gravity).",
    challenge: "Find the work done in lifting a 10kg mass to a height of 5 meters (take g = 9.8 m/s2).",
    islAvailable: true
  },
  // Class 12 Science
  {
    id: "c12-science-1", number: "Ch 1", title: "Electrostatics & Ohm's Law",
    grade: "12", subject: "science",
    description: "Coulomb's Law, electric field lines, electric potential, capacitance, electric current, and resistance.",
    topics: ["Coulomb's Law", "Electric Potential", "Ohm's Law (V=IR)", "Capacitors in Series/Parallel"],
    analogy: "Electric current is like water flowing through a pipe — voltage is water pressure, resistance is a squeeze in the pipe.",
    syntax: "Ohm's Law: V = I * R\nCoulomb's Force: F = k * q1 * q2 / r^2",
    codeExample: "A bulb with 10 ohms resistance connected to a 12V battery draws I = 12/10 = 1.2 Amperes.",
    pitfalls: "Thinking that current gets 'used up' in a resistor — current remains the same, only electrical potential energy drops.",
    challenge: "Calculate the equivalent capacitance of two 10 microfarad capacitors connected in series.",
    islAvailable: true
  },
  {
    id: "c12-science-2", number: "Ch 2", title: "Electromagnetic Induction & Wave Optics",
    grade: "12", subject: "science",
    description: "Magnetic flux, Faraday's laws of induction, Lenz's law, AC generator, wave nature of light, and interference.",
    topics: ["Faraday's Law", "Lenz's Law", "AC Generator", "Young's Double Slit Experiment"],
    analogy: "Lenz's Law is like teenagers — it always opposes whatever change or action is trying to influence it.",
    syntax: "Induced EMF: e = -d(Phi)/dt\nFringe Width: beta = lambda * D / d",
    codeExample: "Changing magnetic flux by 5 Webers in 0.5 seconds induces EMF of e = -5 / 0.5 = -10 Volts.",
    pitfalls: "Forgetting the negative sign in Faraday's Law which represents Lenz's Law (conservation of energy).",
    challenge: "Explain how Lenz's law is a direct consequence of the law of conservation of energy.",
    islAvailable: true
  },
  // Class 9 English
  {
    id: "c9-english-1", number: "Ch 1", title: "The Fun They Had (Isaac Asimov)",
    grade: "9", subject: "english",
    description: "A story set in the future (2157) where children learn from mechanical/computer teachers at home and discover an old printed book about schools of the past.",
    topics: ["Future Education", "Printed Books", "Social Interaction in School"],
    analogy: "Think of it as comparing a fully remote online classroom to a physical school where students meet and study together.",
    syntax: "Theme: The human element of education and peer socialization.",
    codeExample: "Margie wrote in her diary: 'Today Tommy found a real book!'",
    pitfalls: "Students often miss Asimov's subtle critique of sterile, fully automated teaching systems.",
    challenge: "Write a short paragraph comparing your digital learning experience with physical school.",
    islAvailable: true
  },
  {
    id: "c9-english-2", number: "Ch 2", title: "The Road Not Taken (Robert Frost) - Poem",
    grade: "9", subject: "english",
    description: "A famous poem about a traveller facing a choice between two paths in a yellow wood, serving as a metaphor for decision-making in life.",
    topics: ["Making Choices", "Indecision", "Regret and Reflection"],
    analogy: "Choosing a career stream in high school (like STEM vs Commerce) is a modern 'road not taken'.",
    syntax: "Rhyme Scheme: ABAAB",
    codeExample: "Two roads diverged in a wood, and I—\nI took the one less traveled by,\nAnd that has made all the difference.",
    pitfalls: "Believing the speaker is glad about his choice — the poem suggests a sigh of wonder and uncertainty, not necessarily triumph.",
    challenge: "Identify the metaphor and explain how the road represents human life choices.",
    islAvailable: true
  }
];

chapters.push(...mockChapters);

// Ensure grades structure in stemMockData for injected grades
const mockGrades = {
  cs: {
    "8": { overview: "Class 8 CS focuses on Algorithmic Thinking, Python Basics, and understanding how computers store data.", keyPoints: [], realWorld: "Games like Minecraft run loops and conditionals." },
    "9": { overview: "Class 9 CS focuses on Modular code design and functions in Python.", keyPoints: [], realWorld: "Mobile application buttons call functions." },
    "10": { overview: "Class 10 CS focuses on Lists, Dictionaries and text file handling.", keyPoints: [], realWorld: "Contact lists are stored as dictionary items." }
  },
  science: {
    "11": { overview: "Class 11 Science covers Units, Measurement, and Laws of Motion.", keyPoints: [], realWorld: "Rocket science relies on Newton's laws." },
    "12": { overview: "Class 12 Science covers Electrostatics, AC circuits, and Wave Optics.", keyPoints: [], realWorld: "Fiber optics and generators power modern homes." }
  }
};

Object.keys(mockGrades).forEach(subj => {
  Object.keys(mockGrades[subj]).forEach(gr => {
    if (!stemMockData[subj].grades[gr]) {
      stemMockData[subj].grades[gr] = mockGrades[subj][gr];
    }
  });
});

// Final cleanup of parsed data (trim, handle defaults)
chapters.forEach(c => {
  c.description = c.description.trim() || 'No description available.';
  c.analogy = c.analogy.trim() || 'Think of it as a key element of the subject.';
  c.syntax = c.syntax.trim() || 'N/A';
  c.codeExample = c.codeExample.trim() || 'No example provided.';
  c.pitfalls = c.pitfalls.trim() || 'None reported.';
  c.challenge = c.challenge.trim() || 'Solve the chapter problems.';
  if (c.topics.length === 0) {
    c.topics = ['Core concept', 'Application', 'Formulas'];
  }
});

// Populate empty keyPoints with chapter titles
Object.keys(stemMockData).forEach(subj => {
  Object.keys(stemMockData[subj].grades).forEach(gr => {
    const gradeGrades = stemMockData[subj].grades[gr];
    if (!gradeGrades.keyPoints || gradeGrades.keyPoints.length === 0) {
      const chapTitles = chapters.filter(c => c.grade === gr && c.subject === subj).map(c => {
        // Strip numbers from beginning of titles
        return c.title.replace(/^\d+\.\s*/, '').replace(/^Chapter\s*\d+:\s*/i, '').trim();
      });
      if (chapTitles.length > 0) {
        gradeGrades.keyPoints = chapTitles.slice(0, 4);
      } else {
        gradeGrades.keyPoints = ['Understand foundational concepts', 'Apply learning to real-world scenarios'];
      }
    }
  });
});

// Generate Javascript output file content
const jsContent = `// Automatically generated NCERT dataset compile
export const NCERT_CHAPTERS = ${JSON.stringify(chapters, null, 2)};

export const STEM_MOCK_DATA = {
  cs: {
    name: 'Computer Science',
    color: 'var(--accent)',
    bgColor: 'var(--accent-light)',
    highlight: true,
    grades: ${JSON.stringify(stemMockData.cs.grades, null, 2)}
  },
  maths: {
    name: 'Mathematics',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    highlight: false,
    grades: ${JSON.stringify(stemMockData.maths.grades, null, 2)}
  },
  science: {
    name: 'Science',
    color: '#10B981',
    bgColor: '#ECFDF5',
    highlight: false,
    grades: ${JSON.stringify(stemMockData.science.grades, null, 2)}
  },
  english: {
    name: 'English',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    highlight: false,
    grades: ${JSON.stringify(stemMockData.english.grades, null, 2)}
  }
};

export const HINTS = ${JSON.stringify(hints, null, 2)};
`;

fs.writeFileSync(outputFile, jsContent, 'utf8');
console.log('Successfully generated NCERT dataset at ' + outputFile);
