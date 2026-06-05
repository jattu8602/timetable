import os

# Create target directory
output_dir = "/Users/jattu/Desktop/admin_samayak/timetable data"
os.makedirs(output_dir, exist_ok=True)

# Timetables Data
timetables = [
    # 1. CSE B.Tech VI A
    {
        "file_id": 1,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "VI A",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        # Period index: 1=I, 2=II, 3=III, 4=IV, 5=V, 6=LUNCH, 7=VI, 8=VII, 9=VIII, 10=IX
        "slots": {
            "Monday": [
                {"text": "Col / 219", "start": 1, "end": 1},
                {"text": "AIML Lab (Lab 3)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "CD (G3)", "start": 8, "end": 8},
                {"text": "AIML (G3)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Tuesday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "", "start": 2, "end": 3},
                {"text": "AIML (T) (G3)", "start": 4, "end": 4},
                {"text": "CD (G3)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "CD Lab (Lab 6)", "start": 7, "end": 9},
                {"text": "", "start": 10, "end": 10}
            ],
            "Wednesday": [
                {"text": "", "start": 1, "end": 2},
                {"text": "ES Lab (Lab 3)", "start": 3, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "CD (T) (G3)", "start": 8, "end": 8},
                {"text": "AIML (G3)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "CD (G3)", "start": 8, "end": 8},
                {"text": "AIML (G3)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Friday": [
                {"text": "Col / 219", "start": 1, "end": 1},
                {"text": "MT133 CS - II (219)", "start": 2, "end": 4},
                {"text": "OE III", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS333", "type": "Core", "name": "Compiler Design (CD)", "credits": "4", "teacher": "Prof. Supratim Biswas"},
            {"code": "CS335", "type": "Core", "name": "Artificial Intelligence and Machine Learning (AIML)", "credits": "4", "teacher": "Dr. Sanchita Paul"},
            {"code": "IT349", "type": "PE III", "name": "Cryptography and Network Security (CNS)", "credits": "3", "teacher": "Dr. Sumit Srivastava (Group 1) & Dr. Ravi Sankar Mehta (Group 2)"},
            {"code": "IT353", "type": "PE III", "name": "Blockchain Technology (BCT)", "credits": "3", "teacher": "Dr. K. S. Patnaik (Group 1) & Prof. Sandip Dutta (Group 2)"},
            {"code": "MT204", "type": "HSS", "name": "Constitution of India (Col)", "credits": "NC", "teacher": "Dr. Anand Kumar (Department of Management)"},
            {"code": "MT133", "type": "HSS", "name": "Communications Skills II (CS-II)", "credits": "1.5", "teacher": "Jyoti Kumari (Humanities and Social Sciences Department)"},
            {"code": "CS336", "type": "Core", "name": "Artificial Intelligence & Machine Learning Lab (AIML Lab)", "credits": "1.5", "teacher": "Dr. Sanchita Paul & Dr. Amritanjali"},
            {"code": "CS334", "type": "Core", "name": "Compiler Design Lab (CD Lab)", "credits": "1.5", "teacher": "Prof. Supratim Biswas & Dr. Anup Kumar Keshri"},
            {"code": "CS338", "type": "Core", "name": "Embeded System Lab (ES Lab)", "credits": "1.5", "teacher": "Prof. Abhijit Mustafi & Dr. Rathindranath Dutta"},
            {"code": "-", "type": "OE", "name": "OEIII/ MOOC", "credits": "3", "teacher": "-"},
            {"code": "MC300", "type": "Proj.", "name": "Summer Training", "credits": "2", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 2. CSE B.Tech VI B
    {
        "file_id": 2,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "VI B",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "Col / 219", "start": 1, "end": 1},
                {"text": "ES Lab (Lab 6)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "CD (T) (220)", "start": 8, "end": 8},
                {"text": "AIML (220)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Tuesday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "AIML Lab (Lab 1)", "start": 7, "end": 10}
            ],
            "Wednesday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "CD Lab (Lab 1)", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "AIML (220)", "start": 8, "end": 8},
                {"text": "CD (220)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "AIML (T) (220)", "start": 8, "end": 8},
                {"text": "CD (220)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Friday": [
                {"text": "Col / 219", "start": 1, "end": 1},
                {"text": "MT133 CS - II (219)", "start": 2, "end": 4},
                {"text": "OE III", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 8},
                {"text": "AIML (220)", "start": 9, "end": 9},
                {"text": "CD (220)", "start": 10, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS333", "type": "Core", "name": "Compiler Design (CD)", "credits": "4", "teacher": "Dr. Prashant Pranav"},
            {"code": "CS335", "type": "Core", "name": "Artificial Intelligence and Machine Learning (AIML)", "credits": "4", "teacher": "Dr. Amritanjali"},
            {"code": "IT349", "type": "PE III", "name": "Cryptography and Network Security (CNS)", "credits": "3", "teacher": "Dr. Sumit Srivastava (Group 1) & Dr. Ravi Sankar Mehta (Group 2)"},
            {"code": "IT353", "type": "PE III", "name": "Blockchain Technology (BCT)", "credits": "3", "teacher": "Dr. K. S. Patnaik (Group 1) & Prof. Sandip Dutta (Group 2)"},
            {"code": "MT204", "type": "HSS", "name": "Constitution of India (Col)", "credits": "NC", "teacher": "Dr. Anand Kumar (Department of Management)"},
            {"code": "MT133", "type": "HSS", "name": "Communications Skills II (CS-II)", "credits": "1.5", "teacher": "Jyoti Kumari (Humanities and Social Sciences Department)"},
            {"code": "CS336", "type": "Core", "name": "Artificial Intelligence & Machine Learning Lab (AIML Lab)", "credits": "1.5", "teacher": "Dr. Amritanjali & Dr. Lopamudra Hota"},
            {"code": "CS334", "type": "Core", "name": "Compiler Design Lab (CD Lab)", "credits": "1.5", "teacher": "Dr. Prashant Pranav & Dr. B. K. Sarkar"},
            {"code": "CS338", "type": "Core", "name": "Embeded System Lab (ES Lab)", "credits": "1.5", "teacher": "Dr. Rathindranath Dutta & Dr. Shreeya Swagatika Sahoo"},
            {"code": "-", "type": "OE", "name": "OEIII/ MOOC", "credits": "3", "teacher": "-"},
            {"code": "MC300", "type": "Proj.", "name": "Summer Training", "credits": "2", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 3. CSE B.Tech VI C
    {
        "file_id": 3,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "VI C",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "AIML Lab (Lab 4)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "Col / 219", "start": 7, "end": 7},
                {"text": "AIML (219)", "start": 8, "end": 8},
                {"text": "CD (219)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Tuesday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "CD Lab (Lab 3)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "AIML (T) (219)", "start": 7, "end": 7},
                {"text": "CD (219)", "start": 8, "end": 8},
                {"text": "", "start": 9, "end": 10}
            ],
            "Wednesday": [
                {"text": "Col / 219", "start": 1, "end": 1},
                {"text": "MT133 CS - II (219)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "AIML (219)", "start": 8, "end": 8},
                {"text": "CD (219)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "ES Lab (Lab 6)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "CD (T) (219)", "start": 8, "end": 8},
                {"text": "AIML (219)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Friday": [
                {"text": "", "start": 1, "end": 4},
                {"text": "OE III", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS333", "type": "Core", "name": "Compiler Design (CD)", "credits": "4", "teacher": "Dr. B. K. Sarkar"},
            {"code": "CS335", "type": "Core", "name": "Artificial Intelligence and Machine Learning (AIML)", "credits": "4", "teacher": "Dr. Shruti Garg"},
            {"code": "IT349", "type": "PE III", "name": "Cryptography and Network Security (CNS)", "credits": "3", "teacher": "Dr. Sumit Srivastava (Group 1) & Dr. Ravi Sankar Mehta (Group 2)"},
            {"code": "IT353", "type": "PE III", "name": "Blockchain Technology (BCT)", "credits": "3", "teacher": "Dr. K. S. Patnaik (Group 1) & Prof. Sandip Dutta (Group 2)"},
            {"code": "MT204", "type": "HSS", "name": "Constitution of India (Col)", "credits": "NC", "teacher": "Dr. P. C. Jha (Department of Management)"},
            {"code": "MT133", "type": "HSS", "name": "Communications Skills II (CS-II)", "credits": "1.5", "teacher": "Ananya Saha (Humanities and Social Sciences Department)"},
            {"code": "CS336", "type": "Core", "name": "Artificial Intelligence & Machine Learning Lab (AIML Lab)", "credits": "1.5", "teacher": "Dr. Shruti Garg & Dr. Lopamudra Hota"},
            {"code": "CS334", "type": "Core", "name": "Compiler Design Lab (CD Lab)", "credits": "1.5", "teacher": "Dr. B. K. Sarkar & Dr. Prashant Pranav"},
            {"code": "CS338", "type": "Core", "name": "Embeded System Lab (ES Lab)", "credits": "1.5", "teacher": "Dr. Sandip Ghosal & Dr. Aditi Panda"},
            {"code": "-", "type": "OE", "name": "OEIII/ MOOC", "credits": "3", "teacher": "-"},
            {"code": "MC300", "type": "Proj.", "name": "Summer Training", "credits": "2", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 4. CSE B.Tech VI D
    {
        "file_id": 4,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "VI D",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "", "start": 1, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "Col / 219", "start": 7, "end": 7},
                {"text": "AIML (G2)", "start": 8, "end": 8},
                {"text": "CD (G2)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Tuesday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "CD (T) (G2)", "start": 8, "end": 8},
                {"text": "AIML (G2)", "start": 9, "end": 9},
                {"text": "", "start": 10, "end": 10}
            ],
            "Wednesday": [
                {"text": "Col / 219", "start": 1, "end": 1},
                {"text": "MT133 CS - II (219)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "ES Lab (Lab 6)", "start": 7, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "CD Lab (Lab 3)", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "AIML (T) (G2)", "start": 8, "end": 8},
                {"text": "CD (G2)", "start": 9, "end": 9},
                {"text": "CNS (219 / 220)\nBCT (G2 / G3)", "start": 10, "end": 10}
            ],
            "Friday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "AIML Lab (Lab 1)", "start": 2, "end": 4},
                {"text": "OE III", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 8},
                {"text": "AIML (G2)", "start": 9, "end": 9},
                {"text": "CD (G2)", "start": 10, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS333", "type": "Core", "name": "Compiler Design (CD)", "credits": "4", "teacher": "Dr. I. Mukherjee"},
            {"code": "CS335", "type": "Core", "name": "Artificial Intelligence and Machine Learning (AIML)", "credits": "4", "teacher": "Dr. C. Lavania"},
            {"code": "IT349", "type": "PE III", "name": "Cryptography and Network Security (CNS)", "credits": "3", "teacher": "Dr. Sumit Srivastava (Group 1) & Dr. Ravi Sankar Mehta (Group 2)"},
            {"code": "IT353", "type": "PE III", "name": "Blockchain Technology (BCT)", "credits": "3", "teacher": "Dr. K. S. Patnaik (Group 1) & Prof. Sandip Dutta (Group 2)"},
            {"code": "MT204", "type": "HSS", "name": "Constitution of India (Col)", "credits": "NC", "teacher": "Dr. P. C. Jha (Department of Management)"},
            {"code": "MT133", "type": "HSS", "name": "Communications Skills II (CS-II)", "credits": "1.5", "teacher": "Ananya Saha (Humanities and Social Sciences Department)"},
            {"code": "CS336", "type": "Core", "name": "Artificial Intelligence & Machine Learning Lab (AIML Lab)", "credits": "1.5", "teacher": "Dr. C. Lavania & Dr. Ritesh Jha"},
            {"code": "CS334", "type": "Core", "name": "Compiler Design Lab (CD Lab)", "credits": "1.5", "teacher": "Dr. I. Mukherjee & Dr. Anup Keshri"},
            {"code": "CS338", "type": "Core", "name": "Embeded System Lab (ES Lab)", "credits": "1.5", "teacher": "Dr. Sandip Ghosal & Dr. Aditi Panda"},
            {"code": "-", "type": "OE", "name": "OEIII/ MOOC", "credits": "3", "teacher": "-"},
            {"code": "MC300", "type": "Proj.", "name": "Summer Training", "credits": "2", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 5. CSE B.Tech VI AIML
    {
        "file_id": 5,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "AIML",
            "semester": "VI",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "", "start": 1, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "IR / DM (G2 / 213)", "start": 7, "end": 7},
                {"text": "", "start": 8, "end": 10}
            ],
            "Tuesday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "DL Lab BT AIML VI (ILF)[]", "start": 2, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "Col / 216A", "start": 7, "end": 7},
                {"text": "MT133 CS - II 216 A", "start": 8, "end": 10}
            ],
            "Wednesday": [
                {"text": "", "start": 1, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "Col / 216A", "start": 7, "end": 7},
                {"text": "DL (216 A)", "start": 8, "end": 8},
                {"text": "MAI (216 A)", "start": 9, "end": 9},
                {"text": "USL (216 A)", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "OE III", "start": 1, "end": 1},
                {"text": "USL Lab (Lab 4)", "start": 2, "end": 4},
                {"text": "IR (213)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DM (213)", "start": 7, "end": 7},
                {"text": "USL (216 A)", "start": 8, "end": 8},
                {"text": "DL (216 A)", "start": 9, "end": 9},
                {"text": "MAI (216 A)", "start": 10, "end": 10}
            ],
            "Friday": [
                {"text": "", "start": 1, "end": 3},
                {"text": "IR (213)", "start": 4, "end": 4},
                {"text": "OE III", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DM (213)", "start": 7, "end": 7},
                {"text": "DL (216 A)", "start": 8, "end": 8},
                {"text": "MAI (216 A)", "start": 9, "end": 9},
                {"text": "USL (216 A)", "start": 10, "end": 10}
            ]
        },
        "courses": [
            {"code": "AI303", "type": "Core", "name": "UnSupervised Learning (USL)", "credits": "3", "teacher": "Dr. Subrajeet Mohapatra"},
            {"code": "AI305", "type": "Core", "name": "Deep Learning (DL)", "credits": "3", "teacher": "Dr. Monu Bhagat"},
            {"code": "AI307", "type": "Core", "name": "Modern AI (MAI)", "credits": "3", "teacher": "Dr. Satish Chander"},
            {"code": "AI317", "type": "PE III", "name": "Information Retrieval (IR)", "credits": "3", "teacher": "Prof. Abhijit Mustafi"},
            {"code": "AI321", "type": "PE III", "name": "Data Mining", "credits": "3", "teacher": "Dr. Saikat Chakraborty"},
            {"code": "MT204", "type": "HSS", "name": "Constitution of India (Col)", "credits": "NC", "teacher": "Dr. R. N. Bhagat (Management Department)"},
            {"code": "MT133", "type": "HSS", "name": "Communications Skills II (CS-II)", "credits": "1.5", "teacher": "Jyoti Kumari (Humanities and Social Sciences Department)"},
            {"code": "AI304", "type": "Core", "name": "UnSupervised Learning Lab (USL Lab)", "credits": "1.5", "teacher": "Dr. Subrajeet Mohapatra & Dr. Shruti Garg"},
            {"code": "AI306", "type": "Core", "name": "Deep Learning Lab (DL Lab)", "credits": "1.5", "teacher": "Dr. Monu Bhagat & Prof. V. Bhattacharya"},
            {"code": "-", "type": "OE", "name": "OEIII/ MOOC", "credits": "3", "teacher": "-"},
            {"code": "-", "type": "Proj.", "name": "Summer Training", "credits": "2", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 6. CSE B.Tech IV A
    {
        "file_id": 6,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "IV A",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "AP Lab (ILF)", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "OS (ILF)", "start": 8, "end": 8},
                {"text": "DAA (ILF)", "start": 9, "end": 9},
                {"text": "DBMS (ILF)", "start": 10, "end": 10}
            ],
            "Tuesday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "NM (214)", "start": 2, "end": 2},
                {"text": "NM Lab (Mathematics Dept. Lab)", "start": 3, "end": 4},
                {"text": "FLAT (214)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "IKS (Online Mode)", "start": 7, "end": 8},
                {"text": "NCC/NSS/ PT & Games/ CA/\nES-235", "start": 9, "end": 10}
            ],
            "Wednesday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "NM (214)", "start": 2, "end": 2},
                {"text": "S & K Lab (Lab 6)", "start": 3, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "DAA (G2)", "start": 8, "end": 8},
                {"text": "FLAT (G2)", "start": 9, "end": 9},
                {"text": "", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "DAA (G2)", "start": 2, "end": 2},
                {"text": "DBMS (G2)", "start": 3, "end": 3},
                {"text": "OS (G2)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DBMS Lab (Lab 1)", "start": 7, "end": 10}
            ],
            "Friday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "DBMS (G2)", "start": 2, "end": 2},
                {"text": "OS (G2)", "start": 3, "end": 3},
                {"text": "FLAT (G2)", "start": 4, "end": 4},
                {"text": "FLAT (T)\n(G2)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS24211", "type": "Core", "name": "Data Base Management System", "credits": "3", "teacher": "Dr. Debjani Mustafi"},
            {"code": "CS24213", "type": "Core", "name": "Design and Analysis of Algorithms", "credits": "3", "teacher": "Dr. N. K. Singh"},
            {"code": "CS24215", "type": "Core", "name": "Operating Systems", "credits": "3", "teacher": "Dr. K. Rajnish"},
            {"code": "CS24219", "type": "Core", "name": "Formal Language Automata Theory (FLAT)", "credits": "4", "teacher": "Dr. Anup Kumar Keshri"},
            {"code": "MA24201", "type": "Core", "name": "Numerical Methods (NM)", "credits": "2", "teacher": "Department of Mathematics"},
            {"code": "HS24211", "type": "Core", "name": "Indian Knowledge System (IKS)", "credits": "0", "teacher": "Department of Management Studies"},
            {"code": "-", "type": "Elective", "name": "OE - I", "credits": "3", "teacher": "-"},
            {"code": "CS24212", "type": "Core", "name": "Data Base Management System (DBMS) Lab", "credits": "1.5", "teacher": "Dr. Debjani Mustafi & Dr. Shreeya Swagatika Sahoo"},
            {"code": "CS24216", "type": "Core", "name": "Shell and Kernel (SK) Lab", "credits": "1.5", "teacher": "Dr. K. Rajnish & Dr. S. Kanungo"},
            {"code": "CS24218", "type": "Core", "name": "Advanced Programming (AP)", "credits": "2.5", "teacher": "Dr. I. Mukherjee & Dr. Nand Kumar Jyotish"},
            {"code": "MA24202", "type": "Core", "name": "Numerical Methods (NM) Lab", "credits": "1", "teacher": "Department of Mathematics"},
            {"code": "MC24206/7/8/9/10", "type": "Activity (Any One)", "name": "NCC / NSS / PT & Games / Creative Arts / Enterpreneurship", "credits": "1", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 7. CSE B.Tech IV B
    {
        "file_id": 7,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "IV B",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "FLAT (219)", "start": 2, "end": 2},
                {"text": "NM (219)", "start": 3, "end": 3},
                {"text": "NM Lab (Mathematics Dept. Lab)", "start": 4, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "S & K Lab (Lab 3)", "start": 8, "end": 10}
            ],
            "Tuesday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "OS (219)", "start": 2, "end": 2},
                {"text": "DBMS (219)", "start": 3, "end": 3},
                {"text": "FLAT (219)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "IKS (Online Mode)", "start": 7, "end": 8},
                {"text": "NCC/NSS/ PT & Games/ CA/\nES-235", "start": 9, "end": 10}
            ],
            "Wednesday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "DAA (220)", "start": 2, "end": 2},
                {"text": "FLAT (220)", "start": 3, "end": 3},
                {"text": "DBMS (220)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ],
            "Thursday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "NM (219)", "start": 2, "end": 2},
                {"text": "DAA (219)", "start": 3, "end": 3},
                {"text": "OS (219)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "AP Lab BT CS IV B (Lab 3)", "start": 7, "end": 10}
            ],
            "Friday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "DBMS Lab (Lab 4)", "start": 2, "end": 4},
                {"text": "DAA (G3)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "DBMS (ILF)", "start": 8, "end": 8},
                {"text": "OS (ILF)", "start": 9, "end": 9},
                {"text": "FLAT (T) (ILF)", "start": 10, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS24211", "type": "Core", "name": "Data Base Management System", "credits": "3", "teacher": "Dr. S. Pushkar"},
            {"code": "CS24213", "type": "Core", "name": "Design and Analysis of Algorithms", "credits": "3", "teacher": "Dr. Nand Kumar Jyotish"},
            {"code": "CS24215", "type": "Core", "name": "Operating Systems", "credits": "3", "teacher": "Dr. S. Kanungo"},
            {"code": "CS24219", "type": "Core", "name": "Formal Language Automata Theory (FLAT)", "credits": "4", "teacher": "Dr. N. K. Singh"},
            {"code": "MA24201", "type": "Core", "name": "Numerical Methods (NM)", "credits": "2", "teacher": "Department of Mathematics"},
            {"code": "HS24211", "type": "Core", "name": "Indian Knowledge System (IKS)", "credits": "0", "teacher": "Department of Management Studies"},
            {"code": "-", "type": "Elective", "name": "OE - I", "credits": "3", "teacher": "-"},
            {"code": "CS24212", "type": "Core", "name": "Data Base Management System (DBMS) Lab", "credits": "1.5", "teacher": "Dr. S. Pushkar & Mr. B. K. Chanda"},
            {"code": "CS24216", "type": "Core", "name": "Shell and Kernel (SK) Lab", "credits": "1.5", "teacher": "Dr. S. Kanungo & Dr. Jit Mukherjee"},
            {"code": "CS24218", "type": "Core", "name": "Advanced Programming (AP)", "credits": "2.5", "teacher": "Dr. Ritesh Jha & Dr. Supreeti Kamilya"},
            {"code": "MA24202", "type": "Core", "name": "Numerical Methods (NM) Lab", "credits": "1", "teacher": "Department of Mathematics"},
            {"code": "MC24206/7/8/9/10", "type": "Activity (Any One)", "name": "NCC / NSS / PT & Games / Creative Arts / Enterpreneurship", "credits": "1", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 8. CSE B.Tech IV C
    {
        "file_id": 8,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "IV C",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "DAA (220)", "start": 2, "end": 2},
                {"text": "OS (220)", "start": 3, "end": 3},
                {"text": "FLAT (220)", "start": 4, "end": 4},
                {"text": "FLAT (T)\n(220)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "NM (204)", "start": 8, "end": 8},
                {"text": "NM Lab (Mathematics Dept. Lab)", "start": 9, "end": 10}
            ],
            "Tuesday": [
                {"text": "AP Lab (Lab 1)", "start": 1, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "IKS (Online Mode)", "start": 7, "end": 8},
                {"text": "NCC/NSS/ PT & Games/ CA/\nES-235", "start": 9, "end": 10}
            ],
            "Wednesday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "DBMS (G2)", "start": 2, "end": 2},
                {"text": "DAA (G2)", "start": 3, "end": 3},
                {"text": "FLAT (G2)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "OS (G3)", "start": 7, "end": 7},
                {"text": "DBMS Lab (Lab 4)", "start": 8, "end": 10}
            ],
            "Thursday": [
                {"text": "NM (G3)", "start": 1, "end": 1},
                {"text": "DBMS (G3)", "start": 2, "end": 2},
                {"text": "S & K Lab (Lab 1) BT CS IV C", "start": 3, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ],
            "Friday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "DAA (220)", "start": 2, "end": 2},
                {"text": "DBMS (220)", "start": 3, "end": 3},
                {"text": "FLAT (220)", "start": 4, "end": 4},
                {"text": "OS (220)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS24211", "type": "Core", "name": "Data Base Management System", "credits": "3", "teacher": "Dr. Saikat Chakraborty"},
            {"code": "CS24213", "type": "Core", "name": "Design and Analysis of Algorithms", "credits": "3", "teacher": "Dr. J. Bakas"},
            {"code": "CS24215", "type": "Core", "name": "Operating Systems", "credits": "3", "teacher": "Dr. Jit Mukherjee"},
            {"code": "CS24219", "type": "Core", "name": "Formal Language Automata Theory (FLAT)", "credits": "4", "teacher": "Dr. Supreeti Kamilya"},
            {"code": "MA24201", "type": "Core", "name": "Numerical Methods (NM)", "credits": "2", "teacher": "Department of Mathematics"},
            {"code": "HS24211", "type": "Core", "name": "Indian Knowledge System (IKS)", "credits": "0", "teacher": "Department of Management Studies"},
            {"code": "-", "type": "Elective", "name": "OE - I", "credits": "3", "teacher": "-"},
            {"code": "CS24212", "type": "Core", "name": "Data Base Management System (DBMS) Lab", "credits": "1.5", "teacher": "Dr. Saikat Chakraborty & Dr. S. Pushkar"},
            {"code": "CS24216", "type": "Core", "name": "Shell and Kernel (SK) Lab", "credits": "1.5", "teacher": "Dr. Jit Mukherjee & Dr. Komal Naaz"},
            {"code": "CS24218", "type": "Core", "name": "Advanced Programming (AP)", "credits": "2.5", "teacher": "Dr. R. S. Mehta & Dr. J. Bakas"},
            {"code": "MA24202", "type": "Core", "name": "Numerical Methods (NM) Lab", "credits": "1", "teacher": "Department of Mathematics"},
            {"code": "MC24206/7/8/9/10", "type": "Activity (Any One)", "name": "NCC / NSS / PT & Games / Creative Arts / Enterpreneurship", "credits": "1", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 9. CSE B.Tech IV D
    {
        "file_id": 9,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "CS",
            "semester": "IV D",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "DAA (216\nA)", "start": 2, "end": 2},
                {"text": "S & K Lab (Lab 7)", "start": 3, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ],
            "Tuesday": [
                {"text": "NM (220)", "start": 1, "end": 1},
                {"text": "DBMS (220)", "start": 2, "end": 2},
                {"text": "OS (220)", "start": 3, "end": 3},
                {"text": "DAA (220)", "start": 4, "end": 4},
                {"text": "FLAT (T)\n(220)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "IKS (Online Mode)", "start": 7, "end": 8},
                {"text": "NCC/NSS/ PT & Games/ CA/\nES-235", "start": 9, "end": 10}
            ],
            "Wednesday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "", "start": 2, "end": 2},
                {"text": "NM (214)", "start": 3, "end": 3},
                {"text": "NM Lab (Mathematics Dept. Lab)", "start": 4, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "FLAT (ILF)", "start": 8, "end": 8},
                {"text": "DBMS (ILF)", "start": 9, "end": 9},
                {"text": "OS (ILF)", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "AP Lab BT CS IV D (ILF)", "start": 1, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 8},
                {"text": "DAA (ILF)", "start": 9, "end": 9},
                {"text": "FLAT (ILF)", "start": 10, "end": 10}
            ],
            "Friday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "FLAT (ILF)", "start": 2, "end": 2},
                {"text": "OS (ILF)", "start": 3, "end": 3},
                {"text": "DBMS (ILF)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DBMS Lab (Lab 6)", "start": 7, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS24211", "type": "Core", "name": "Data Base Management System", "credits": "3", "teacher": "Dr. Shreeya Swagatika Sahoo"},
            {"code": "CS24213", "type": "Core", "name": "Design and Analysis of Algorithms", "credits": "3", "teacher": "Dr. Kanchan Jha"},
            {"code": "CS24215", "type": "Core", "name": "Operating Systems", "credits": "3", "teacher": "Dr. Rathindra Nath Dutta"},
            {"code": "CS24219", "type": "Core", "name": "Formal Language Automata Theory (FLAT)", "credits": "4", "teacher": "Dr. Md. Shah Fahad"},
            {"code": "MA24201", "type": "Core", "name": "Numerical Methods (NM)", "credits": "2", "teacher": "Department of Mathematics"},
            {"code": "HS24211", "type": "Core", "name": "Indian Knowledge System (IKS)", "credits": "0", "teacher": "Department of Management Studies"},
            {"code": "-", "type": "Elective", "name": "OE - I", "credits": "3", "teacher": "-"},
            {"code": "CS24212", "type": "Core", "name": "Data Base Management System (DBMS) Lab", "credits": "1.5", "teacher": "Dr. Shreeya Swagatika Sahoo"},
            {"code": "CS24216", "type": "Core", "name": "Shell and Kernel (SK) Lab", "credits": "1.5", "teacher": "Dr. Md. S. Fahad & Dr. Komal Naaz"},
            {"code": "CS24218", "type": "Core", "name": "Advanced Programming (AP)", "credits": "2.5", "teacher": "Dr. C. Lavania & Dr. J. Bakas"},
            {"code": "MA24202", "type": "Core", "name": "Numerical Methods (NM) Lab", "credits": "1", "teacher": "Department of Mathematics"},
            {"code": "MC24206/7/8/9/10", "type": "Activity (Any One)", "name": "NCC / NSS / PT & Games / Creative Arts / Enterpreneurship", "credits": "1", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 10. CSE B.Tech IV AIML
    {
        "file_id": 10,
        "metadata": {
            "department": "CSE",
            "program": "B.Tech",
            "branch": "AIML",
            "semester": "IV",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "IAI (G2)", "start": 2, "end": 2},
                {"text": "DBMS Lab (Lab 1)", "start": 3, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "DAA (216 A)", "start": 8, "end": 8},
                {"text": "DBMS (216 A)", "start": 9, "end": 9},
                {"text": "OS (216 A)", "start": 10, "end": 10}
            ],
            "Tuesday": [
                {"text": "", "start": 1, "end": 2},
                {"text": "OS (216 A)", "start": 3, "end": 3},
                {"text": "IAI (216 A)", "start": 4, "end": 4},
                {"text": "DAA (216 A)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "IKS (Online Mode)", "start": 7, "end": 8},
                {"text": "NCC/NSS/ PT & Games/ CA/\nES-235", "start": 9, "end": 10}
            ],
            "Wednesday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "AP Lab (ILF)", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ],
            "Thursday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "OS (216 A)", "start": 2, "end": 2},
                {"text": "DBMS (216 A)", "start": 3, "end": 3},
                {"text": "DBMS (216 A)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "IAI (T) (214)", "start": 7, "end": 7},
                {"text": "NM (214)", "start": 8, "end": 8},
                {"text": "NM Lab", "start": 9, "end": 10}
            ],
            "Friday": [
                {"text": "OE - I", "start": 1, "end": 1},
                {"text": "NM (216 A)", "start": 2, "end": 2},
                {"text": "IAI (216 A)", "start": 3, "end": 3},
                {"text": "DAA (216 A)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "S&KP Lab (Lab 4)", "start": 7, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS24211", "type": "Core", "name": "Data Base Management System", "credits": "3", "teacher": "Dr. V. K. Jha"},
            {"code": "CS24213", "type": "Core", "name": "Design and Analysis of Algorithms", "credits": "3", "teacher": "Dr. Komal Naaz"},
            {"code": "CS24215", "type": "Core", "name": "Operating Systems", "credits": "3", "teacher": "Dr. Md. Shah Fahad"},
            {"code": "AI24211", "type": "Core", "name": "Introduction to AI", "credits": "4", "teacher": "Dr. Itu Snigdh"},
            {"code": "MA24201", "type": "Core", "name": "Numerical Methods (NM)", "credits": "2", "teacher": "Maths Department"},
            {"code": "HS24211", "type": "Core", "name": "Indian Knowledge System (IKS)", "credits": "0", "teacher": "Humainities and Social Sciences Department"},
            {"code": "-", "type": "Elective", "name": "OE - I", "credits": "3", "teacher": "-"},
            {"code": "CS24212", "type": "Core", "name": "Data Base Management System (DBMS) Lab", "credits": "1.5", "teacher": "Dr. V. K. Jha & Dr. Saikat Chakraborty"},
            {"code": "CS24216", "type": "Core", "name": "Shell and Kernel (SK) Lab", "credits": "1.5", "teacher": "Dr. Sandip Dutta & Dr. Md. Shah Fahad"},
            {"code": "CS24218", "type": "Core", "name": "Advanced Programming (AP)", "credits": "2.5", "teacher": "Dr. R. S. Mehta & Dr. Kanchan Jha"},
            {"code": "MA24202", "type": "Core", "name": "Numerical Methods (NM) Lab", "credits": "1", "teacher": "Maths Department"},
            {"code": "MC24206/7/8/9/10", "type": "Activity (Any One)", "name": "NCC / NSS / PT & Games / Creative Arts / Enterpreneurship", "credits": "1", "teacher": "-"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Gautam Sarkhel (07.01.2026)"
        }
    },
    # 11. CSE MCA II
    {
        "file_id": 11,
        "metadata": {
            "department": "CSE",
            "program": "MCA",
            "branch": "MCA",
            "semester": "II",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "", "start": 1, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DMT (216 A) /\nMAI (214)", "start": 7, "end": 7},
                {"text": "DCCN (214)", "start": 8, "end": 8},
                {"text": "ToC (214)", "start": 9, "end": 9},
                {"text": "AoA (214)", "start": 10, "end": 10}
            ],
            "Tuesday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "DCCN Lab (Lab 4)", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "MAI (213)", "start": 7, "end": 7},
                {"text": "SE (214)", "start": 8, "end": 8},
                {"text": "ToC (214)", "start": 9, "end": 9}, # Wait! Let's double check MCA Tuesday period VIII. Is it ToC or AoA?
                # Looking at tuesday: I is empty. II-V DCCN Lab. VI: MAI (213), VII: SE (214), VIII: AoA (214), IX: FMOB(214).
                # Oh, wait! In Tuesday row it was: VIII: AoA (214), IX: FMOB(214). Let's fix that!
                {"text": "AoA (214)", "start": 9, "end": 9},
                {"text": "FMOB (214)", "start": 10, "end": 10}
            ],
            "Wednesday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "ITT&T (Lab 4)", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DCCN (214)", "start": 7, "end": 7},
                {"text": "ToC (214)", "start": 8, "end": 8},
                {"text": "AoA (214)", "start": 9, "end": 9},
                {"text": "DMT (214)", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "ToC (214)", "start": 2, "end": 2},
                {"text": "DCCN (214)", "start": 3, "end": 3},
                {"text": "SE (214)", "start": 4, "end": 4},
                {"text": "FMOB (214)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "SE Lab (Lab 4 )", "start": 7, "end": 10}
            ],
            "Friday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "MAI (214)", "start": 2, "end": 2},
                {"text": "FMOB (214)", "start": 3, "end": 3},
                {"text": "SE (214)", "start": 4, "end": 4},
                {"text": "DMT (213)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "CS - II (219)", "start": 7, "end": 10}
            ]
        },
        "courses": [
            {"code": "CA413", "type": "Core", "name": "Data Communication and Computer Networks (DCCN)", "credits": "3", "teacher": "Dr. Sumit Srivastava"},
            {"code": "CA415", "type": "Core", "name": "Software Engineering Principles (SEP)", "credits": "3", "teacher": "Dr. S. P. Singh"},
            {"code": "CA417", "type": "Core", "name": "Theory of Computation (ToC)", "credits": "3", "teacher": "Dr. Supreeti Kamilya"},
            {"code": "CA419", "type": "Core", "name": "Analysis of Algorithms (AoA)", "credits": "3", "teacher": "Dr. K. Rajnish"},
            {"code": "CA441", "type": "Elective", "name": "Data Mining Techniques (DMT)", "credits": "3", "teacher": "Dr. Debjani Mustafi"},
            {"code": "CA435", "type": "Elective", "name": "Modern AI (MAI)", "credits": "3", "teacher": "Dr. Sudip Kumar Sahana"},
            {"code": "MT114", "type": "HSS", "name": "Fundamentals of Management & Organization Behaviour (FMOB))", "credits": "3", "teacher": "Department of Management"},
            {"code": "CA414", "type": "Core", "name": "Data Communication and Computer Networks Lab (DCCN Lab)", "credits": "1.5", "teacher": "Dr. Sumit Srivastava & Dr. K. K. Senapati"},
            {"code": "CA416", "type": "Core", "name": "Software Engineering Lab (SE Lab)", "credits": "1.5", "teacher": "Dr. S. P. Singh & Mr. Kalyan Samanta"},
            {"code": "CA422", "type": "Core", "name": "IT Tools and Techniques Lab", "credits": "1.5", "teacher": "Dr. Subrajeet Mohapatra & Dr. Lopamudra Hota"},
            {"code": "HS24133", "type": "HSS", "name": "Communication Skills - II", "credits": "1.5", "teacher": "Jyoti Kumari (Humanities and Social Sciences Department)"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Sandeep Singh Solanki (06.01.2026)"
        }
    },
    # 12. CSE M.Tech CS II
    {
        "file_id": 12,
        "metadata": {
            "department": "CSE",
            "program": "M.Tech",
            "branch": "CS",
            "semester": "II",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "OE", "start": 1, "end": 1},
                {"text": "DL (214)", "start": 2, "end": 2},
                {"text": "EC (214)", "start": 3, "end": 3},
                {"text": "", "start": 4, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DAI (220)", "start": 7, "end": 7},
                {"text": "CS - II / 233A", "start": 8, "end": 10}
            ],
            "Tuesday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "DL (216 A)", "start": 2, "end": 2},
                {"text": "", "start": 3, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "NLP (213)", "start": 8, "end": 8},
                {"text": "EC (220)", "start": 9, "end": 9},
                {"text": "DAI (220)", "start": 10, "end": 10}
            ],
            "Wednesday": [
                {"text": "OE", "start": 1, "end": 1},
                {"text": "DL (216 A)", "start": 2, "end": 2},
                {"text": "DAI (216 A)", "start": 3, "end": 3},
                {"text": "EC (216 A)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "NLP (213)", "start": 8, "end": 8},
                {"text": "MOT (213)", "start": 9, "end": 9},
                {"text": "", "start": 10, "end": 10}
            ],
            "Thursday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "Deep Learning Lab (Lab 5)", "start": 2, "end": 4},
                {"text": "MOT (G3)", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ],
            "Friday": [
                {"text": "OE", "start": 1, "end": 1},
                {"text": "Data Analytics Lab (Lab 6)", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "NLP (213)", "start": 8, "end": 8},
                {"text": "MOT (213)", "start": 9, "end": 9},
                {"text": "", "start": 10, "end": 10}
            ]
        },
        "courses": [
            {"code": "CS630", "type": "Elective", "name": "Modern Optimization Techniques (MOT)", "credits": "3", "teacher": "Dr. K. K. Senapati"},
            {"code": "CS631", "type": "Elective", "name": "Deep Learning (DL)", "credits": "3", "teacher": "Dr. K. S. Patnaik"},
            {"code": "CS632", "type": "Elective", "name": "Data Anlysis and Interpretation (DAI)", "credits": "3", "teacher": "Dr. Akriti Nigam"},
            {"code": "CS633", "type": "Elective", "name": "Natural Language Processing (NLP)", "credits": "3", "teacher": "Dr. Komal Naaz"},
            {"code": "HS24133", "type": "HSS", "name": "Communication Skill - II (CS-II)", "credits": "1.5", "teacher": "Dr. Rohit Pandey"},
            {"code": "CS636", "type": "Elective", "name": "Evolutionary Computing", "credits": "3", "teacher": "Dr. Ritesh Jha"},
            {"code": "CS689", "type": "Elective", "name": "Data Analytics Lab (DA Lab)", "credits": "2", "teacher": "Dr. Akriti Nigam"},
            {"code": "CS639", "type": "Elective", "name": "Deep Learning Lab (DL Lab)", "credits": "2", "teacher": "Dr. K. S. Patnaik"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Sandeep Singh Solanki (06.01.2026)"
        }
    },
    # 13. CSE M.Tech AIML II
    {
        "file_id": 13,
        "metadata": {
            "department": "CSE",
            "program": "M.Tech",
            "branch": "AIML",
            "semester": "II",
            "wef_date": "08.01.2026",
            "academic_term": "SPRING 2026",
            "institution": "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": {
            "Monday": [
                {"text": "OE", "start": 1, "end": 1},
                {"text": "CDL (214)", "start": 2, "end": 2},
                {"text": "EC (214)", "start": 3, "end": 3},
                {"text": "", "start": 4, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "DAI (220)", "start": 7, "end": 7},
                {"text": "CS - II / 233A", "start": 8, "end": 10}
            ],
            "Tuesday": [
                {"text": "", "start": 1, "end": 1},
                {"text": "CDL (216 A)", "start": 2, "end": 2},
                {"text": "", "start": 3, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "RL (220)", "start": 7, "end": 7},
                {"text": "MAI (220)", "start": 8, "end": 8},
                {"text": "EC (220)", "start": 9, "end": 9},
                {"text": "DAI (220)", "start": 10, "end": 10}
            ],
            "Wednesday": [
                {"text": "OE", "start": 1, "end": 1},
                {"text": "CDL (216 A)", "start": 2, "end": 2},
                {"text": "DAI (216 A)", "start": 3, "end": 3},
                {"text": "EC (216 A)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 10}
            ],
            "Thursday": [
                {"text": "", "start": 1, "end": 2},
                {"text": "RL (213)", "start": 3, "end": 3},
                {"text": "MAI (213)", "start": 4, "end": 4},
                {"text": "", "start": 5, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "Advanced Deep Learning Lab (Lab 5)", "start": 7, "end": 10}
            ],
            "Friday": [
                {"text": "OE", "start": 1, "end": 1},
                {"text": "Data Analytics Lab (Lab 6)", "start": 2, "end": 5},
                {"text": "LUNCH-BREAK", "start": 6, "end": 6},
                {"text": "", "start": 7, "end": 7},
                {"text": "RL (G3)", "start": 8, "end": 8},
                {"text": "MAI (G3)", "start": 9, "end": 9},
                {"text": "", "start": 10, "end": 10}
            ]
        },
        "courses": [
            {"code": "AI601", "type": "Elective", "name": "Concept of Deep Learning (DL)", "credits": "3", "teacher": "Dr. K. S. Patnaik"},
            {"code": "AI626", "type": "Elective", "name": "Concepts of Reinforcement Learning (RL)", "credits": "3", "teacher": "Dr. Rathindranath Dutta"},
            {"code": "CS632", "type": "Elective", "name": "Data Anlysis and Interpretation (DAI)", "credits": "3", "teacher": "Dr. Akriti Nigam"},
            {"code": "CS636", "type": "Elective", "name": "Evolutionary Computing (EC)", "credits": "3", "teacher": "Dr. Ritesh Jha"},
            {"code": "HS24133", "type": "HSS", "name": "Communication Skill - II (CS-II)", "credits": "1.5", "teacher": "Dr. Rohit Pandey"},
            {"code": "AI602", "type": "Elective", "name": "Modern Artificial Intelligence (MAI)", "credits": "3", "teacher": "Dr. Sanchita Paul"},
            {"code": "CS689", "type": "Elective", "name": "Data Analytics Lab (DA Lab)", "credits": "2", "teacher": "Dr. Kanchan Jha"},
            {"code": "AI622", "type": "Elective", "name": "Advanced Concepts of Deep Learning Lab (DL Lab)", "credits": "2", "teacher": "Dr. Shamama Anwar"}
        ],
        "signatures": {
            "Central Coordinator": "Prem Prakash (06.01.2026)",
            "Department Coordinator": "Shamar (06.01.2026)",
            "HoD": "Signed",
            "Dean": "Dr. Sandeep Singh Solanki (06.01.2026)"
        }
    }
]

# Period Metadata
periods = [
    {"num": "I", "time": "08:00-08:50"},
    {"num": "II", "time": "09:00-09:50"},
    {"num": "III", "time": "10:00-10:50"},
    {"num": "IV", "time": "11:00-11:50"},
    {"num": "V", "time": "12:00-12:50"},
    {"num": "LUNCH", "time": "12:50-13:30"},
    {"num": "VI", "time": "13:30-14:20"},
    {"num": "VII", "time": "14:30-15:20"},
    {"num": "VIII", "time": "15:30-16:20"},
    {"num": "IX", "time": "16:30-17:20"}
]

col_widths = {
    "Days": 12,
    "I": 18,
    "II": 18,
    "III": 18,
    "IV": 18,
    "V": 18,
    "LUNCH": 13,
    "VI": 18,
    "VII": 18,
    "VIII": 18,
    "IX": 18
}

def render_ascii_grid(slots_data):
    # Total cols: Days + 10 slots (including Lunch)
    # We will build lines of character arrays
    lines = []
    # Build header rows
    # Row 1: Period Numbers
    # Row 2: Timings
    header_r1 = f"| {'Days':^10} |"
    header_r2 = f"| {'':^10} |"
    
    for p in periods:
        w = col_widths[p["num"]]
        header_r1 += f" {p['num']:^{w-2}} |"
        header_r2 += f" {p['time']:^{w-2}} |"
        
    sep = "+" + "-"*12 + "+"
    for p in periods:
        sep += "-"*col_widths[p["num"]] + "+"
        
    lines.append(sep)
    lines.append(header_r1)
    lines.append(header_r2)
    lines.append(sep)
    
    # Draw each day
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
        day_slots = slots_data[day]
        # Since slot items can contain newlines, we need to handle multi-line cells!
        # Let's map each of the 10 periods to their corresponding text or merged ranges.
        # Periods are 1 to 10 indices (Lunch is index 6).
        # We can construct a timeline of 10 cells for the day.
        timeline = [None] * 10
        for s in day_slots:
            # s is {"text": "...", "start": start, "end": end}
            # indices in day_slots are 1-indexed. Let's place them in timeline.
            for idx in range(s["start"] - 1, s["end"]):
                timeline[idx] = s
                
        # Now, we need to render the day row. We will do this cell by cell.
        # To handle newlines inside cell texts:
        # We will split text by '\n'. The height of the row is the max number of lines in any cell.
        cell_texts = []
        cell_spans = []
        
        # We process timeline but skip duplicates for merged cells (to output span width)
        i = 0
        while i < 10:
            s = timeline[i]
            if s is None:
                cell_texts.append([""])
                cell_spans.append((i, i))
                i += 1
            else:
                lines_in_text = s["text"].split("\n")
                cell_texts.append(lines_in_text)
                cell_spans.append((s["start"] - 1, s["end"] - 1))
                i = s["end"]
                
        max_height = max(len(t) for t in cell_texts)
        if max_height == 0:
            max_height = 1
            
        # Draw the multi-line row
        for line_no in range(max_height):
            row_str = ""
            if line_no == 0:
                row_str += f"| {day:<10} |"
            else:
                row_str += f"| {'':<10} |"
                
            for cell_idx, (start_idx, end_idx) in enumerate(cell_spans):
                # Calculate span width
                span_width = 0
                for p_idx in range(start_idx, end_idx + 1):
                    p_name = periods[p_idx]["num"]
                    span_width += col_widths[p_name]
                # Adjust for inner separators in span: we add 1 character for each border that was removed
                span_width += (end_idx - start_idx) - 2 # since each slot width includes spaces and | borders
                # Wait, let's calculate the exact width:
                # Column width of p_name includes padding and trailing |
                # The total width of a span of columns (from start_idx to end_idx) is:
                # Sum of col_widths[p_name] for each column in the span.
                # Since each col_widths[p_name] value is the width of the column INCLUDING the | at the end.
                # So if start_idx == end_idx, width is col_widths - 2 (for leading/trailing spaces and border)
                total_w = sum(col_widths[periods[x]["num"]] for x in range(start_idx, end_idx + 1)) - 2
                
                txt_lines = cell_texts[cell_idx]
                if line_no < len(txt_lines):
                    val = txt_lines[line_no]
                else:
                    val = ""
                row_str += f" {val:^{total_w}} |"
            lines.append(row_str)
        lines.append(sep)
        
    return "\n".join(lines)

# Generate txt files
for tt in timetables:
    file_id = tt["file_id"]
    m = tt["metadata"]
    filename = f"txt{file_id}.txt"
    filepath = os.path.join(output_dir, filename)
    
    # Render ASCII
    ascii_table = render_ascii_grid(tt["slots"])
    
    # Render Courses
    course_list_str = f"{'Course Code':<15} | {'Course Type':<15} | {'Course Name':<60} | {'Credit':<8} | {'Teacher':<40}\n"
    course_list_str += "-"*148 + "\n"
    for c in tt["courses"]:
        course_list_str += f"{c['code']:<15} | {c['type']:<15} | {c['name']:<60} | {c['credits']:<8} | {c['teacher']:<40}\n"
        
    # Render Database Schema
    schema_str = """-- TIMETABLE DATABASE SCHEMA PROPOSAL
-- To create the backend structures for storing and querying timetable data.

CREATE TABLE IF NOT EXISTS timetable_metadata (
    timetable_id INT PRIMARY KEY,
    institution VARCHAR(255),
    academic_term VARCHAR(50),
    department VARCHAR(50),
    program VARCHAR(50),
    branch VARCHAR(50),
    semester VARCHAR(50),
    wef_date DATE
);

CREATE TABLE IF NOT EXISTS courses (
    course_code VARCHAR(20),
    timetable_id INT,
    course_type VARCHAR(50),
    course_name VARCHAR(255),
    credits VARCHAR(10),
    teacher VARCHAR(255),
    PRIMARY KEY (course_code, timetable_id),
    FOREIGN KEY (timetable_id) REFERENCES timetable_metadata(timetable_id)
);

CREATE TABLE IF NOT EXISTS timetable_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    timetable_id INT,
    day_of_week VARCHAR(15),
    period_name VARCHAR(5),
    time_range VARCHAR(30),
    subject_details VARCHAR(255),
    FOREIGN KEY (timetable_id) REFERENCES timetable_metadata(timetable_id)
);
"""

    # Generate SQL inserts for this file
    wef_iso = "-".join(reversed(m["wef_date"].split("."))) # 08.01.2026 -> 2026-01-08
    sql_inserts = f"""-- SQL INSERT STATEMENTS FOR THIS TIMETABLE
INSERT INTO timetable_metadata (timetable_id, institution, academic_term, department, program, branch, semester, wef_date)
VALUES ({file_id}, '{m["institution"]}', '{m["academic_term"]}', '{m["department"]}', '{m["program"]}', '{m["branch"]}', '{m["semester"]}', '{wef_iso}');

-- Course Details Inserts
"""
    for c in tt["courses"]:
        c_name = c['name'].replace("'", "''")
        c_teacher = c['teacher'].replace("'", "''")
        sql_inserts += f"INSERT INTO courses (course_code, timetable_id, course_type, course_name, credits, teacher) VALUES ('{c['code']}', {file_id}, '{c['type']}', '{c_name}', '{c['credits']}', '{c_teacher}');\n"
        
    sql_inserts += "\n-- Timetable Slots Inserts\n"
    slot_id_counter = 1
    for day in tt["days"]:
        # Map indices to period names and ranges
        day_slots = tt["slots"][day]
        # Flatten periods so we insert one record per slot period
        for s in day_slots:
            if s["text"] == "" or s["text"] == "LUNCH-BREAK":
                continue
            # Insert for each period in span
            for p_idx in range(s["start"] - 1, s["end"]):
                p = periods[p_idx]
                clean_text = s["text"].replace("\n", " ").replace("'", "''")
                sql_inserts += f"INSERT INTO timetable_slots (timetable_id, day_of_week, period_name, time_range, subject_details) VALUES ({file_id}, '{day}', '{p['num']}', '{p['time']}', '{clean_text}');\n"
                
    # Signature Section
    sig_str = "SIGNATURES & APPROVALS:\n"
    for title, sig in tt["signatures"].items():
        sig_str += f"- {title}: {sig}\n"
        
    # Build complete text content
    content = f"""================================================================================
{m["institution"]}
{m["academic_term"]} - STUDENT TIME TABLE (Effective from {m["wef_date"]})
================================================================================

METADATA:
--------------------------------------------------------------------------------
Department : {m["department"]}
Program    : {m["program"]}
Branch     : {m["branch"]}
Semester   : {m["semester"]}
W.E.F Date : {m["wef_date"]}
Academic   : {m["academic_term"]}
--------------------------------------------------------------------------------

TIMETABLE GRID:
{ascii_table}

COURSE LIST DETAILS:
{course_list_str}

{sig_str}

DATA SCHEMA DEFINITION:
--------------------------------------------------------------------------------
Attributes, Row, and Column mapping:
1. timetable_metadata:
   - Rows: 1 per Timetable (ID: {file_id})
   - Columns: timetable_id, institution, academic_term, department, program, branch, semester, wef_date
2. courses:
   - Rows: {len(tt["courses"])} course categories
   - Columns: course_code, timetable_id, course_type, course_name, credits, teacher
3. timetable_slots:
   - Columns: slot_id, timetable_id, day_of_week, period_name, time_range, subject_details
--------------------------------------------------------------------------------

SQL DATABASE SCRIPTS:
--------------------------------------------------------------------------------
{schema_str}

{sql_inserts}
--------------------------------------------------------------------------------
"""

    with open(filepath, "w") as f:
        f.write(content)
    print(f"Successfully generated {filename} at {filepath}")
