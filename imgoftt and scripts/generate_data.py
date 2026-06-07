import os
import pandas as pd
from generate_timetables import timetables

def main():
    print("Generating CSV and Excel data...")
    
    # 1. Extract Departments
    departments = set()
    branches = set()
    courses = []
    faculty = set()
    rooms = set()
    
    # Track seen to avoid strict duplicates
    seen_courses = set()
    
    for tt in timetables:
        meta = tt['metadata']
        dept = meta['department']
        branch = meta['branch']
        program = meta['program']
        
        # Mapping short codes to names
        dept_name = "Computer Science & Engineering" if dept == "CSE" else dept
        departments.add((dept_name, dept))
        
        branches.add((branch, program, dept))
        
        for c in tt['courses']:
            code = c['code']
            if code not in seen_courses and code != "-":
                courses.append({
                    "code": code,
                    "name": c['name'],
                    "credits": c['credits'],
                    "type": c['type'],
                    "branch": branch,
                    "department": dept,
                    "semester": meta['semester']
                })
                seen_courses.add(code)
                
                # Split multiple teachers
                teachers = str(c['teacher']).split(" & ")
                for t in teachers:
                    t = t.strip()
                    if t and t != "-":
                        # remove "(Group X)" from names
                        t = t.split(" (Group")[0]
                        t = t.split(" (Department")[0]
                        faculty.add((t, f"{t.lower().replace(' ', '.').replace('prof.', '').replace('dr.', '')}@bitmesra.ac.in", dept))
    
    # Rooms extraction from slots
    for tt in timetables:
        for day, slots in tt['slots'].items():
            for slot in slots:
                text = slot['text']
                if "Lab" in text:
                    room_type = "lab"
                else:
                    room_type = "classroom"
                    
                # Very rough heuristic to extract room names (like "219", "220", "Lab 1")
                # In real scenario we'd use regex. For now just some manual mapping:
                if "219" in text: rooms.add(("219", dept, 60, room_type))
                if "220" in text: rooms.add(("220", dept, 60, room_type))
                if "Lab 1" in text: rooms.add(("Lab 1", dept, 30, "lab"))
                if "Lab 3" in text: rooms.add(("Lab 3", dept, 30, "lab"))
                if "Lab 4" in text: rooms.add(("Lab 4", dept, 30, "lab"))
                if "Lab 6" in text: rooms.add(("Lab 6", dept, 30, "lab"))
                if "Lab 7" in text: rooms.add(("Lab 7", dept, 30, "lab"))

    output_dir = "/Users/jattu/Desktop/admin_samayak/data_exports"
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Departments
    df_dept = pd.DataFrame(list(departments), columns=["name", "shortCode"])
    df_dept.to_csv(os.path.join(output_dir, "departments.csv"), index=False)
    
    # 2. Branches
    df_branch = pd.DataFrame(list(branches), columns=["name", "program", "departmentShortCode"])
    df_branch.to_csv(os.path.join(output_dir, "branches.csv"), index=False)
    
    # 3. Courses
    df_courses = pd.DataFrame(courses)
    df_courses.to_csv(os.path.join(output_dir, "courses.csv"), index=False)
    
    # 4. Faculty
    df_faculty = pd.DataFrame(list(faculty), columns=["name", "email", "departmentShortCode"])
    df_faculty.to_csv(os.path.join(output_dir, "faculty.csv"), index=False)
    
    # 5. Rooms
    df_rooms = pd.DataFrame(list(rooms), columns=["number", "departmentShortCode", "capacity", "type"])
    df_rooms.to_csv(os.path.join(output_dir, "rooms.csv"), index=False)
    
    # Write Excel
    with pd.ExcelWriter(os.path.join(output_dir, "samayak_data.xlsx")) as writer:
        df_dept.to_excel(writer, sheet_name="Departments", index=False)
        df_branch.to_excel(writer, sheet_name="Branches", index=False)
        df_rooms.to_excel(writer, sheet_name="Rooms", index=False)
        df_courses.to_excel(writer, sheet_name="Courses", index=False)
        df_faculty.to_excel(writer, sheet_name="Faculty", index=False)
        
    print(f"Data generated in {output_dir}")

if __name__ == "__main__":
    main()
